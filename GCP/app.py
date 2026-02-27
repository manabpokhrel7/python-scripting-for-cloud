from typing import Annotated
from fastapi import FastAPI, HTTPException, Depends, status, APIRouter
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import DBAPIError
from legacyAuth.auth import router as auth
from methods.create_instance import (
    create_instance,
    disk_from_image,
)
import google.auth
import google.auth.exceptions
from methods.create_instance import get_image_from_family
from methods.list_instances import sample_aggregated_list
from methods.delete_instance import sample_delete
from methods.zones import zone_list
from methods.list_images import list_images
from methods.disk_type import disk_list
from methods.machinetype import machine_list
from logger import logger
from fastapi.middleware.cors import CORSMiddleware
from database.database import engine, get_db
from database.models import Base
# from database.crud import create_user, list_item, create_item
# from JWT.jwt import authenticate_user, get_current_user, create_access_token
# from my_pydantic_class import Token, CreateUser, CreateItem, CreateResponse, UserResponse
# from datetime import timedelta
# from sqlalchemy.ext.asyncio import AsyncSession
# from oauth import authorize_access_token
import os
# ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI()
app.secret_key = 'app-secret-key'
router = APIRouter()

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth, prefix="/api")
app.include_router(cloud, prefix="/api")


@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        yield Base.metadata.create_all(conn)


secret_id = os.getenv()
secret_key = os.getenv()

# This is the new Auth
google = OAuth(app).register(
    "myApp",
    client_id=secret_id,
    client_secret=secret_key,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'},
)
#
# @app.post('/')
# def homepage():
#     print('home page')
#     return '<a href="/login">Log in with Google</a>'
#
# @app.post('/login')
# def login():
#     redirect_uri = url_for('authorize', _external=True)
#     return google.authorize_redirect(redirect_uri)
#
# @app.get('/authorize')
# def authorize():
#     token = google.authorize_access_token()
#     session['user'] = token
#
#     userToken = session.get('user')
#     userInfo = userToken['userinfo']
#     page = f'<h2>Hello {userInfo['given_name']}</h2>'
#     page += '<p><strong>Your email:</strong></p>'
#     page += f'<p>{userInfo['email']}</p>'
#     return page


####Below is Cloud logic


# @app.get("/get_zones")
# def get_zones():
#     try:
#         default_project_id = google.auth.default()[1]
#         return zone_list(default_project_id)
#     except:
#         raise HTTPException(status_code=404, detail="Zone not found")
#
# @app.get("/get_Images")
# def get_images(family_id: str, image_project_id: str):
#     try:
#         return list_images(image_project_id, family_id)
#     except:
#         raise HTTPException(status_code=404, detail="Image not found")
#
# @app.get("/disk_types")
# def disk_types(zone: str):
#     try:
#         return disk_list(zone)
#     except:
#         return f"there is no disk types available in this {zone}"
#
# @app.post("/machine_type")
# def machine_type():
#     return machine_list()
#
# @app.post("/create_machine")
# def create_machine( instance_name: str, instance_zone: str, disk_type: str, image_project: str, image_family: str, machine_type: str, disk_size_gb: int):
#     try:
#         disk_type = f"zones/{instance_zone}/diskTypes/{disk_type}"
#         newest_debian = get_image_from_family(
#             project= image_project, family= image_family
#         )
#         disks = [disk_from_image(disk_type, disk_size_gb, True, newest_debian.self_link)]
#         default_project_id = google.auth.default()[1]
#         create_instance(default_project_id, instance_zone, instance_name, disks, machine_type)
#         logger.info('instance successfully created ')
#         return {f" Here we created the instance {instance_name}"}
#     except Exception as e:
#         logger.error(f"Error: {e}")
#
# @app.get("/list_instance")
# def list_instance():
#     try:
#         return sample_aggregated_list()
#     except Exception as e:
#         logger.exception(f"ERROR: {e}")
#
# @app.post("/delete_instance")
# def delete_instance(instance_name: str, zone_name: str):
#     try:
#         print(instance_name, zone_name)
#         return sample_delete(instance_name , zone_name)
#     except Exception as e:
#         logger.error(f"ERROR: {e}")
#         return "We cant find any instances in this project to delete try gcloud auth application-default login and gcloud init command to select another project"
#
#
#
#
#
#
#




