#!/usr/bin/env bash

# This script installs or upgrades a cluster with the application Helm chart.


# Read in variables
# Get the directory containing this script and source the set-variables script - enure the set-variables script is on the configured path
SCRIPT_DIR="${0%/*}"
# shellcheck source=/dev/null
source "$SCRIPT_DIR"/set-variables.sh

# If there is a '-p' option in the command line then upgrade the production cluster
# If there is a '-t' option in the command line then upgrade the test cluster
# If there is no option, or any other option, in the command line then upgrade a test cluster
CONTEXT="${TEST_CONTEXT}" ; CLUSTER_NAME="${TEST_CLUSTER_NAME}"
while getopts pt option
do
case "${option}"
in
p) CONTEXT="${PROD_CONTEXT}" ; CLUSTER_NAME="${PROD_CLUSTER_NAME}";;
t) CONTEXT="${TEST_CONTEXT}" ; CLUSTER_NAME="${TEST_CLUSTER_NAME}";;
*) CONTEXT="${TEST_CONTEXT}" ; CLUSTER_NAME="${TEST_CLUSTER_NAME}";;
esac
done

# Utility confirm function
function confirm(){
  echo -e "Run with -t to upgrade the 'test' cluster or with -p to upgrade the production cluster."
  echo -e "No option, or any other option, will upgrade the test cluster."
  echo -e "The cluster name ends in 'test', or 'prod', upgrading the test or production cluster respectively\n"
  echo -e "NOTE: If the application chart is installed on both clusters then the ingress on the first one installed will use the configured static ip address and the other will fail to create an ingress.  Therefore create the production cluster before the test cluster - the test cluster cn be accessed via localhost so doesn;t neeed an ingress.\n"
 read -r -s -n 1 -p "Press any key to cornfirm or CTRL-C to cancel..."
 echo ""
}

echo -e "\nThe cluster to be upgraded is ${CLUSTER_NAME}\n"
confirm

echo -e "\nSet the current kubeconfig context to ${CONTEXT}\n"
kubectl config use-context "${CONTEXT}"

echo -e "\nInstall or upgrade the cluster to the release ${CONTEXT}\n"
helm upgrade --install --wait "${HELM_RELEASE}" "${SCRIPT_DIR}"/../../project-perform-k8es-cd/pp-chart

echo -e "\nRunning kubectl get all...\n"
kubectl get all

if [ "${CONTEXT}" = "${TEST_CONTEXT}" ]
then
  # The port forwards will be run in the background. Run 'ps -aux | grep kubectl' to find the process numbers and then run 'kill xxx' to kill the process.
  echo -e "\n Forwarding port on frontend service to localhost:8080\n"
  kubectl port-forward \
  service/project-perform-pp-chart-frontend-service 8080:80 &
  echo -e "\n Forwarding port on backend service to localhost:8081"
  kubectl port-forward \
  service/project-perform-pp-chart-backend-service 8081:80 &
fi
