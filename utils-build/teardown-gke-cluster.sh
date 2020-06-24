#!/usr/bin/env bash

# Utility pause and check function
function check(){
 read -r -s -n 1 -p "Go to https://console.cloud.google.com/net-services/loadbalancing/loadBalancers/list?project=project-perform and confirm all loadbalancer resources are deleted and then press any key..."
 echo ""
}

# Read in variables
SCRIPT_DIR="${0%/*}"
# shellcheck source=/dev/null
source "$SCRIPT_DIR"/set-variables.sh

echo -e "\nDelete ingress and loadbalancer\n"
kubectl delete ingress "${INGRESS}"

echo -e "\nManually confirm that the loadbalancer resources are deleted\n"
check

# Uncomment to delete static ip address during teardown
# echo -e "\nDelete static ip address\n"
# gcloud compute addresses delete ${STATIC_IP_NAME} --global --quiet

echo -e "\nDelete cluster\n"
gcloud container clusters delete "${CLUSTER_NAME}" --quiet
gcloud container clusters list

# Clear Kubectl configuration file entirely - clears old context
echo -e "\nReset Kubectl configuration file\n"
cat <<EOF > ~/.kube/config
apiVersion: v1
clusters: []
contexts: []
current-context: ""
kind: Config
preferences: {}
users: []
EOF
