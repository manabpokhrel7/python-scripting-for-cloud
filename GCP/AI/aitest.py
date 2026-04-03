import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import AsyncOpenAI
import os
from redis.redis import r
from starlette.requests import Request
from logger import logger


router = APIRouter(tags=["ai"])
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class AIRequest(BaseModel):
    input_text: str

@router.post("/response")
async def response(payload: AIRequest, request: Request):
    try:
        previous_convo = r.get(request.session.get('sub'))
        print(f"\n\nthis is the previous convo {previous_convo}")
        input_list = [{"role": "developer", "content": "This is a cloud platform designed to create VMS in GCP only using the API Manab Designed"}]
        if previous_convo:
            input_list.extend(json.loads(previous_convo))
        user_input = [{"role" : "user", "content": payload.input_text}]
        input_list.extend(user_input)
        result = await client.responses.create(
            model="gpt-5-nano",
            input=input_list
        )
        output_text = [{"role" : "assistant", "content": result.output_text}]
        input_list.extend(output_text)
        #Trimming the input list before saving
        MAX_MESSAGES = 20
        if len(input_list) > MAX_MESSAGES:
            input_list = input_list[-MAX_MESSAGES:]
        #End of trim
        r.set(request.session.get('sub'), json.dumps(input_list))
        return {"response": result.output_text}
    except Exception as e:
        logger.exception(e)
        raise HTTPException(status_code=500, detail=str(e))


