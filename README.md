# Kubeadm + Cilium + Terraform

Infrastructure as Code and automation for a **self-managed Kubernetes
cluster on Google Cloud (GCE)**, bootstrapped with **kubeadm** and
configured with **Ansible**.

This repository contains:

-   **Terraform** for provisioning VMs, disks, networking, firewall
    rules, and load-balancing resources
-   **Ansible** playbooks for configuring hosts and bootstrapping
    Kubernetes
-   **Cilium + Hubble** for Kubernetes networking and observability
-   **Envoy Gateway** for HTTP/HTTPS application routing
-   **Rook Ceph** for persistent block storage
-   **CloudNativePG + PostgreSQL** for stateful database workloads
-   **Argo CD** for GitOps-based deployments
-   **Workload Identity Federation** for secure Google Secret Manager
    integration

```{=html}
<p align="center">
  <img alt="Kubernetes" src="https://img.shields.io/badge/Kubernetes-Deployments-blue?style=for-the-badge&logo=kubernetes" />
  <img alt="Terraform" src="https://img.shields.io/badge/Terraform-Infra-7B42BC?style=for-the-badge&logo=terraform" />
  <img alt="Ansible" src="https://img.shields.io/badge/Ansible-Automation-EE0000?style=for-the-badge&logo=ansible" />
  <img alt="Cilium" src="https://img.shields.io/badge/Cilium-Networking-00A7FF?style=for-the-badge&logo=cilium" />
  <img alt="GCP" src="https://img.shields.io/badge/GCP-GoogleCloud-4285F4?style=for-the-badge&logo=google-cloud" />
</p>

One-line: Infrastructure-as-code and automation to provision and bootstrap a self-managed Kubernetes cluster on Google Cloud (GCE) using Terraform, Ansible and kubeadm — integrated with Cilium networking, Rook Ceph storage, CloudNativePG, and GitOps (Argo CD).

```

------------------------------------------------------------------------

## Table of Contents

