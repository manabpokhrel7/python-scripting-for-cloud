# Database Architecture (PostgreSQL + pgvector)

Overview
- PostgreSQL runs inside Kubernetes and is managed by the CloudNativePG operator.
- Persistent storage is backed by Rook Ceph (`ceph-block` StorageClass).
- The Postgres cluster is used for application relational data and as the vector store for RAG via the pgvector extension.

CloudNativePG
- Operator ensures lifecycle management: creating clusters, failover, backups, and restores.
- Postgres instances are represented with Kubernetes CRs and use PVCs for data directories.

pgvector for RAG
- pgvector stores numeric embedding vectors and supports similarity search within Postgres.
- Recommended table schema for RAG documents:

  CREATE EXTENSION IF NOT EXISTS vector;
  CREATE TABLE rag_documents (
    id SERIAL PRIMARY KEY,
    source TEXT,
    path TEXT,
    chunk_index INTEGER,
    content TEXT,
    embedding vector(1536), -- adjust dimension to embedding model
    metadata JSONB,
    created_at TIMESTAMP DEFAULT now()
  );
  CREATE INDEX ON rag_documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

- Choose `vector` dimension to match your embedding model (e.g., OpenAI embedding dims or local model dims).

Ingestion tips
- Chunk long documents (e.g., 500–1,000 tokens per chunk) with overlap (50–100 tokens) to preserve context boundaries.
- Store metadata: repo, file path, line range, chunk hash, author, last-modified timestamp.
- Normalize text (strip non-printable chars) and optionally retain HTML/Markdown source in metadata.

Similarity search & retrieval
- Typical query:
  - compute embedding for user query → SELECT id, content, metadata, (embedding <-> query_vec) AS similarity FROM rag_documents ORDER BY similarity LIMIT 10;
- Use cosine similarity or inner-product depending on vector normalization.
- For large datasets, use ivfflat index and tune `lists` and `nprobe` for speed/accuracy tradeoffs.

Backups & HA
- Backup Postgres regularly (operator-supported or pgBackRest).
- Ensure WAL archiving and point-in-time recovery are configured for critical datasets.

Security & access
- Protect Postgres connection with TLS, restrict access with NetworkPolicies and proper RBAC for the operator.
- Do not expose Postgres directly to the public internet; use in-cluster access only or a bastion.