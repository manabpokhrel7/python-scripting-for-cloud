import json
from fastapi import APIRouter
from starlette.config import Config
from starlette.requests import Request
from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import HTMLResponse, RedirectResponse
from authlib.integrations.starlette_client import OAuth, OAuthError

def oauth():
    config = Config('.env')
    oauth = OAuth(config)

    CONF_URL = 'https://accounts.google.com/.well-known/openid-configuration'
    oauth.register(
        name='google', #This register name is used below in the login and auth
        server_metadata_url=CONF_URL,
        client_kwargs={
            'scope': 'openid email profile https://www.googleapis.com/auth/cloud-platform' #Ask this and where does this method initialize
        }
    )



# The Login Click: You send the user to Google. Your session cookie stores a state (to prevent hacking), and the URL you send to Google contains your Client ID and Redirect URI. (Note: Your Secret stays on your server; it is never sent to the browser). [1, 2]
# The Google Part: The user clicks "Allow." Google redirects the browser back to your /auth page. [3, 4]
# The "Front-Channel" Code: As you said, Google puts a temporary Authorization Code right in the URL (e.g., ?code=123...). This is the "Front-Channel." [5, 6]
# The "Back-Channel" Trade: Inside your /auth function, authorize_access_token grabs that code from the URL and sends it—along with your Client Secret—directly to Google's server in the background. [5, 7]
# The Prize (The Token): Google verifies the secret and the code, then sends back the Token (containing the user's email/name). [7, 8]

# Front-Channel (The Browser/URL): Like a postcard. Everyone can see it (the code in the URL), but it's only a "claim ticket." [2, 4]
# Back-Channel (Server-to-Server): Like a private phone call. It happens behind the scenes between your FastAPI server and Google's server. This is where the real "money" (the token) is exchanged. [5, 6]