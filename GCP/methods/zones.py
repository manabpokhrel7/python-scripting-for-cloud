from google.cloud import compute_v1
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request
from google.oauth2.credentials import Credentials
from database.crud import get_token
from config.config import Config


async def zone_list(project_id: str, request: Request, db: AsyncSession):
    #Get tokens from database
    token = await get_token(request, db)

    cred = Credentials(token=token['access_token'], refresh_token=token['refresh_token'], token_uri=Config.token_uri, client_id=Config.client_id, client_secret=Config.client_secret)


    # Create a client
    client = compute_v1.ZonesClient(credentials=cred)

    # Initialize request argument(s)
    request = compute_v1.ListZonesRequest(
        project= project_id ,
    )

    # Make the request
    page_result = client.list(request=request)
    # # Handle the response
    # for zone in page_result:
    #     return zone.name

    return [zone.name for zone in page_result]