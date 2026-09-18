# Persistent Storage

Rook Ceph provides persistent storage for the Kubernetes cluster.

Rook operates Ceph inside Kubernetes.

Each worker node has a dedicated Google Cloud persistent disk used for Ceph storage.

The Ceph disks are separate from the worker operating system boot disks.

Terraform creates and attaches these disks.

A stable Google Compute Engine device identifier is used for the Ceph disks:

/dev/disk/by-id/google-ceph-device

Using the stable device path prevents the configuration from depending on Linux device names such as /dev/sda or /dev/sdb.

Linux device names can change between machines or after reboot.

Rook Ceph uses the dedicated disks to create Ceph OSDs.

The Kubernetes StorageClass used for block storage is named:

ceph-block

Applications request storage using Kubernetes PersistentVolumeClaims.

Ceph dynamically provisions the underlying persistent volumes.

The Ollama service uses a PersistentVolumeClaim named ollama-storage.

The Ollama PVC is mounted at:

/root/.ollama

This allows downloaded Ollama models to survive pod replacement.
