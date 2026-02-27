from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = None



class TokenData(BaseModel):
    username: str | None = None

class CreateUser(BaseModel):
    user_name: str
    user_password: str
    user_email: str

class CreateItem(BaseModel):
    item_name: str
    item_desc: str

class CreateResponse(BaseModel):
    product: str
    description: str

class UserResponse(BaseModel):
    name: str
