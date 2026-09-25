# AI Platform & Retrieval-Augmented Generation (RAG)

Architecture summary
- Model serving: Ollama runs as an in-cluster Deployment in namespace `ollama`, exposed via a ClusterIP service on port 11434.
- API: FastAPI backend provides endpoints and orchestrates inference requests and the RAG pipeline.
- Conversation state: Redis stores session history used to provide context for multi-turn chat.
- RAG: Document ingestion → embeddings → pgvector in PostgreSQL → similarity search → augmented prompt → generation.

Key runtime addresses
- Ollama internal endpoint (example): `http://ollama.ollama.svc.cluster.local:11434`
- FastAPI entrypoint: container in `my-app` or `GCP/app.py` (python-scripting-for-cloud shows a similar FastAPI pattern)

RAG pipeline (high level)
1. Ingestion
   - Collect documents (Kubernetes manifests, README files, scripts, architecture docs).
   - Chunk documents into overlapping text windows (e.g., 500–1,000 tokens, 50–100 token overlap).
   - Store each chunk's content + metadata (repo, path, line ranges, chunk index) in Postgres (pgvector).
   - Compute and store embedding vectors.
2. Retrieval
   - For a user query compute query embedding.
   - Run similarity search in pgvector (top_k, optionally filter by metadata).
   - Return top-N chunks (e.g., top 5) as context.
3. Generation
   - Construct prompt: system instructions + retrieved chunks + conversation history (from Redis) + user query.
   - Call generation model (Ollama via HTTP, or remote LLM) to produce the final answer.
   - Optionally store the interaction in Redis and logs.

Example pgvector ingestion schema & SQL
- See `database.md` for example table. Use an ivfflat index for scale and tune `lists`/`nprobe`.
- Always set embedding dimension to match your embedding model.

Embedding model choices
- Local (Ollama): if Ollama exposes embeddings, you can run embeddings locally to avoid external API calls.
- Cloud (OpenAI, etc.): higher-quality embeddings may be available; choose consistent embedding model for both ingestion and queries.
- Example: OpenAI "text-embedding-3-small" or equivalent; dimension must match.

Prompt composition & safety
- Limit the number and total token size of retrieved chunks (e.g., 5 chunks, max 2000 tokens).
- Include source attribution (metadata) for each chunk in the prompt so generated answers can cite docs.
- Add guardrails to the system prompt to avoid hallucination and instruct models to answer only from provided context.

Operational metrics to collect
- Embedding latency and error rate.
- Retrieval latency and similarity scores distribution.
- Model inference latency, tokens generated, errors.
- RAG quality metrics: proportion of retrieved chunks that contain ground-truth answers (requires labeled checks).

Example retrieval pseudocode
- query_vec = embed(query)
- results = SELECT content,metadata, (embedding <-> query_vec) AS sim FROM rag_documents ORDER BY sim LIMIT 5
- prompt = system + join(results.content) + conversation_history + user_query
- response = call_model(prompt)

Recommendations for RAG ingestion
- Include Git metadata: repo name, file path, commit SHA, and last modified timestamp.
- Store raw Markdown/Code and a cleaned text version for retrieval; this enables source quoting.
- Precompute embeddings on push (e.g., CI job) to keep vector store up-to-date. For that, add an ingestion pipeline triggered by repo changes or scheduled scans.

Storage & scaling
- For large corpora consider a vector store optimized for scale (Milvus, Pinecone, PG + ivfflat with tuned parameters).
- Start with pgvector for simplicity and portability; monitor query latency as vectors increase.