-   [Overview](#overview)
-   [Architecture](#architecture)
-   [Key Features](#key-features)
-   [Prerequisites](#prerequisites)
-   [Quick Start](#quick-start)
-   [Repository Structure](#repository-structure)
-   [Core Components](#core-components)
    -   [Terraform Provisioning](#terraform-provisioning)
    -   [Kubernetes Cluster Bootstrap](#kubernetes-cluster-bootstrap)
    -   [Cilium Networking](#cilium-networking)
    -   [Envoy Gateway](#envoy-gateway)
    -   [Rook Ceph](#rook-ceph)
-   [Workload Identity Federation](#workload-identity-federation)
-   [Storage](#storage)
-   [Networking](#networking)
-   [Database / RAG Support](#database--rag-support)
-   [GitOps and CI/CD](#gitops-and-cicd)
-   [Useful Scripts](#useful-scripts)
-   [Troubleshooting](#troubleshooting)
-   [Contributing](#contributing)
-   [License](#license)

------------------------------------------------------------------------

## Overview

This repository provides a production-style example of running a
self-managed Kubernetes cluster on **Google Compute Engine**.

  -----------------------------------------------------------------------
  Layer                               Technology
  ----------------------------------- -----------------------------------
  Cloud infrastructure                Google Cloud / GCE

  Infrastructure as Code              Terraform

  Configuration management            Ansible

  Kubernetes bootstrap                kubeadm

  Container runtime                   containerd

  CNI                                 Cilium

  Network observability               Hubble

  Application gateway                 Envoy Gateway

  Persistent storage                  Rook Ceph

  Database                            PostgreSQL + CloudNativePG

  GitOps                              Argo CD

  Secret integration                  Google Secret Manager + Workload
                                      Identity Federation
  -----------------------------------------------------------------------

The project is designed for **learning, experimentation, and building
real-world cloud-native and AI-ready infrastructure**.

------------------------------------------------------------------------

## Architecture

The platform is organized around a small highly available Kubernetes
cluster:

-   **3 control-plane nodes**
-   **3 worker nodes**
-   **containerd** as the container runtime
-   **Cilium** as the CNI
-   **Hubble** for network observability
-   **Envoy Gateway** for HTTP/HTTPS routing
-   **Rook Ceph** for persistent storage
-   **PostgreSQL** inside Kubernetes through CloudNativePG

### High-Level Topology

``` text
Internet
   |
   v
Google Cloud Load Balancer
   |
   v
Worker Nodes
   |
   +--> Envoy Gateway / nginx
   |
   +--> Kubernetes Services
          |
          +--> Frontend
          +--> Backend (FastAPI)
          +--> PostgreSQL
          +--> Ollama
          +--> Redis
```

### Traffic Flow

``` text
Client
  |
  v
GCP Load Balancer
  |
  v
Worker Node
  |
  v
Envoy Gateway / nginx
  |
  v
Kubernetes Service
  |
  v
Application Pod
```

------------------------------------------------------------------------

## Key Features

-   Terraform-based provisioning for GCE VMs, persistent disks, firewall
    rules, networking, and load-balancing resources
-   kubeadm cluster bootstrap with Ansible automation
-   Cilium CNI with Hubble network visibility
-   Envoy Gateway for ingress and application routing
-   Rook Ceph persistent storage for stateful workloads
-   PostgreSQL with CloudNativePG
-   pgvector-ready architecture for RAG and AI document retrieval
-   Google Secret Manager integration using Workload Identity Federation
-   GitOps deployment using Argo CD
-   Reusable shell scripts for cluster operations and lifecycle tasks

------------------------------------------------------------------------

## Prerequisites

Before using this repository, ensure you have:

-   A Google Cloud project
-   Google Cloud SDK (`gcloud`) installed and authenticated
-   Terraform installed
-   Ansible installed
-   SSH access to the VMs
-   Basic familiarity with Kubernetes, kubeadm, and cloud networking
-   Access to a valid Google Cloud project ID and region/zone
    configuration

------------------------------------------------------------------------

## Quick Start

### 1. Clone the Repository

``` bash
git clone https://github.com/manabpokhrel7/Kubeadm-cilium-Terraform.git
cd Kubeadm-cilium-Terraform
```

### 2. Provision Infrastructure with Terraform

Edit the Terraform variables for your Google Cloud project and
deployment region, then run:

``` bash
cd TerraformVM
terraform init
terraform apply
```

Terraform creates the required compute nodes, disks, networking
resources, firewall rules, and related infrastructure.

### 3. Configure the Cluster with Ansible

Use the included playbooks to bootstrap the machines and join the
Kubernetes nodes:

``` bash
./ansible.sh
```

Alternatively:

``` bash
ansible-playbook -i inventory automation-setup.yml
```

### 4. Deploy Kubernetes Manifests

After the cluster is available, apply the relevant manifests:

``` bash
bash ./execute.sh
```

You can also apply individual manifests manually when required.

### 5. Verify Cluster Health

``` bash
kubectl get nodes
kubectl get pods -A
kubectl -n kube-system get pods
```

------------------------------------------------------------------------

## Repository Structure

``` text
Kubeadm-cilium-Terraform/
├── .github/
├── .idea/
├── TerraformVM/
│   └── Terraform files for GCE VM and resource provisioning
├── manifests/
│   └── Kubernetes manifests and workloads
├── argocd/
│   └── Argo CD manifests / GitOps definitions
├── bash/
│   └── Helper scripts
├── single-plane-ansible/
│   └── Alternative or simplified Ansible setup
├── ansible.cfg
├── ansible.sh
├── automation-setup.yml
├── cilium-config.yml
├── control.yml
├── control_join.sh
├── worker.yml
├── ssh.sh
├── execute.sh
├── destroy.sh
├── WIF.yml
├── WIFDelete.yml
├── README.md
├── inventory
├── config
├── output.txt
├── etctd.yaml
├── etcd-restore.yml
└── temp.yml
```

> **Note:** Some files are operational or environment-specific and may
> vary depending on your setup.

------------------------------------------------------------------------

## Core Components

### Terraform Provisioning

Terraform provisions the Google Cloud infrastructure required by the
cluster, including:

-   Google Compute Engine VMs
-   Persistent disks
-   Networking resources
-   Firewall rules
-   Load balancers
-   Storage resources for Ceph

The Terraform configuration is located primarily under:

``` text
TerraformVM/
```

### Kubernetes Cluster Bootstrap

The Kubernetes cluster is bootstrapped with **kubeadm** and automated
through **Ansible**.

Key automation files include:

  -----------------------------------------------------------------------
  File                                Purpose
  ----------------------------------- -----------------------------------
  `automation-setup.yml`              Overall provisioning and
                                      configuration workflow

  `control.yml`                       Configures control-plane nodes

  `worker.yml`                        Configures and joins worker nodes

  `control_join.sh`                   Assists with joining additional
                                      control-plane nodes

  `ansible.cfg`                       Ansible configuration

  `inventory`                         Cluster host inventory
  -----------------------------------------------------------------------

### Cilium Networking

Cilium is used as the Kubernetes CNI and provides:

-   Pod-to-pod connectivity
-   Kubernetes networking
-   Network policy enforcement
-   Network observability through Hubble

Configuration is maintained through files such as:

``` text
cilium-config.yml
```

### Envoy Gateway

HTTP/HTTPS application traffic is handled through **Envoy Gateway**,
which sits behind the Google Cloud load balancer and routes traffic to
Kubernetes services.

``` text
Internet
   |
   v
GCP Load Balancer
   |
   v
Worker Nodes
   |
   v
Envoy Gateway
   |
   v
Kubernetes Services
```

### Rook Ceph

Rook Ceph provides persistent Kubernetes storage for stateful workloads,
including:

-   PostgreSQL
-   Ollama model storage
-   Applications requiring persistent volumes

------------------------------------------------------------------------

## Workload Identity Federation

This repository includes Workload Identity Federation configuration that
enables Kubernetes workloads to access Google Cloud services without
permanently storing long-lived service account private keys.

Relevant files:

``` text
WIF.yml
WIFDelete.yml
```

### Common Authentication Flow

``` text
Kubernetes ServiceAccount
          |
          v
Workload Identity Federation
          |
          v
Google Cloud IAM
          |
          v
Google Secret Manager
```

A common use case is:

1.  A Kubernetes ServiceAccount authenticates through Workload Identity
    Federation.
2.  Google Cloud IAM grants the required permissions.
3.  External Secrets Operator accesses Google Secret Manager.
4.  Secrets are synchronized into Kubernetes Secret objects.

This approach reduces secret sprawl and improves the security posture of
the cluster.

------------------------------------------------------------------------

## Storage

Rook Ceph provides persistent storage to the Kubernetes cluster.

### Disk Layout

Each worker node has its own Google Cloud persistent disk for Ceph
storage.

Disk paths should be managed carefully to avoid Linux device-name drift.
A stable device path can be used, for example:

``` bash
/dev/disk/by-id/google-ceph-device
```

Using a stable device path helps prevent failures caused by Linux
renaming devices after a reboot.

### StorageClass

The block-storage class used by applications is:

``` yaml
ceph-block
```

Applications can request persistent storage through Kubernetes
PersistentVolumeClaims (PVCs).

------------------------------------------------------------------------

## Networking

Cilium provides the primary Kubernetes networking layer, while external
traffic reaches the cluster through Google Cloud load-balancing
resources.

### Network Path

``` text
Client
  |
  v
GCP Load Balancer
  |
  v
Worker Node
  |
  v
Envoy / nginx
  |
  v
Service
  |
  v
Pod
```

### Core Networking Principles

-   Use Kubernetes Services and DNS for internal communication
-   Use internal `ClusterIP` services for application-to-application
    traffic
-   Route external HTTP/HTTPS traffic through Envoy Gateway
-   Keep public access off the cluster surface except through the load
    balancer
-   Use Cilium and Hubble for traffic inspection and debugging

------------------------------------------------------------------------

## Database / RAG Support

The repository is aligned with modern AI and retrieval-augmented
generation workloads.

### PostgreSQL + pgvector

The cluster architecture is designed to support PostgreSQL with
`pgvector`, which can be used for:

-   Document embedding storage
-   Vector similarity search
-   AI knowledge retrieval
-   Long-term memory for LLM applications

### Intended Architecture

``` text
Documents
   |
   v
Embedding Pipeline
   |
   v
PostgreSQL + pgvector
   |
   v
Top-N Vector Retrieval
   |
   v
RAG / AI Application
```

Recommended usage:

-   Run PostgreSQL inside Kubernetes
-   Store PostgreSQL data on Rook Ceph-backed PVCs
-   Store vectors and document metadata in PostgreSQL
-   Query the Top-N relevant document chunks during retrieval

This makes the project suitable for experimenting with AI platform, RAG,
and internal knowledge-system architectures.

------------------------------------------------------------------------

## GitOps and CI/CD

The project is designed to support GitOps-style infrastructure and
application management.

### Argo CD

Argo CD watches Git repositories and helps ensure the cluster state
matches the desired manifests stored in Git.

### Typical Workflow

``` text
Developer Push
      |
      v
CI Build / Test
      |
      v
Image / Manifest Update
      |
      v
Git Repository
      |
      v
Argo CD
      |
      v
Kubernetes Cluster
```

### CI Philosophy

-   Keep application manifests in Git
-   Treat Git as the source of truth
-   Separate build/test workflows from deployment logic
-   Keep deployment state declarative

------------------------------------------------------------------------

## Useful Scripts

  Script / File        Purpose
  -------------------- ------------------------------------------
  `execute.sh`         Apply deployment or bootstrap workflows
  `destroy.sh`         Remove the environment
  `ansible.sh`         Run Ansible automation
  `control_join.sh`    Join control-plane nodes
  `ssh.sh`             SSH helper
  `worker.yml`         Worker-node configuration and join logic
  `etcd-restore.yml`   etcd restore automation

------------------------------------------------------------------------

## Troubleshooting

### Check Overall Cluster Health

``` bash
kubectl get nodes
kubectl get pods -A
kubectl -n kube-system get pods
```

### Control-Plane Issues

``` bash
kubectl get cs
kubectl describe pod -n kube-system
```

### Cilium Networking Issues

Check Cilium pods:

``` bash
kubectl -n kube-system get pods -l k8s-app=cilium
```

Review Cilium logs:

``` bash
kubectl -n kube-system logs -l k8s-app=cilium
```

### Ceph / Storage Issues

``` bash
kubectl -n rook-ceph get pods
kubectl -n rook-ceph get cephclusters
```

### Workload Identity Issues

List Kubernetes ServiceAccounts:

``` bash
kubectl get sa -A
```

Inspect a ServiceAccount:

``` bash
kubectl describe sa <service-account-name> -n <namespace>
```

------------------------------------------------------------------------

## Contributing

Contributions are welcome.

Useful contribution areas include:

-   Improving Terraform or Ansible automation
-   Adding or validating Kubernetes manifests
-   Improving documentation
-   Fixing environment-specific issues
-   Adding clear testing and operational notes

When opening a pull request, include a clear description of the change
and relevant testing details.

------------------------------------------------------------------------

## License

This project is licensed under the **MIT License**.