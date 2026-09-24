from ollama import AsyncClient
from database.crud import vector_db, return_vector
from sqlalchemy.ext.asyncio import AsyncSession
from rag.ingestion.ingest import chunks_data
from database.models import Vector
from sqlalchemy import select
from fastapi import APIRouter


router = APIRouter(tags=["embed"])


# Ollama is running in the "ollama" namespace.
# Kubernetes DNS:
# <service>.<namespace>.svc.cluster.local
client = AsyncClient(
    host="http://ollama.ollama.svc.cluster.local:11434"
)


async def document_embedder(db: AsyncSession):
    document_input = chunks_data()

    for i in document_input:
        content = i["content"]
        source = i["source"]
        chunk_index = i["chunk_index"]

        # Check whether this chunk already exists
        existing_document = await db.scalar(
            select(Vector).where(Vector.content == content)
        )

        if existing_document:
            continue

        # Create embedding using Ollama running inside Kubernetes
        single = await client.embed(
            model="qwen3-embedding:0.6b",
            input=content
        )

        # Store content + vector + metadata in PostgreSQL/pgvector
        await vector_db(
            content,
            single["embeddings"][0],
            source,
            chunk_index,
            db
        )


async def rag_retrival(raginput: str, db: AsyncSession):

    # Convert the user's question into an embedding
    test_vector = await client.embed(
        model="qwen3-embedding:0.6b",
        input=raginput
    )

    # Find the most semantically similar document chunks
    returneditem = await return_vector(
        test_vector["embeddings"][0],
        db
    )

    returneditemlist = []

    for i in returneditem:
        returneditemlist.append(i.content)

    # Combine retrieved chunks into context for the LLM
    finalrag = "\n\n".join(returneditemlist)

    return finalrag