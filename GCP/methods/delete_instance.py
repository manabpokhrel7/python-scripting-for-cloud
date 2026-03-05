from google.cloud import compute_v1
import google.auth
from google.oauth2.credentials import Credentials
from database.crud import get_token
from config.config import Config
from starlette.requests import Request
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
async def sample_delete(instance_name: str, zone_name: str, project_name: str, request: Request, db: AsyncSession):
    try:
        # Get tokens from database
        token = await get_token(request, db)

        cred = Credentials(token=token['access_token'], refresh_token=token['refresh_token'], token_uri=Config.token_uri,
                           client_id=Config.client_id, client_secret=Config.client_secret)

        # Create a client
        client = compute_v1.InstancesClient(credentials=cred)

        # Initialize request argument(s)
        request = compute_v1.DeleteInstanceRequest(
            instance=instance_name,
            project=project_name,
            zone=zone_name,
        )

        # Make the request
        response = client.delete(request=request)

        # Handle the response
        return f"we have deleted the {response}"
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))