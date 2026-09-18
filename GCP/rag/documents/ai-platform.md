# AI Platform Architecture

Ollama provides local large language model serving inside the Kubernetes cluster.

Ollama runs as a Kubernetes Deployment in the ollama namespace.

The Ollama Kubernetes Service is a ClusterIP service listening on port 11434.

FastAPI communicates with Ollama using Kubernetes internal networking.

The internal Ollama address is:

http://ollama.ollama.svc.cluster.local:11434

Ollama model files are stored under:

/root/.ollama

This directory is backed by the ollama-storage PersistentVolumeClaim.

The PVC uses the ceph-block StorageClass provided by Rook Ceph.

FastAPI uses the Ollama Python client to send chat messages to the locally hosted language model.

Conversation history is stored in Redis.

The FastAPI backend retrieves previous conversation messages from Redis and includes them when constructing requests to the language model.

The AI platform will be extended with Retrieval-Augmented Generation.

An embedding model will convert platform documentation into vectors.

The vectors will be stored using pgvector in PostgreSQL.

When a user asks a question, the question will also be converted into an embedding.

pgvector similarity search will retrieve the most relevant documentation chunks.

Those chunks will be provided to the generation model as context.

This allows the model to answer questions using information specific to the Manab Cloud Platform rather than relying only on knowledge contained in the language model.
