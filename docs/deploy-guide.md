# Deployment



## Manual deployment to a cluster

Install the application to a cluster using the Helm install utility 'helm-install.sh' to install the Helm chart.

Run with the parameter -p to install to the production cluster (e.g. named ppk8es-prod) and with -t to install to the test cluster  (e.g. named ppk8es-test).  Note that the clusters are named in the utility 'set-variables.sh.

Note that it can take up to 30 minutes or longer for the ssl certificate to be provisioned i.e. before project-perform.com becomes operational.  To check if it's operational go to the GCP home project -> Network Services -> Load balancing -> advanced -> certificates page i.e. [click here](https://console.cloud.google.com/net-services/loadbalancing/advanced/sslCertificates/list?project=project-perform&sslCertificateTablesize=50) and click on the certificate, and check it's 'Status' is 'ACTIVE'.

## Ongoing CI / CD

Steps:

- The production cluster should be up and running on GKE with the previously deployed version.
- Develop the application locally on a test GKE cluster using Skaffold and running unit and e2e tests manually.
- When tests pass check in to the master branch on the Github repository.
- This triggers a cloud build that builds the frontend and backend, runs the frontend and backend unit tests and e2e application tests, copies the Helm chart to a 'Candidate' branch in the git repo, installs the Helm chart on the production cluster and copies the Helm chart to the 'Deployed' branch in the git repo, and runs an e2e test against the newly deployed production cluster.
