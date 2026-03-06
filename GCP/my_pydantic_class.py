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


###Below is for the cloud Routes

class getProject(BaseModel):
    project_id: str

class getImage(BaseModel):
    family_id: str
    image_project_id: str

class getZone(getProject):
    zone: str

class deleteInstance(getZone):
    instance_name: str

class createInstance(BaseModel):
    project_id: str
    zone: str
    instance_name: str
    machine_type: str
    image_project: str
    image_family: str
    disk_type: str
    disk_size_gb: int


#Cloud Response Model
class projectResponse(BaseModel):
    project_name: list[str]

class zoneResponse(BaseModel):
    zone_name: list[str]

class imageResponse(BaseModel):
    image_name: str

class diskResponse(BaseModel):
    disk_name: list[str]

class machineResponse(BaseModel):
    machine_name: dict

class instanceResponse(BaseModel):
    instance_name: dict

class deleteResponse(BaseModel):
    delete_details: str