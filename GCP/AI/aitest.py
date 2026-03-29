from openai import OpenAI
from fastapi import APIRouter

router = APIRouter( tags=["ai"])
client = OpenAI()

@router.post("/response")
async def response(input_text: str):
    response = await client.responses.create(
        model="gpt-5-nano",
        input=input_text
    )
    return response.output_text