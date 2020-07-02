#!/usr/bin/env bash

# Runs the cloudbuild.yaml file in the same directory as this file.
# It runs the cloud build either remotely on GCP or locally. When run locally it can be run as a dryrun or not.


# Read in variables
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
r) COMMAND="gcloud builds submit";;
d) COMMAND="cloud-build-local --dryrun=true";;
*) COMMAND="cloud-build-local --dryrun=false";;
esac
done

echo -e "\nSetting frontend and backend versions\n"
BACKEND_VERSION=latest
FRONTEND_VERSION=latest

echo -e "\nRunning ${COMMAND}\n"

# Compose and run the command
COMMAND="$COMMAND \
--config=cloudbuild.yaml \
--substitutions=\
_BACKEND_IMAGE=gcr.io/$PROJECT/$BACKEND_APPLICATION,\
_FRONTEND_IMAGE=gcr.io/$PROJECT/$FRONTEND_APPLICATION,\
_BACKEND_VERSION=$BACKEND_VERSION,\
_FRONTEND_VERSION=$FRONTEND_VERSION,\
_CD_REPO=${CD_REPO},\
_BUILD_TAG=${APPLICATION}_CI \
."
$COMMAND
