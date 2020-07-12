#!/usr/bin/env bash

# Runs the cloudbuild.yaml file in the same directory as this file.
# It runs the cloud build either remotely on GCP or locally. When run locally it can be run as a dryrun or not.


# Read in variables
# Get the directory containing this script and source the set-variables script - enure the set-variables script is on the configured path
SCRIPT_DIR="${0%/*}"
# shellcheck source=/dev/null
source "$SCRIPT_DIR"/utils-build/set-variables.sh

# If there is a '-r' option in the command line then run a remote run on GCP
# If there is a '-d' option in the command line then set to run a local dry run
# If neither '-r' nor 'd' is present then run a local run
COMMAND="cloud-build-local --dryrun=false"
while getopts rd option
do
case "${option}"
in
r) COMMAND="gcloud builds submit" && SUFFIX="cli-cloud";;
d) COMMAND="cloud-build-local --dryrun=true" && SUFFIX="cli-dryrun";;
*) COMMAND="cloud-build-local --dryrun=false" && SUFFIX="cli-local";;
esac
done

echo -e "\nSetting frontend and backend versions\n"
# Change before each run so git has something to commit
# If you use a tag that is in the registry you can comment out the install and build steps in the cloudbuild.yaml
BACKEND_VERSION=test6
FRONTEND_VERSION=test6
echo "BACKEND_VERSION: ${BACKEND_VERSION}"
echo "FRONTEND_VERSION: ${FRONTEND_VERSION}"

echo -e "\nSetting the cluster\n"
CLUSTER_NAME=$PROD_CLUSTER_NAME
echo "Cluster name: ${CLUSTER_NAME}"

COMMAND="$COMMAND \
--config=../cloudbuild.yaml \
--substitutions=\
_GKE_CLUSTER=$CLUSTER_NAME,\
_GKE_ZONE=$ZONE,\
_BACKEND_IMAGE=gcr.io/$PROJECT/$BACKEND_APPLICATION,\
_FRONTEND_IMAGE=gcr.io/$PROJECT/$FRONTEND_APPLICATION,\
_BACKEND_VERSION=$BACKEND_VERSION,\
_FRONTEND_VERSION=$FRONTEND_VERSION,\
_REPO=${REPO},\
_BUILD_TAG=${APPLICATION}_${SUFFIX} \
.."
$COMMAND
