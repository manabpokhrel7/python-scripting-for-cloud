import asyncio
from ollama import AsyncClient
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import AsyncOpenAI
import os
from cache.redis import r
from starlette.requests import Request
from logger import logger

router = APIRouter(tags=["ai"])

class AIRequest(BaseModel):
    input_text: str


client = AsyncClient(host='http://ollama.ollama.svc.cluster.local:11434')


@router.post("/response")
async def response(payload: AIRequest, request: Request):
    try:
        previous_convo = r.get(request.session.get('sub'))
        print(f"\n\nthis is the previous convo {previous_convo}")
        input_list = [{"role": "system",
                       "content": "This is a cloud platform designed to create VMS in GCP only using the API Manab Designed"}]
        if previous_convo:
            input_list.extend(json.loads(previous_convo))
        user_input = [
            {
                'role': 'user',
                'content': payload.input_text,
            },
        ]
        input_list.extend(user_input)
        result = await client.chat('vaultbox/qwen3.5-uncensored:4b', messages=input_list)
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