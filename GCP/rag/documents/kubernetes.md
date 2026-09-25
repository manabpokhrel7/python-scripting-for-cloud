# Kubernetes Architecture & Runbook

Cluster bootstrap
- Provisioning flow:
  1. Terraform creates GCE VMs and persistent disks.
  2. Ansible (`automation-setup.yml`) installs prerequisites (containerd, kubeadm) and runs kubeadm init on control nodes (`control.yml`).
  3. Worker nodes run `worker.yml` to join the cluster using the kubeadm join token.
  4. Cluster networking (Cilium) is applied via `cilium-config.yml` and additional manifests.

Cluster topology
- 3 control-plane nodes (HA etcd).
- 3 worker nodes (application workloads + Ceph OSDs).
- Namespaces are used to separate responsibilities (e.g., `ollama` for model serving).

Key manifests & scripts (repo pointers)
- control.yml — Ansible playbook that configures control-plane nodes.
- worker.yml — Ansible playbook that configures and joins worker nodes.
- automation-setup.yml — orchestrates kubeadm and Cilium install steps.
- execute.sh / destroy.sh — convenience scripts to apply/destroy the environment.
- cilium-config.yml — Cilium Gateway / Envoy configuration used for HTTP routing.

Networking & service exposure
- CNI: Cilium (eBPF-based), with Hubble for network observability.
- Ingress/Routing: Envoy Gateway handles HTTP/HTTPS routing to internal Services.
- Public access path: regional TCP Load Balancer → worker nodes (nodePort) → nginx or Envoy Gateway → cluster Service.
  - Note: nginx is included in front of Envoy when external LB requires host ports 80/443 but Envoy listens on nodePorts.

Stateful components
- PostgreSQL operator: CloudNativePG runs Postgres clusters as Kubernetes resources.
- Ceph/Rook: runs in-cluster storage for PVs/PVCs, used by CloudNativePG and other stateful workloads.

Health checks and probes
- Leverage readiness and liveness probes on app containers (FastAPI, Ollama).
- Ollama specifically exposes HTTP port 11434 and must be probed for readiness to ensure model server health.

Best practices & runbook snippets
- Upgrade control plane and kubeadm in lock-step; drain workers before kubelet or containerd changes.
- Backup etcd before disruptive operations. Example: etcd-restore.yml demonstrates a restore plan.
- For control-plane scaling: add control node via kubeadm join with `--control-plane`.
- Use `kubectl rollout status` and Argo CD application status to validate GitOps sync.