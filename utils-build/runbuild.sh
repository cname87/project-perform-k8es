#!/usr/bin/env bash

# Runs a cloudbuild.yaml file in a configured path.
# It runs the cloud build either remotely on GCP or locally. When run locally it can be run as a dryrun or not.
# It deploys to the Kubernetes test cluster unless -p is passed in on the command line in which case it deploys to the production cluster.
# You need to change the backend and frontend versions between each run as otherwise the pp-chart is unchanged and the git check in cloudbuild.yaml step will fail as it sees no change to check in.


# Read in variables
# Get the directory containing this script and source the set-variables script - ensure the set-variables script is in the configured path
echo -e "\nReading in variables..."
SCRIPT_DIR="${0%/*}"
# shellcheck source=/dev/null
source "$SCRIPT_DIR"/set-variables.sh

# The default cluster is the test cluster
CLUSTER_NAME=$TEST_CLUSTER_NAME

# If an option setting the type of build is not present then run a build remotely on GCP
COMMAND="cloud-build-local --dryrun=false"
SUFFIX="cli-cloud"
# Change before each test run so git has something to commit, i.e. if git attempts to commit the version that is already there the build will fail
# If you use a tag that is in the registry you can comment out the install and build steps in the cloudbuild.yaml file
BACKEND_VERSION=testA
FRONTEND_VERSION=testA

while getopts pbld option
do
case "${option}"
in
# If there is a '-p' option in the command line then set the cluster to be the production cluster
p) CLUSTER_NAME=$PROD_CLUSTER_NAME;;
b) BACKEND_VERSION=testB && FRONTEND_VERSION=testB;;
# If there is a '-l' option option then run a build on the local PC
# NOTE:  This can run very slowly so this is not recommended
l) COMMAND="cloud-build-local --dryrun=false"; SUFFIX="cli-local";;
# If there is a '-d' option in the command line then set to run a dry run to test the cloudbuild.yaml file for errors
d) COMMAND="cloud-build-local --dryrun=true"; SUFFIX="cli-dryrun";;
# If there an invalid, option then run a build remotely on GCP
*) COMMAND="cloud-build-local --dryrun=false"; SUFFIX="cli-cloud";;
esac
done

# Utility confirm function
function confirm(){
  echo -e "Run with -p to install on the production cluster.  Otherwise it installs on the test cluster."
  echo -e "Run with -b to upload images tagged with 'testB.  Otherwise it uploads images tagged with 'testA'.  Use whatever version is not already uploaded to Git from a previous build as otherwise the build will fail."
  echo -e "Run with -l to run a local build - NOT recommended.  Otherwise it will run a build remotely on GCP."
  echo -e "Run with -d to run a lint of the cloudbuild.yaml file.\n"
  read -r -s -n 1 -p "Press any key to confirm or CTRL-C to cancel..."
  echo ""
}

echo -e "\nThe backend image will be tagged: ${BACKEND_VERSION}"
echo "The frontend images will be tagged: ${FRONTEND_VERSION}"
echo -e "The cluster upon which the install will be done is ${CLUSTER_NAME}"
echo -e "The build command will be: $COMMAND using $SUFFIX\n"
confirm

# Runs the build and overwrites default values in cloudbuild.yaml for certain variables
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
."
$COMMAND
