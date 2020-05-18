#!/usr/bin/env bash

# The application project name: ppk8es
APPLICATION=ppk8es
# Name the cluster
CLUSTER_NAME=${APPLICATION}-cluster
# The name of the reserved static ip address
# STATIC_IP_NAME=pp-ip

# echo -e "\nDelete static ip address\n"
# gcloud compute addresses delete ${STATIC_IP_NAME} --global --quiet

echo -e "\nRemove cluster\n"
gcloud container clusters delete ${CLUSTER_NAME} --quiet
gcloud container clusters list

# echo "Remove container"
# gcloud container images delete gcr.io/${GCLOUD_PROJECT}/${CONTAINER_NAME} # --force-delete-tags --quiet
