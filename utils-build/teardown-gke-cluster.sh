#!/usr/bin/env bash

# This deletes a Kubernetes cluster on GKE.

# Read in variables
# Get the directory containing this script and source the set-variables script - enure the set-variables script is on the configured path
SCRIPT_DIR="${0%/*}"
# shellcheck source=/dev/null
source "$SCRIPT_DIR"/set-variables.sh

# If there is no option in the command line then no cluster will be deleted
CLUSTER_NAME="non-existent"
while getopts pt option
do
case "${option}"
in
# If there is a '-p' option in the command line then delete the production cluster
p) CLUSTER_NAME="${PROD_CLUSTER_NAME}";;
# If there is '-t' option in the command line then delete the test cluster
t) CLUSTER_NAME="${TEST_CLUSTER_NAME}";;
# If there isr any other option in the command line then no cluster will be deleted
*) CLUSTER_NAME="non-existent";;
esac
done

# Utility confirm function
function confirm(){
 echo -e "Run with -t to delete the 'test' cluster or with -p to delete the production cluster."
 echo -e "No option, or any other option, will attempt to delete a non-existent cluster."
 read -r -s -n 1 -p "Press any key to confirm or CTRL-C to cancel..."
 echo ""
}

# Utility pause and check function
function check(){
 read -r -s -n 1 -p "Go to https://console.cloud.google.com/net-services/loadbalancing/loadBalancers/list?project=project-perform and confirm all loadbalancer resources are deleted and then press any key..."
 echo ""
}

echo -e "\nThe cluster to be deleted is ${CLUSTER_NAME}\n"
confirm

echo -e "\nDelete ingress and loadbalancer - may return error if already deleted\n"
kubectl delete ingress "${INGRESS}"

echo -e "\nManually confirm that the loadbalancer resources are deleted\n"
check

# Uncomment to delete static ip address during teardown
# echo -e "\nDelete static ip address\n"
# gcloud compute addresses delete ${STATIC_IP_NAME} --global --quiet

echo -e "\nDelete cluster\n"
gcloud container clusters delete "${CLUSTER_NAME}" --quiet

echo -e "\nList remaining clusters\n"
gcloud container clusters list

# The associated kubeconfig context is automatically deleted
