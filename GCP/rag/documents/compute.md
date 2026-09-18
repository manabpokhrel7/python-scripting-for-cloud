# Compute Infrastructure

The Kubernetes infrastructure runs on Google Compute Engine virtual machines.

Terraform is responsible for creating the virtual machines.

The platform contains three control-plane virtual machines and three worker virtual machines.

The control-plane nodes run Kubernetes control-plane components.

Worker nodes execute application workloads.

Rocky Linux 9 is used as the operating system for the Kubernetes nodes.

The Kubernetes container runtime is containerd.

Terraform also creates persistent disks that are attached to worker nodes for Ceph storage.

The platform backend also contains functionality for creating Google Compute Engine virtual machines through the Google Cloud API.

The FastAPI application communicates with Google Cloud services to perform cloud operations.
