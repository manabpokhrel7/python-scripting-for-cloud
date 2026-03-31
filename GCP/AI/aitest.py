import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import AsyncOpenAI
import os
from Redis.redis import r
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
        print(f"\nthis is the previous convo {previous_convo}\nit ends here")
        user_input = {"role" : "user", "content": payload.input_text}
        input_list = [{"role": "developer", "content": "This is a cloud platform designed to create VMS in GCP only using the API Manab Designed"}]
        if previous_convo:
            input_list.extend(json.loads(previous_convo))
        input_list.append(user_input)
        result = await client.responses.create(
            model="gpt-5-nano",
            input=input_list
        )
        output_text = {"role" : "assistant", "content": result.output_text}
        input_list.append(output_text)
        r.set(request.session.get('sub'), json.dumps(input_list))
        # count = r.llen(request.session.get('sub'))
        # if count>5:
        #     last_element = r.lindex(request.session.get('sub'), -1)
        #     r.ltrim(request.session.get('sub'), 0, 3)
        #     r.rpush(request.session.get('sub'), last_element)
        return {"response": result.output_text}
    except Exception as e:
        logger.exception(e)
        raise HTTPException(status_code=500, detail=str(e))


