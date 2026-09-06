from fastapi import FastAPI, Depends, HTTPException, WebSocket, UploadFile, File
from legacyAuth.auth import router as auth
from methods.cloudRoutes import router as cloud
from AI.aitest import router as ai
from fastapi.middleware.cors import CORSMiddleware
from database.database import engine, get_db
from database.models import Base
import json
from fastapi import APIRouter
from starlette.config import Config
from starlette.requests import Request
from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import HTMLResponse, RedirectResponse
from authlib.integrations.starlette_client import OAuth, OAuthError
from database.crud import store_token, delete_token, get_token, health_check
from sqlalchemy.ext.asyncio import AsyncSession
from oauth import oauth
import os
from dotenv import load_dotenv
from cache.redis import r
from prometheus_fastapi_instrumentator import Instrumentator
import asyncio, asyncssh, sys


load_dotenv()
app = FastAPI()
router = APIRouter()

secret_key = os.getenv("SECRET_KEY")
#Middleware
app.add_middleware(SessionMiddleware, secret_key=secret_key)
origins = ["http://localhost:5173", "http://127.0.0.1:5174", "https://cloud.manabpokhrel.com.np", "https://kubernetes.manabpokhrel.com.np"]
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
app.include_router(ai, prefix="/api/ai")

Instrumentator().instrument(app).expose(app, endpoint="/metrics")


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connection_info = await websocket.receive_json() #Recieving in json format from frontend
    private_key = asyncssh.import_private_key(
        connection_info["client_keys"]
    ) #client_keys below will only accept file so we have to do this or it will think the entire string is filename
    async with asyncssh.connect(connection_info["host"], username=connection_info["username"], client_keys=[private_key], known_hosts=None) as conn:
        process = await conn.create_process(term_type="xterm-256color", term_size=(100,100))

        async def websocket_to_ssh():
            while True:
                data = await websocket.receive_text()
                process.stdin.write(data)

        async def ssh_to_websocket():
            while True:
                output = await process.stdout.read(n=100)
                if not output:
                    break
                await websocket.send_text(output)

        await asyncio.gather(
            websocket_to_ssh(),
            ssh_to_websocket()
        )



# @app.post('/api/ssh')
# async def run_client(host: str, username: str, client_keys: UploadFile = File(...)) -> str:
#     key_data = await client_keys.read()
#     async with asyncssh.connect(host, username=username, client_keys=[key_data], known_hosts=None) as conn:
#         try:
#             result = await conn.run('ls /', check=True)
#             return result.stdout
#         except asyncssh.ProcessError as exc:
#             print(exc.stderr, end='')
#             print(f'Process exited with status {exc.exit_status}',
#                   file=sys.stderr)
#         else:
#             print(result.stdout, end='')



@app.get('/api/health')
async def healthcheck(db: AsyncSession = Depends(get_db)):
    return await health_check(db)

@app.get('/test')
async def test(request: Request, db: AsyncSession = Depends(get_db)):
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


# Use below for localhost testing or else hardcode the HTTPS

# @app.get('/api/login')
# async def login(request: Request):
#     redirect_uri = request.url_for('auth') #Generates absolute URL for redirect after login to avoid hardcode eg if in localhost localhost:8000/auth
#     return await oauth.google.authorize_redirect(request, redirect_uri, access_type="offline", prompt="consent") #THis method Sends the redirect url and our session state which is random unique identifier
#the method is sent to our own developer account because the object oauth has the client information and it sends to our app server in google

#In between this we get a google prompt to sign in to our google accnt and we do that and google sends a authorization code back to us which is utilized by the /auth fun below

#Hardcoded https redirect below
@app.get('/api/login')
async def login(request: Request):
    redirect_uri = "https://kubernetes.manabpokhrel.com.np/api/auth"  # force HTTPS
    return await oauth.google.authorize_redirect(
        request,
        redirect_uri,
        access_type="offline",
        prompt="consent"
    )

@app.get('/api/auth')
async def auth(request: Request, db: AsyncSession = Depends(get_db)):
    try: #The back channel our server to google server conn browser dont see our secret
        token = await oauth.google.authorize_access_token(request) #This method sends the client secret Plus the authorization code recieved after we pass the google prompt and we recieve the token dict
    except OAuthError as error:
        return HTMLResponse(f'<h1>{error.error}</h1>')
    print(token)
    usertoken = token.get('access_token') #From the token dict we use python get method to get the usertoken field from the dict
    userinfo = token.get('userinfo') #The userinfo dict
    refreshtoken = token.get('refresh_token')
    sub = userinfo['sub'] #from the user info dict i extracted unique sub field it is unique to every id
    await store_token(usertoken, refreshtoken, sub, db)
    if usertoken:
        request.session['sub'] = sub #We temporarily store this in our session middleware and it sends us cookie to our browser
    return RedirectResponse(url='https://kubernetes.manabpokhrel.com.np/')

@app.get('/api/logout')
async def logout(request: Request, db: AsyncSession = Depends(get_db)):
    sub = request.session.get('sub')
    r.delete(request.session.get('sub'))
    await delete_token(sub, db)
    request.session.pop('sub', None) #This sends a HTTP requests back to the client browser to unset the cookie
    request.session.clear()
    return RedirectResponse(url='https://kubernetes.manabpokhrel.com.np/')


@app.get("/api/check_login")
async def check_login(request: Request):
    sub = request.session.get("sub")
    if sub:
        return {"logged_in": True, "sub": sub}
    return {"logged_in": False}


