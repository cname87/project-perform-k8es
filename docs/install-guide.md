# How to install on a local environment from GitHub

Once you've cloned the repo you need to download the secrets files that are not stored on Github.

First you need to manually download the GCP Storage key (gcpStorageKey.json) to certs/gcpStorage.

- Access GCP Cloud Storage from the browser and manually download gcpStorageKey from the certs/gcpStorage directory on GCP Storage to the local certs/gcpStorage directory.

Second, download the secrets files from GCP Cloud Storage

- Run the loadSecretsFiles scripts from both the frontend and backend package.json files - type 'npm run loadSecretsFiles' in /frontend and /backend.

Note: A dummy file '.gitkeep' is placed in all directories that contain only secrets and they would not be created in the GitHub repo otherwise.
