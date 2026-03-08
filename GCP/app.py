from fastapi import FastAPI, APIRouter, Depends
from legacyAuth.auth import router as auth
from methods.cloudRoutes import router as cloud
from fastapi.middleware.cors import CORSMiddleware
from database.database import engine, get_db
from database.models import Base
from dotenv import load_dotenv
import json
from fastapi import APIRouter
from starlette.config import Config
from starlette.requests import Request
from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import HTMLResponse, RedirectResponse
from authlib.integrations.starlette_client import OAuth, OAuthError
from database.crud import store_token, delete_token, get_token
from sqlalchemy.ext.asyncio import AsyncSession
from oauth import oauth
import os
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()
router = APIRouter()

secret_key = os.getenv("SECRET_KEY")
#Middleware
app.add_middleware(SessionMiddleware, secret_key=secret_key)
origins = ["http://localhost:5173", "http://127.0.0.1:5173", "https://cloud.manabpokhrel.com.np"]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"],)


@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

#Auth Logic with Google
config = Config('.env')
oauth = OAuth(config)

CONF_URL = 'https://accounts.google.com/.well-known/openid-configuration'
oauth.register(
    name='google', #This register name is used below in the login and auth
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url=CONF_URL,
    client_kwargs={
        'scope': 'openid email profile https://www.googleapis.com/auth/cloud-platform' #Ask this and where does this method initialize
    }
)



app.include_router(auth, prefix="/api")
app.include_router(cloud, prefix="/api/cloud")


@app.get('/test')
async def test(request:Request, db: AsyncSession = Depends(get_db)):
    return await get_token(request, db)

@app.get("/me")
async def get_current_user(request: Request):
    user = request.session.get("sub")
    if not user:
        return JSONResponse({"authenticated": False})
    return JSONResponse({
        "authenticated": True,
        "user": user
    })

@app.get('/')
async def homepage(request: Request):
    user = request.session.get('sub')
    if user:
        data = json.dumps(user)
        html = (
            f'<pre>{data}</pre>'
            '<a href="/logout">logout</a>'
        )
        return HTMLResponse(html)
    return HTMLResponse('<a href="/login">login</a>')

@app.get('/api/login')
async def login(request: Request):
    redirect_uri = request.url_for('auth') #Generates absolute URL for redirect after login to avoid hardcode eg if in localhost localhost:8000/auth
    return await oauth.google.authorize_redirect(request, redirect_uri, access_type="offline", prompt="consent") #THis method Sends the redirect url and our session state which is random unique identifier
#the method is sent to our own developer account because the object oauth has the client information and it sends to our app server in google

#In between this we get a google prompt to sign in to our google accnt and we do that and google sends a authorization code back to us which is utilized by the /auth fun below

@app.get('/api/auth')
async def auth(request: Request, db: AsyncSession = Depends(get_db)):
    try: #The back channel our server to google server conn browser dont see our secret
        token = await oauth.google.authorize_access_token(request) #This method sends the client secret Plus the authorization code recieved after we pass the google prompt and we recieve the token dict
    except OAuthError as error:
        return HTMLResponse(f'<h1>{error.error}</h1>')
    usertoken = token.get('access_token') #From the token dict we use python get method to get the usertoken field from the dict
    userinfo = token.get('userinfo') #The userinfo dict
    refreshtoken = token.get('refresh_token')
    sub = userinfo['sub'] #from the user info dict i extracted unique sub field it is unique to every id
    await store_token(usertoken, refreshtoken, sub, db)
    if usertoken:
        request.session['sub'] = sub #We temporarily store this in our session middleware and it sends us cookie to our browser
    return RedirectResponse(url='http://localhost:5173')

@app.get('/api/logout')
async def logout(request: Request, db: AsyncSession = Depends(get_db)):
    sub = request.session.get('sub')
    await delete_token(sub, db)
    request.session.pop('sub', None) #This sends a HTTP requests back to the client browser to unset the cookie
    request.session.clear()
    return RedirectResponse(url='http://localhost:5173')


@app.get("/api/check_login")
async def check_login(request: Request):
    sub = request.session.get("sub")
    if sub:
        return {"logged_in": True, "sub": sub}
    return {"logged_in": False}


