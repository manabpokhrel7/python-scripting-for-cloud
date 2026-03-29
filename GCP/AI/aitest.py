from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import AsyncOpenAI
import os

router = APIRouter(tags=["ai"])
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class AIRequest(BaseModel):
    input_text: str

@router.post("/response")
async def response(payload: AIRequest):
    try:
        result = await client.responses.create(
            model="gpt-5-nano",
            input=payload.input_text
        )
        return {"response": result.output_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))