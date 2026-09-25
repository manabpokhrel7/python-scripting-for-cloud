# Compute (Google Compute Engine) — Design & Operational Notes

Overview
The platform’s compute layer runs on Google Compute Engine (GCE). Terraform provisions VM instances for control-plane and worker nodes, attaches persistent disks (for Ceph OSDs), and configures network resources and load balancers.

Topology and machine roles
- Control-plane: 3 VMs (control1, control2, control3) — run kube-apiserver, controller-manager, scheduler, etcd members.
- Worker nodes: 3 VMs (worker1, worker2, worker3) — run application workloads and Rook Ceph OSDs.
- Each worker has a dedicated persistent disk for Ceph OSDs (separate from OS boot disk).

Provisioning & tooling
- Terraform: creates instances, disks, networks, firewall rules, and load balancers.
  - Look in `TerraformVM/` and top-level Terraform files in the Kubeadm-cilium-Terraform repo.
  - Use variables for project, zone, instance sizing and disk identifiers.
- Ansible: configures OS, installs containerd and kubeadm, and runs cluster bootstrap tasks.
  - Entry points: `ansible.sh`, `automation-setup.yml`, `control.yml`, `worker.yml`.

Instance image & runtime
- OS: Rocky Linux 9 (configured via Ansible).
- Container runtime: containerd.
- Recommended boot image source: official Rocky/compat Debian/Ubuntu images as used in Terraform or the python-scripting project for VM creation examples.

GCE-specific notes
- Stable Ceph disk path: `/dev/disk/by-id/google-ceph-device` — Terraform attaches disks by stable ID to avoid ephemeral /dev/sdX device drift.
- External IPs: worker nodes are typically not given public IPs; ingress is handled by a regional TCP load balancer -> worker node -> Envoy Gateway.
- Workload Identity (WIF) is used for secure GCP access from Kubernetes (see `WIF.yml` and `WIFDelete.yml`).

Operational commands / quick examples
- Recreate infrastructure (high level):
  - terraform init && terraform apply (in TerraformVM or top-level)
  - Run Ansible `automation-setup.yml` to bootstrap nodes
- FastAPI-based compute automation (from `python-scripting-for-cloud`):
  - Use the FastAPI endpoints to create/list/delete VMs programmatically for testing.
  - Example: POST /create_machine?instance_name=manab&instance_zone=asia-southeast1-b&disk_type=pd-standard

Notes for capacity planning
- Reserve enough CPU/Memory for Ceph OSDs on worker nodes.
- Use regional/static IP and health checks for the GCE load balancer.
- Consider separate zones for HA and spread the control-plane across zones if desired.