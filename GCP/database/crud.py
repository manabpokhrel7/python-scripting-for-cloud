from database.models import Auth, Items, Cloud
from sqlalchemy import select, delete
from JWT.hash import verify_password, get_password_hash
from sqlalchemy.exc import DBAPIError
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import ValidationError
from logger import logger
from fastapi import HTTPException



async def create_user(user_name: str, user_password: str, user_email: str, db: AsyncSession):
    existing_user = await db.scalar(select(Auth).where(Auth.name == user_name))
    try:
        if existing_user:
            return "The user already exists"
        else:
            new_password = await get_password_hash(user_password)
            new_user = Auth(
                name= user_name,
                hashed_password = new_password,
                email=user_email,
            )
            db.add(new_user)
            await db.commit()
            await db.refresh(new_user)  # Reload from DB to get ID
            return new_user
    except DBAPIError as e:
        return f"{e}"


async def create_item(item_name: str, item_desc: str, owner_id: int, db: AsyncSession):
    new_item = Items(
        product=item_name,
        description=item_desc,
        owner_id=owner_id,
    )
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)  # Reload from DB to get ID

    return new_item

async def list_item(owner_id: int, db: AsyncSession):
    try:
        items_list = select(Items).where(Items.owner_id == owner_id)
        final_items = await db.execute(items_list)
        return final_items.scalars().all()
    except ValidationError as e:
        print({e})

##Storing Access Token in the database
async def store_token(token_id, refreshtoken, sub, db: AsyncSession):
    existing_sub = await db.scalar(select(Cloud).where(Cloud.sub == sub))
    if existing_sub:
        print("The user is logged in")
    else:
        access_token = Cloud(
            access_token=token_id,
            refresh_token=refreshtoken,
            sub=sub
        )
        db.add(access_token)
        await db.commit()
        await db.refresh(access_token)  # Reload from DB to get ID


async def delete_token(sub, db: AsyncSession):
    delete_sub = delete(Cloud).where(Cloud.sub == sub)
    if delete_sub is None:
        print("The user is already logged out")
    else:
        await db.execute(delete_sub)
        await db.commit()

async def get_token(request, db: AsyncSession):
    try:
        sub = request.session.get('sub')
        token_value = await db.scalar(select(Cloud.access_token).where(Cloud.sub == sub))
        refresh_value = await db.scalar(select(Cloud.refresh_token).where(Cloud.sub == sub))
        if token_value is None:
            print("Please log in first")
        else:
            dict = {}
            dict["access_token"] = token_value
            dict["refresh_token"] = refresh_value
            return dict
    except Exception as e:
        logger.exception(e)
        raise HTTPException(status_code=500, detail=str(e))








