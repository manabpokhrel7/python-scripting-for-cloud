# RAG Knowledge Base

This directory contains source documents used by the Manab Cloud Platform RAG system.

Files inside `documents/` are source knowledge.

The RAG ingestion process will:

1. Read each document.
2. Split documents into chunks.
3. Generate an embedding for each chunk.
4. Store the chunk, source metadata, and embedding in PostgreSQL using pgvector.

These source documents should remain separate from the generated vector data stored in PostgreSQL.
