import asyncio
from ollama import AsyncClient
import json
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from openai import AsyncOpenAI
import os
from cache.redis import r
from starlette.requests import Request
from logger import logger
from AI.embeddings import rag_retrival
from sqlalchemy.ext.asyncio import AsyncSession
from database.database import get_db


router = APIRouter(tags=["ai"])

class AIRequest(BaseModel):
    input_text: str


client = AsyncClient(host='http://ollama.ollama.svc.cluster.local:11434')


@router.post("/response")
async def response(payload: AIRequest, request: Request, db: AsyncSession = Depends(get_db)):
    try:
        previous_convo = r.get(request.session.get('sub'))
        print(f"\n\nthis is the previous convo {previous_convo}")
        input_list = [{"role": "system",
                       "content": "You are an assistant for Manab's GCP cloud platform. Answer questions about the platform using the provided context. If the context doesn't contain the answer, say that you don't have enough information rather than inventing platform details."}]
        if previous_convo:
            input_list.extend(json.loads(previous_convo))
        user_input = [
            {
                'role': 'user',
                'content': payload.input_text,
            },
        ]
        input_list.extend(user_input)
        rag_context = await rag_retrival(payload.input_text, db)
        rag_input = {'role': 'system', 'content': rag_context}
        new_list = []
        new_list.extend(input_list)
        new_list.insert(1, rag_input)
        result = await client.chat('llama3.1', messages=new_list)
        output_text = [{"role": "assistant", "content": result.message.content}]
        input_list.extend(output_text)
        # Trimming the input list before saving
        MAX_MESSAGES = 20
        if len(input_list) > MAX_MESSAGES:
            input_list = input_list[-MAX_MESSAGES:]
        # End of trim
        r.set(request.session.get('sub'), json.dumps(input_list))
        return {"response": result.message.content}
    except Exception as e:
        logger.exception(e)
        raise HTTPException(status_code=500, detail=str(e))