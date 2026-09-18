# Kubernetes Architecture

The Manab Cloud Platform runs a self-managed Kubernetes cluster on Google Compute Engine virtual machines.

The cluster was bootstrapped using kubeadm and configured using Ansible.

The cluster contains three control-plane nodes:

- control1
- control2
- control3

The cluster contains three worker nodes:

- worker1
- worker2
- worker3

Application workloads are primarily scheduled onto worker nodes.

containerd is used as the Kubernetes container runtime.

Cilium provides Kubernetes networking.

Hubble is used to provide visibility into Cilium network traffic.

Applications are organized into Kubernetes namespaces.

The React frontend and FastAPI backend run as Kubernetes workloads.

Ollama runs in the ollama namespace.

Persistent workloads use PersistentVolumeClaims backed by Rook Ceph.
