import ollama
from database.crud import vector_db, return_vector
from sqlalchemy.ext.asyncio import AsyncSession
from rag.ingestion.ingest import chunks_data
from database.models  import Vector
from database.database import get_db
from sqlalchemy import select
from fastapi import APIRouter, Depends

router = APIRouter(tags=["embed"])


async def document_embedder(db: AsyncSession):
    document_input = chunks_data()
    for i in document_input:
        content = i["content"]
        source = i["source"]
        chunk_index = i["chunk_index"]
        if await db.scalar(select(Vector).where(Vector.content == content)):
            continue # This skips everything in this iteration
        single = ollama.embed(
              model='qwen3-embedding:0.6b',
              input=content
            )
        await vector_db(content, single["embeddings"][0], source, chunk_index, db)


async def rag_retrival(raginput: str, db: AsyncSession):
    test_vector = ollama.embed(
                  model='qwen3-embedding:0.6b',
                  input=raginput
                )
    returneditem = await return_vector(test_vector["embeddings"][0], db)
    returneditemlist = []
    for i in returneditem:
        returneditemlist.append(i.content)
    finalrag = "\n\n".join(returneditemlist)
    return finalrag

