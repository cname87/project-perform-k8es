#!/usr/bin/env bash

# This sets up all variables needed in the cluster setup and teardown scripts, and in the cloubbuild run script.

PROJECT=$(gcloud config get-value project)
export PROJECT
ZONE=$(gcloud config get-value compute/zone)
export ZONE
REGION=$(gcloud config get-value compute/region)
export REGION

export APPLICATION=ppk8es
export PROD_CLUSTER_NAME=${APPLICATION}-cluster-prod
export TEST_CLUSTER_NAME=${APPLICATION}-cluster-test
export PROD_CONTEXT=gke_${PROJECT}_${ZONE}_${PROD_CLUSTER_NAME}
export TEST_CONTEXT=gke_${PROJECT}_${ZONE}_${TEST_CLUSTER_NAME}

export HELM_RELEASE=project-perform
export BACKEND_APPLICATION=pp-backend
export FRONTEND_APPLICATION=pp-frontend
export BACKEND_VERSION=v1.0.1
export FRONTEND_VERSION=v1.0.1
export NAMESPACE=default

export STATIC_IP_NAME=pp-ip
# The name of the ingress from Helm chart
export INGRESS=project-perform-pp-chart-app-ingress
