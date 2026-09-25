# Manab Cloud Platform — Overview

Manab Cloud Platform is a self-hosted cloud and Kubernetes platform running on Google Cloud (GCE), provisioned with Terraform and configured with Ansible and kubeadm. It hosts application workloads (React frontend, FastAPI backend), model serving (Ollama), and stateful services (PostgreSQL via CloudNativePG) on a self-managed Kubernetes cluster. The platform follows GitOps for deployments (Argo CD) and uses Rook Ceph for persistent storage, Cilium for networking, Prometheus/Grafana for observability, and Google Secret Manager + External Secrets Operator for secret distribution.

Key goals:
- Reproducible infra-as-code (Terraform) for GCE VMs, disks, networking and load balancers.
- Immutable configuration and GitOps deploys (Argo CD) for K8s manifests.
- Self-hosted model serving (Ollama) with secure internal access (ClusterIP).
- Retrieval-Augmented Generation (RAG) using pgvector in PostgreSQL and a local or cloud embedding model.
- Strong cluster observability (Prometheus/Grafana) and network visibility (Hubble).

Top-level components
- Infrastructure: Terraform scripts create GCE VMs and Ceph disks.
- Provisioning: Ansible bootstraps OS and kubeadm, sets up control and worker nodes.
- Kubernetes runtime: kubeadm cluster, containerd runtime, Cilium CNI, Envoy Gateway for ingress.
- Storage: Rook Ceph providing `ceph-block` StorageClass and dynamic PV provisioning.
- Database: PostgreSQL via CloudNativePG operator, pgvector extension for vector storage.
- AI: Ollama model server, FastAPI backend, Redis for conversation state, RAG ingestion pipeline.
- CI/CD: CI builds images, Argo CD performs GitOps-based in-cluster sync.

Why this matters for RAG
- Documentation and manifests are versioned in Git (source-of-truth).
- Kubernetes manifests, scripts, and API docs are stable ingestion sources for embedding.
- Stateful components (Postgres + pgvector) provide production-ready vector storage for retrieval queries.