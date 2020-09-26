# Development

## Development environment

The recommended development environment is a VSCode IDE on a laptop running Ubuntu Linux.  All required products such as gcloud, docker, kubectl, etc are installed under Ubuntu.

It is possible to develop on a laptop running Windows 10.  In this case set up a Ubuntu distribution on wsl (Windows Subsystem for Linux) and run VSCode using Remote WSL, which runs VSCode in Windows and connects to a server on the Linux file system.  Configure so the Windows PATH is not visible to the command line and install gcloud and kubectl on the Linux filesystem (as otherwise it runs super slow).  Install Docker Desktop for Windows but configure so it is linked to the wsl subsystem.

## How to install a development environment from GitHub

Once you've cloned the repo you need to download the secrets files that are not stored on Github.

First you need to manually download the GCP Storage key (gcpStorageKey.json) to certs/gcpStorage.

- Access GCP Cloud Storage from the browser and manually download gcpStorageKey from the certs/gcpStorage directory on GCP Storage to the local certs/gcpStorage directory.

Second, download the secrets files from GCP Cloud Storage

- Run the loadSecretsFiles scripts from both the frontend and backend package.json files - type 'npm run loadSecretsFiles' in /frontend and /backend.

Note: A dummy file '.gitkeep' is placed in all directories that contain only secrets and they would not be created in the GitHub repo otherwise.

## Creation of Kubernetes clusters

A GKE cluster, named either 'ppk8es-prod' or 'ppk8es-test', can be created using the cluster creation utility 'setup-gke-cluster.sh'.

Run with the parameter -p to create the production cluster (i.e. named ppk8es-prod) and with -t to create the test cluster  (i.ge. named ppk8es-test).  Note that the names are set in the utility 'set-variables.sh.

Note: Use 'gcloud config set ...' to configure the gcloud project as 'project-perform' and zone as 'europe-west2-c'.

Note that the ssl certificate is only enabled on one cluster.  If the test cluster is running then the ingress with ssl certificate will not be enabled on the production cluster or vice versa.  You can access the test cluster without the ingress using port-mapping to access the front end or backend services so create the production cluster first.

## Domain Name

The domain name project.perform.com is purchased via Gooogle Domains - see [here.](https://domains.google.com/registrar/project-perform.com/dns?_ga=2.176823525.1515712813.1590427960-866385153.1590427960)  The domain is pointed at an ip address (35.227.192.29).  A matching static ip address must be reserved during cluster set up - it seems to automatically reserve this address without it having to be explicitly listed in the creation call..

## Manual deployment to a cluster

Install the application to a cluster using the Helm install utility 'helm-install.sh' to install the Helm chart.

Run with the parameter -p to install to the production cluster (named ppk8es-prod) and with -t to install to the test cluster  (named ppk8es-test).  Note that the names are set in the utility 'set-variables.sh.

Note that it can take up to 30 minutes or longer for the ssl certificate to be provisioned i.e. before project-perform.com becomes operational.  To check if it's operational go to the GCP home project -> Network Services -> Load balancing -> advanced -> certificates page [here.](https://console.cloud.google.com/net-services/loadbalancing/advanced/sslCertificates/list?project=project-perform&sslCertificateTablesize=50) and click on the certificate, and check it's 'Status' is 'ACTIVE'.

In the case if the test cluster the install utility will set up port forwarding of the frontend service to localhost:8080 and the backend service to localhost:8081. (This means you can access the application without an ingress or ssl certificate).

## Use of Skaffold and VSCode

The git repo includes a skaffold.yaml and associated VSCode launch configurations.  Skaffold builds and deploys the microservices to a chosen Kubectl environment (i.e. a GKE cluster).  It rebuilds on change.

## Running a cloud build

A cloudbuild.yaml file allows a cloud build to be run to build and deploy the application.

### Images required to allow a cloud build run

The following images must exist in the GCP Container Registry:

- 'gcr.io/project-perform/node-with-puppeteer'.  See 'backend/utils-build/buildNodeWithPuppeteer/README.md' for how to create this.
- 'gcr.io/project-perform/helm'.  See '/utils-build/build-helm-cloudbuilder.sh'.
- 'gcr.io/project-perform/yq'.  See '/utils-build/build-yq-cloudbuilder.sh'.

Note: You may need to recreate an image if you get an 'unknown blob' error.

### Triggers for a cloud build

A cloud build which employs ./cloudbuild.yaml must be run.  There are two ways this can be done:

- A build triggered locally by manually calling the utility ./utils-build/runbuild.sh
- A build triggered remotely either following a Git check-in, or via a manual trigger on GCP - see [here.](https://console.cloud.google.com/cloud-build/triggers?project=project-perform)

NOTE: Variables referenced in cloudbuild.yaml are set in 3 places:

- For a local build the utility ./utils-build/set-variables.sh is run by runbuild.sh which sets defaults.  Also runbuild.sh itself sets the version tags to a test tag. Then runbuild.sh sends variables to cloudbuild.yaml which overrides the defaults in that file.
- A build triggered from Git sets certain specific variables but otherwise the defaults used in cloudbuild.yaml are used.

### The local cloudbuild utility

The utility ./utils-build/runbuild.sh is used to locally manually trigger builds:

- Run with the option -p to install on the production cluster. If -p is not provided it will install on the test cluster.
- Run with the option -b to upload images tagged 'testB'.  If -b is not provided images tagged 'testA' will be uploaded.
- Run with the option -l to run a build on the local PC (not recommended).  If -l is not supplied it will run a build on the remote GCP cloudbuilder.
- Run with the option -d to run a test of the cloudbuild.yaml file.

NOTE: Images tagged 'testA' or 'testB' will be uploaded to the GCP Container Registry and installed on the configured cluster.  The build will fail before install at the step where the build is saved to Git if you use the same tag as already stored in Git, (as Git sees nothing to change).
NOTE: cloud-build-local does not run under Windows.  The local build option (which runs the build on the local PC) does not appear to run at all on WSL (Windows Subsystem for Linux) and runs slowly on Linux so the -l option is NOT recommended.

### What a cloudbuild run does

It downloads secrets that are not stored on the git repo, installs and builds the frontend and backend applications, units tests them, and then builds the frontend and backend images and pushes them to the cloud registry.  It e2e tests the built images. It then edits the Helm Chart to point to the new images. It clones the repo, copies the Helm chart to be deployed to the cloned repo, commits and then pushes back to the candidate branch of the remote repo.  It then deploys the Helm chart to the configured Kubernetes cluster and runs an e2e test on the configured cluster.  Finally it copies the updated Helm chart to the production branch of the cloned repo and pushes to the production branch of the remote repo.

Note:  To push to the remote Git repo you need to set up a secret key on GCP secrets and load the same as a deploy key on the Git repo - see # See [here.](https://cloud.google.com/cloud-build/docs/access-private-github-repos)

### Deletion of the test cluster

The test GKE cluster can be deleted using the cluster deletion utility 'teardown-gke-cluster.sh'.

Note: Manually check that the loadbalancer and ssl certificate are deleted.
Note: The lines deleting the static ip address may be commented out to preserve the static ip address.
