#!/usr/bin/env bash

# This script uninstalls the application Helm chart from a cluster
# A -p flag upgrades the cluster named ${PROD_CLUSTER_NAME}

# Read in variables
# Get the directory containing this script and source the set-variables script - ensure the set-variables script is on the configured path
SCRIPT_DIR="${0%/*}"
# The following avoids an eror when using shellcheck to lint this script
# shellcheck source=/dev/null
source "$SCRIPT_DIR"/set-variables.sh

# If there is no option in the command line then upgrade a test cluster
CONTEXT="${TEST_CONTEXT}" ; CLUSTER_NAME="${TEST_CLUSTER_NAME}"
while getopts pt option
do
case "${option}"
in
# If there is a '-p' option in the command line then upgrade the production cluster
p) CONTEXT="${PROD_CONTEXT}" ; CLUSTER_NAME="${PROD_CLUSTER_NAME}";;
# If there is a '-t' option in the command line then upgrade the test cluster
t) CONTEXT="${TEST_CONTEXT}" ; CLUSTER_NAME="${TEST_CLUSTER_NAME}";;
# If there is an invalid option in the command line then upgrade a test cluster
*) CONTEXT="${TEST_CONTEXT}" ; CLUSTER_NAME="${TEST_CLUSTER_NAME}";;
esac
done

# Utility confirm function
function confirm(){
  echo -e "The cluster name ends in 'test', or 'prod', uninstalling from the test or production cluster respectively.\n"
  echo -e "Run with -t to uninstall from the 'test' cluster or with -p to uninstall from the production cluster."
  echo -e "No option, or any other option, will unintsall from the test cluster.\n"
 read -r -s -n 1 -p "Press any key to confirm or CTRL-C to cancel..."
 echo ""
}

echo -e "\nThe cluster from which the application will be uninstalled is ${CLUSTER_NAME}\n"
confirm

echo -e "\nUninstalling ${HELM_RELEASE}\n"
helm uninstall "${HELM_RELEASE}"

echo -e "\nDeleting all services\n"
kubectl delete service --all

if [ "${CONTEXT}" = "${TEST_CONTEXT}" ]
then
  # Kill all port forwards that may be running in the background.
  echo -e "\nKilling all port forwards on the test cluster\n"
  kill $(ps aux | grep '[p]ort-forward' | awk '{print $2}')
fi

echo -e "\nIt takes a few minutes to uninstall - run 'kubectl get all' to confirm the uninstall is complete.\n"
