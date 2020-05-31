#!/usr/bin/env bash

# Utility pause and check function
function check(){
 read -r -s -n 1 -p "Go to https://console.cloud.google.com/net-services/loadbalancing/loadBalancers/list?project=project-perform and confirm all loadbalancer resources are deleted and then press any key..."
 echo ""
}

# The application project name: ppk8es
APPLICATION=ppk8es
# Name the cluster
CLUSTER_NAME=${APPLICATION}-cluster
# The name of the ingress - see ingress yaml file
INGRESS=pp-app-ingress
# The name of the reserved static ip address
# STATIC_IP_NAME=pp-ip

echo -e "\nDelete ingress and loadbalancer\n"
kubectl delete ingress ${INGRESS}

echo -e "\nManually confirm that the loadbalancer resources are deleted\n"
check

# echo -e "\nDelete static ip address\n"
# gcloud compute addresses delete ${STATIC_IP_NAME} --global --quiet

echo -e "\nDelete cluster\n"
gcloud container clusters delete ${CLUSTER_NAME} --quiet
gcloud container clusters list

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
