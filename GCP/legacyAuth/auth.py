from fastapi import FastAPI, HTTPException, Depends, status, APIRouter
from database.crud import create_user, list_item, create_item
from JWT.jwt import authenticate_user, get_current_user, create_access_token
from my_pydantic_class import Token, CreateUser, CreateItem, CreateResponse, UserResponse
from datetime import timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import DBAPIError
from logger import logger
from database.database import engine, get_db
from database.models import Base

router = APIRouter(prefix="/auth", tags=["Auth"])
ACCESS_TOKEN_EXPIRE_MINUTES = 30

@router.post("/create_users")
async def create_users(payload: CreateUser, db: AsyncSession = Depends(get_db)) -> UserResponse:
    try:
        return await create_user(payload.user_name ,payload.user_password , payload.user_email, db=db)
    except DBAPIError as e:
        logger.exception(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)



@router.post("/login_users")
async def login_for_access_token( form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: AsyncSession = Depends(get_db)
) -> Token:
    try:
        user = await authenticate_user(form_data.username, form_data.password, db=db)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = await create_access_token(
            data={"sub": user.name}, expires_delta=access_token_expires
        )
        return Token(access_token=access_token, token_type="bearer")
    except Exception as e:
        logger.exception(e)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)


@router.post("/create_items")
async def create_items(payload: CreateItem, owner: Annotated[int, Depends(get_current_user)], db: AsyncSession = Depends(get_db)) -> CreateResponse:
    try:
        return await create_item(payload.item_name, payload.item_desc, owner, db=db)
    except Exception as e:
        logger.exception({e})
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

@router.post("/list_items")
async def list_items(owner: Annotated[int, Depends(get_current_user)], db: AsyncSession = Depends(get_db)) -> list[CreateResponse]:
    try:
        return await list_item(owner, db=db)
    except Exception as e:
        logger.exception({e})
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)