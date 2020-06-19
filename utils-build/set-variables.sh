#!/usr/bin/env bash

# This sets up all variables needed in the cluster setup and teardown scripts, and in the cloubbuild run script.

PROJECT=$(gcloud config get-value project)
export PROJECT
export APPLICATION=ppk8es
export BACKEND_APPLICATION=pp-backend
export FRONTEND_APPLICATION=pp-frontend
export BACKEND_VERSION=v1.0.1
export FRONTEND_VERSION=v1.0.1
export CLUSTER=${APPLICATION}-cluster
ZONE=$(gcloud config get-value compute/zone)
export ZONE
REGION=$(gcloud config get-value compute/region)
export REGION
export NAMESPACE=default
export STATIC_IP_NAME=pp-ip
# The name of the ingress from Helm chart
export INGRESS=project-perform-pp-chart-app-ingress
# Date-time for image tagging
DATE_TIME=$(date +%F-%H-%M-%S)
export DATE_TIME
