#!/bin/bash

# This loads the 'yq' yaml processor image into my Google Cloud Registry to allow it be used in cloudbuild.yaml

PROJECT=$(gcloud config get-value project)
GCR_YQ=gcr.io/$PROJECT/yq
YQ=mikefarah/yq
docker pull $YQ
docker tag $YQ "$GCR_YQ"
docker push "$GCR_YQ"
