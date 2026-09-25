# Persistent Storage (Rook Ceph)

Architecture
- Rook runs Ceph inside Kubernetes to provide dynamic storage provisioning.
- Each worker node gets a dedicated GCE persistent disk used as a Ceph OSD.
- StorageClass name: `ceph-block` used for block PVs.
- Example mount target for Ollama model files:
  - PVC name: `ollama-storage`
  - Mount path inside Ollama container: `/root/.ollama`

Device naming & stability
- Use stable device path when attaching GCE disks to avoid failure due to device name changes:
  - `/dev/disk/by-id/google-ceph-device` (stable path created by Terraform)
- Terraform is responsible for attaching disks consistently to the intended node.

Rook Ceph considerations
- Ceph OSDs should use separate disks from the OS boot disk.
- Monitor OSD, MON, MGR resource utilization to avoid slow I/O or degraded performance.
- Ceph replication/placement should be configured considering the number of worker nodes (e.g., replica 3).

PersistentVolumeClaims & dynamic provisioning
- Applications request storage via PVCs; Rook will dynamically create underlying RBD or block devices.
- Example PVC for database:
  - apiVersion: v1
  - kind: PersistentVolumeClaim
  - storageClassName: ceph-block
  - resources.requests.storage: 50Gi

Backup & recovery
- Database backups: schedule logical (pg_dump) and physical (pg_basebackup/pgBackRest) backups.
- Ceph-level snapshots and backups can be used for faster recovery of non-database data.
- For Postgres (CloudNativePG), use the operator’s built-in backup mechanism or integrate with external backup tools.

Performance tuning
- Choose appropriate disk types (pd-standard vs pd-ssd) depending on IOPS/throughput needed.
- Tune Ceph OSD memory and Bluestore settings for heavy DB workloads.
- Monitor network latency between nodes — Ceph is sensitive to cross-node latency.

Operational commands
- kubectl -n rook-ceph get pods
- kubectl -n rook-ceph get cephclusters
- ceph status (run inside Rook toolbox pod)