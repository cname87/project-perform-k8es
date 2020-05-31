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

echo -e "\nResetting Kubectl configuration file\n"
cat <<EOF > ~/.kube/config
apiVersion: v1
clusters: []
contexts: []
current-context: ""
kind: Config
preferences: {}
users: []
EOF

echo -e "\nCreating cluster\n"
# Using smallest CPU, pre-emptible VMs, with 32GB boot disk (as opposed to default 100GB)
gcloud container clusters create ${CLUSTER} \
--project="${PROJECT}" \
--zone="${ZONE}" \
--cluster-version=1.16.8-gke.15 \
--machine-type=g1-small \
--preemptible \
--disk-size=32 \
--scopes=cloud-platform,storage-rw,gke-default \
--enable-ip-alias \
--num-nodes=3 \
--quiet

echo -e "\nGetting credentials\n"
gcloud container clusters get-credentials ${CLUSTER}

echo -e "\nConfirming cluster is running\n"
gcloud container clusters list

echo -e "\nConfirming connection to cluster\n"
kubectl cluster-info

# Note: It is assumed all required GCP APIs are enabled and have appropriate permissions on the cluster, i.e. ...
# - Cloud Build API is enabled
# - Cloud Build service account has access to your project's clusters - grant it the Kubernetes Engine Developer Role

# If already created, a non-fatal error will be returned
echo -e "\nCreating a bucket to store gke-deploy Kubernetes configurations\n"
gsutil mb -p "$PROJECT" gs://$BUCKET

# If already created, an error will be returned but the ip address will be listed
echo -e "\nReserving and listing a global static ip address\n"
gcloud compute addresses create ${STATIC_IP_NAME} --global
gcloud compute addresses describe ${STATIC_IP_NAME} --global

# Can choose to run Skaffold to load the application on to the cluster
# ./skaffold-run.sh
