from dotenv import load_dotenv
import os

load_dotenv()

class Config():
    # Access environment variables
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    token_uri = os.getenv("TOKEN_URI")