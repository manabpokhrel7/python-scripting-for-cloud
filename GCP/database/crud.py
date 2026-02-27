from database.models import Auth, Items
from sqlalchemy import select
from JWT.hash import verify_password, get_password_hash
from sqlalchemy.exc import DBAPIError
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import ValidationError



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









