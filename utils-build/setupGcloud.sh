#!/usr/bin/env bash


PROJECT="project-perform"
REGION="europe-west2"
ZONE="europe-west2-c"

gcloud config set project ${PROJECT}
export PROJECT
gcloud config set compute/region ${REGION}
export REGION
gcloud config set compute/zone $ZONE

echo -e "PROJECT is $(gcloud config get-value project)"
echo -e "REGION is $(gcloud config get-value compute/region)"
echo -e "ZONE is $(gcloud config get-value compute/zone)"
