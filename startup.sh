#!/usr/bin/env bash

echo -e "\nSetting up cluster configuration parameters\n"

# List the GCP project parameters - this assumes that the GCP project is set up
PROJECT=$(gcloud config get-value project)
echo "Project: $PROJECT"
REGION=$(gcloud config get-value compute/region)
echo "Region: $REGION"
ZONE=$(gcloud config get-value compute/zone)
echo "Zone: $ZONE"

# The application project name: ppk8es
APPLICATION=ppk8es
# Name the cluster
CLUSTER=${APPLICATION}-cluster
# The name of the reserved static ip address
STATIC_IP_NAME=pp-ip
# The name of the gs bucket to store config files
BUCKET=project-perform-k8es-config-files

echo -e "\nCreating cluster\n"
# Using smallest CPU, pre-emptible VMs, with 32GB boot disk (as opposed to default 100GB)
gcloud container clusters create ${CLUSTER} \
--project="${PROJECT}" \
--zone="${ZONE}" \
--machine-type=g1-small \
--preemptible \
--disk-size=32 \
--scopes=cloud-platform, storage-full \
--enable-ip-alias \
--num-nodes=3 \
--quiet

echo -e "\nConfirm cluster is running\n"
gcloud container clusters list

echo -e "\nGet credentials\n"
gcloud container clusters get-credentials ${CLUSTER} \
--zone "${ZONE}"

echo -e "\nConfirm connection to cluster\n"
kubectl cluster-info

# Note: It is assumed all required GCP APIs are enabled and have appropriate permissions on the cluster

# Create a bucket that will be used to store the Kubernetes configurations, suggested and expanded, by gke-deploy
gsutil mb -p "$PROJECT" gs://$BUCKET

echo -e "\nReserve and list a global static ip address\n"
gcloud compute addresses create ${STATIC_IP_NAME} --global
gcloud compute addresses describe ${STATIC_IP_NAME} --global
