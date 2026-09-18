# Database Architecture

PostgreSQL runs inside the Kubernetes environment.

CloudNativePG is used as the PostgreSQL operator.

CloudNativePG manages PostgreSQL workloads using Kubernetes-native resources.

Persistent PostgreSQL storage is provided through Kubernetes PersistentVolumeClaims.

The underlying persistent storage is supplied by Rook Ceph.

The platform uses PostgreSQL for relational application data.

The platform will also use the pgvector PostgreSQL extension for vector storage and similarity search.

pgvector allows embeddings generated from platform documentation to be stored alongside document content and metadata.

These vectors will later be used by the Retrieval-Augmented Generation system.
