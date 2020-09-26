#!/usr/bin/env bash

# This sets up a Kubernetes cluster on GKE.

# Read in variables
# Get the directory containing this script and source the set-variables script - enure the set-variables script is on the configured path
SCRIPT_DIR="${0%/*}"
# shellcheck source=/dev/null
source "$SCRIPT_DIR"/set-variables.sh

# If there is no option in the command line then create a test cluster
CLUSTER_NAME="${TEST_CLUSTER_NAME}"
while getopts p option
do
case "${option}"
in
# If there is a '-p' option in the command line then create the production cluster
p) CLUSTER_NAME="${PROD_CLUSTER_NAME}";;
# If there is an invalid option in the command line then create a test cluster
*) CLUSTER_NAME="${TEST_CLUSTER_NAME}";;
esac
done

# Utility confirm function
function confirm(){
  echo -e "Run with -t to create the 'test' cluster or with -p to create the production cluster."
  echo -e "No option, or any other option, will create the test cluster."
  echo -e "The name ends in 'test', or 'prod', creating the test or production cluster respectively\n"
  read -r -s -n 1 -p "Press any key to confirm or CTRL-C to cancel..."
  echo ""
}

echo -e "\nThe cluster to be created is ${CLUSTER_NAME}\n"
confirm

# List the GCP project parameters - this assumes that the GCP project is set up
echo "Project: $PROJECT"
echo "Region: $REGION"
echo "Zone: $ZONE"

echo -e "\nCreating cluster ${CLUSTER_NAME}\n"
# Using smallest CPU, pre-emptible VMs, with 32GB boot disk (as opposed to default 100GB)
gcloud container clusters create "${CLUSTER_NAME}" \
--project="${PROJECT}" \
--zone="${ZONE}" \
--machine-type=g1-small \
--preemptible \
--disk-size=32 \
--scopes=cloud-platform,storage-rw,gke-default \
--enable-ip-alias \
--num-nodes=3 \
--quiet

echo -e "\nUpdate kubeconfig with cluster credentials"
echo -e "The kubeconfig current context is set to this conext.\n"
gcloud container clusters get-credentials "${CLUSTER_NAME}"

echo -e "\nConfirming cluster is running\n"
gcloud container clusters list

echo -e "\nConfirming connection to cluster\n"
kubectl cluster-info

# Note: It is assumed all required GCP APIs are enabled and have appropriate permissions on the cluster, i.e. ...
# - Cloud Build
 API is enabled
# - Cloud Build service account has access to your project's clusters - grant it the Kubernetes Engine Developer Role

# If already created, an error will be returned but the ip address will be listed
echo -e "\nReserving and listing a global static ip address\n"
gcloud compute addresses create "${STATIC_IP_NAME}" --global
gcloud compute addresses describe "${STATIC_IP_NAME}" --global
