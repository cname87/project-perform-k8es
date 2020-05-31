#!/usr/bin/env bash

# Variables for resources that were initialized above the Setup section.
PROJECT=$(gcloud config get-value project)
APPLICATION=ppk8es
BACKEND_APPLICATION=pp-backend
FRONTEND_APPLICATION=pp-frontend
BACKEND_VERSION=v1.0.0
FRONTEND_VERSION=v1.0.0
CLUSTER=${APPLICATION}-cluster
ZONE=$(gcloud config get-value compute/zone)
NAMESPACE=default
BUCKET=gs://project-perform-k8es-config-files

# Run build, replacing substitution variables.
# Run locally or on the cloud by commenting/uncommenting.


# gcloud builds submit \
cloud-build-local \
--dryrun=false \
--config=cloudbuild.yaml \
--substitutions=\
_BACKEND_IMAGE=gcr.io/"$PROJECT"/$BACKEND_APPLICATION,\
_FRONTEND_IMAGE=gcr.io/"$PROJECT"/$FRONTEND_APPLICATION,\
_BACKEND_VERSION=$BACKEND_VERSION,\
_FRONTEND_VERSION=$FRONTEND_VERSION,\
_GKE_CLUSTER="$CLUSTER",\
_GKE_ZONE="$ZONE",\
_K8S_APP_NAME="$APPLICATION",\
_K8S_NAMESPACE=$NAMESPACE,\
_OUTPUT_PATH=$BUCKET \
.
