#!/usr/bin/env bash

# This allows you to set some Skaffold environment variables or cli parameters


## 4 parameters to set clean up

# Default = true and can be set in the launch.json configuration
export SKAFFOLD_CLEANUP=true

# Default = true and cannot be set in the launch.json configuration
export SKAFFOLD_CACHE_ARTIFACTS=clean

# Default = true and cannot be set in the launch.json configuration
export SKAFFOLD_NO_PRUNE=false

# Default = true and cannot be set in the launch.json configuration
export SKAFFOLD_NO_PRUNE_CHILDREN=false

##

# Default=notify. manual => press Return to trigger check for changes
export SKAFFOLD_TRIGGER=manual

export VERSION=v1.0.0

# Run Skaffold
skaffold dev \
--verbosity=debug \
--port-forward=true \
--filename=./skaffold.yaml \
--default-repo=gcr.io/project-perform
