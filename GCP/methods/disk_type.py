from google.cloud import compute_v1
import google.auth
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request
from google.oauth2.credentials import Credentials
from database.crud import get_token
from config.config import Config


async def disk_list(zone: str, project_id: str, request: Request, db: AsyncSession):
    # Get tokens from database
    token = await get_token(request, db)

    cred = Credentials(token=token['access_token'], refresh_token=token['refresh_token'], token_uri=Config.token_uri,
                       client_id=Config.client_id, client_secret=Config.client_secret)
    # Create a client
    client = compute_v1.DiskTypesClient(credentials=cred)

    # Initialize request argument(s)
    request = compute_v1.ListDiskTypesRequest(
        project= project_id,
        zone= zone,
    )

    # Make the request
    page_result = client.list(request=request)

    my_result = []

    # Handle the response
    for response in page_result:
        my_result.append(response.name)
    return my_result

