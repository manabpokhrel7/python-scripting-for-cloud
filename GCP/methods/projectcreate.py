# This snippet has been automatically generated and should be regarded as a
# code template only.
# It will require modifications to work:
# - It may require correct/in-range values for request initialization.
# - It may require specifying regional endpoints when creating the service
#   client as shown in:
#   https://googleapis.dev/python/google-api-core/latest/client_options.html
import logger
from google.cloud import resourcemanager_v3
from database.crud import get_token
from config.config import Config
from starlette.requests import Request
from sqlalchemy.ext.asyncio import AsyncSession
from google.cloud import resourcemanager_v3
from google.oauth2.credentials import Credentials
from fastapi import HTTPException
from logger import logger


async def sample_create_project(project_id: str, request: Request, db: AsyncSession):
    try:
        token = await get_token(request, db)
        cred = Credentials(token=token['access_token'], refresh_token=token['refresh_token'], token_uri=Config.token_uri,
                           client_id=Config.client_id, client_secret=Config.client_secret)
            # Create a client
        client = resourcemanager_v3.ProjectsAsyncClient(credentials=cred)
            # Initialize request argument(s)
        request = resourcemanager_v3.CreateProjectRequest(
            project={
                "project_id": project_id,
            }
            )
            # Make the request
        await client.create_project(request=request)
        return f"The project {project_id} is created"
    except Exception as e:
        logger.exception(e)
        raise HTTPException(status_code=500, detail=str(e))


async def sample_delete_project(project_id: str, request: Request, db: AsyncSession):
    token = await get_token(request, db)
    cred = Credentials(token=token['access_token'], refresh_token=token['refresh_token'], token_uri=Config.token_uri,
                       client_id=Config.client_id, client_secret=Config.client_secret)
    # Create a client
    client = resourcemanager_v3.ProjectsClient(credentials=cred)
    # Initialize request argument(s)
    request = resourcemanager_v3.DeleteProjectRequest(
        name=project_id
    )
    # Make the request
    operation = client.delete_project(request=request)
    print("Waiting for operation to complete...")
    response = await operation.result()
    # Handle the response
    print(response)
