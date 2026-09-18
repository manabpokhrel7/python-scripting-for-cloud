# Manab Cloud Platform Overview

Manab Cloud Platform is a self-hosted cloud and Kubernetes platform running on Google Cloud Platform.

The infrastructure is provisioned using Terraform. Terraform creates Google Compute Engine virtual machines, persistent disks, networking resources, firewall rules, load balancers, and other required cloud resources.

Ansible is used after infrastructure provisioning to configure the virtual machines and bootstrap Kubernetes.

The Kubernetes cluster was created using kubeadm and consists of three control-plane nodes and three worker nodes.

Applications running on the cluster include a React frontend, a FastAPI backend, PostgreSQL, Ollama, and supporting infrastructure services.

Argo CD provides GitOps-based application deployment.

Prometheus and Grafana provide monitoring and observability.

Rook Ceph provides persistent Kubernetes storage.

Envoy Gateway provides application ingress and HTTP routing.
