#!/bin/bash

# This script loads the Helm cloud builder into the GCP Cloud Registry for use in cloudbuild.yaml.  It downloads all community builders to a created directory, then builds and pushes the Helm cloud builder, and finally deletes the downloaded directory.  You can set the version of Helm below.


echo 'A directory named "cloud-builders-community" will be created but should be deleted before this script exits'

# Set HELM_VERSION to the latest helm release
HELM_VERSION=3.3.1

# Download all community cloud-builers to ./cloud-builders-community
git clone https://github.com/GoogleCloudPlatform/cloud-builders-community.git

# Change to the directory containing Helm cloudbuilder
cd cloud-builders-community/helm || { echo "Download directory fail"; exit 1; }

# Use the provided cloudbuild.yaml to build the Helm cloudbuilder and push it to the project GCP cloud registry
gcloud builds submit \
. \
--config=cloudbuild.yaml \
--substitutions=_HELM_VERSION=$HELM_VERSION

# Delete the downloaded directory
cd ../.. || { echo "Change directory fail"; exit 1; }
rm -rf ./cloud-builders-community
