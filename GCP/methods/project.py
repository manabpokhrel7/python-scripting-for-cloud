from google.cloud import resourcemanager_v3
from google.oauth2.credentials import Credentials
from database.crud import get_token
from config.config import Config
from starlette.requests import Request
from sqlalchemy.ext.asyncio import AsyncSession
from google.cloud import resourcemanager_v3
from logger import logger
from fastapi import HTTPException

async def search_all_accessible_projects(request: Request, db: AsyncSession):
    try:
        # Get tokens from database
        token = await get_token(request, db)
        if token:
            cred = Credentials(token=token['access_token'], refresh_token=token['refresh_token'], token_uri=Config.token_uri,
                               client_id=Config.client_id, client_secret=Config.client_secret)
        else:
            raise HTTPException(status_code=401, detail="Login required")

        # Use ProjectsClient instead of FoldersClient
        client = resourcemanager_v3.ProjectsClient(credentials=cred)

        # If query is empty, it returns all projects you have 'resourcemanager.projects.get' on
        resourceRequest = resourcemanager_v3.SearchProjectsRequest(
            query=""
        )

        # Make the request
        page_result = client.search_projects(request=resourceRequest)

        project_list = []

        # Handle the response
        for id in page_result:
            print(id.project_id)
            project_list.append(id.project_id)
        return project_list
    except Exception as e:
        logger.exception(e)
        raise HTTPException(status_code=500, detail=str(e))



