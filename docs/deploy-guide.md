# Deployment

## Ongoing CI / CD

Steps:

- The production cluster should be up and running on GKE with the previously deployed version.
- Develop the application locally on a test GKE cluster using Skaffold and running unit and e2e tests manually.
- When tests pass check in to the master branch on the Github repository.
- This triggers a cloud build that builds the frontend and backend, runs the frontend and backend unit tests and e2e application tests, copies the Helm chart to a 'Candidate' branch in the git repo, installs the Helm chart on the production cluster and copies the Helm chart to the 'Deployed' branch in the git repo, and runs an e2e test against the newly deployed production cluster.
