from google.cloud import compute_v1
import google.auth
from google.oauth2.credentials import Credentials
from database.crud import get_token
from config.config import Config
from starlette.requests import Request
from sqlalchemy.ext.asyncio import AsyncSession
from google.cloud import resourcemanager_v3

async def machine_list(project_id: str, request: Request, db: AsyncSession):
    # Get tokens from database
    token = await get_token(request, db)

    cred = Credentials(token=token['access_token'], refresh_token=token['refresh_token'], token_uri=Config.token_uri,
                       client_id=Config.client_id, client_secret=Config.client_secret)

    # Create a client
    client = compute_v1.MachineTypesClient(credentials=cred)

    # Initialize request argument(s)
    request = compute_v1.AggregatedListMachineTypesRequest(
        project= project_id,
    )

    # Make the request
    page_result = client.aggregated_list(request=request)
    dict = {}
    for zone, response in page_result:
        if response.machine_types:
            for i in response.machine_types:
                dict[i.name] = zone
    return dict
