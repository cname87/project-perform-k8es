#!/usr/bin/env bash

# Runs the cloudbuild.yaml file in the same directory as this file.
# It runs the cloud build either remotely on GCP or locally. When run locally it can be run as a dryrun or not.
# It deploys to the Kubernetes test cluster (unless you manually edit this file to point to the production cluster).
# You need to change the backend and frontend versions between each run as otherwise the pp-chart is unchanged and the git check in cloudbuild.yaml step will fail as it sees no change to check in.


# Read in variables
# Get the directory containing this script and source the set-variables script - enure the set-variables script is on the configured path
echo -e "\nReading in variables..."
SCRIPT_DIR="${0%/*}"
# shellcheck source=/dev/null
source "$SCRIPT_DIR"/set-variables.sh

# If there is a '-r' option in the command line then run a remote run on GCP
# If there is a '-d' option in the command line then set to run a local dry run
# If neither '-r' nor 'd' is present then run a local run
COMMAND="cloud-build-local --dryrun=false"
while getopts rd option
do
case "${option}"
in
r) COMMAND="gcloud builds submit" && SUFFIX="cli-cloud" && CLUSTER_NAME=$TEST_CLUSTER_NAME;;
d) COMMAND="cloud-build-local --dryrun=true" && SUFFIX="cli-dryrun" &&CLUSTER_NAME=$TEST_CLUSTER_NAME;;
*) COMMAND="cloud-build-local --dryrun=false" && SUFFIX="cli-local" && CLUSTER_NAME=$TEST_CLUSTER_NAME;;
esac
done

echo -e "\nSetting frontend and backend versions:"
echo -e "\nChange before each test run"
# Change before each test run so git has something to commit
# If you use a tag that is in the registry you can comment out the install and build steps in the cloudbuild.yaml
BACKEND_VERSION=test6
FRONTEND_VERSION=test6
echo "BACKEND_VERSION: ${BACKEND_VERSION}"
echo "FRONTEND_VERSION: ${FRONTEND_VERSION}"

echo -e "\nCluster name: ${CLUSTER_NAME}\n"

COMMAND="$COMMAND \
--config=${SCRIPT_DIR}/../cloudbuild.yaml \
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
