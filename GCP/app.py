from typing import Annotated

from authlib.integrations.flask_client import OAuth
from fastapi import FastAPI, HTTPException, Depends, status, APIRouter
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import DBAPIError
from legacyAuth.auth import router as auth
from methods.cloudRoutes import router as cloud
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
from dotenv import load_dotenv

load_dotenv()
# ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI()
router = APIRouter()

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.secret_key = 'app-secret-key'
@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        yield Base.metadata.create_all(conn)



app.include_router(auth, prefix="/api")
app.include_router(cloud, prefix="/cloud")
# app.include_router(google, prefix="/google")

#

#
# # This is the new Auth
# google = OAuth(app).register(
#     "myApp",
#     client_id=os.getenv('secret_id'),
#     client_secret=os.getenv('secret_key'),
#     server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
#     client_kwargs={'scope': 'openid email profile'},
# )
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
#
#
#
#
#
