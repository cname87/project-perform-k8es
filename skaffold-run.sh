 #!/usr/bin/env bash

 # This sets some Skaffold environment variables to allow full clean up after exit.
 # It is run as a pre-launch task to the VSCode 'Run on Kubernetes' launch configuration

 # Default = true and can be set in the launch.json configuration
 export SKAFFOLD_CLEANUP=true
 # Default = true and cannot be set in the launch.json configuration
 export SKAFFOLD_CACHE_ARTIFACTS=false
 # Default = true and cannot be set in the launch.json configuration
 export SKAFFOLD_NO_PRUNE=false
 # Default = true and cannot be set in the launch.json configuration
 export SKAFFOLD_NO_PRUNE_CHILDREN=false
 # Default=notify. manual => press Return to trigger check for changes
 export SKAFFOLD_TRIGGER=manual

# Run Skaffold.
skaffold dev -v trace --port-forward --filename ./skaffold.yaml --default-repo gcr.io/project-perform
