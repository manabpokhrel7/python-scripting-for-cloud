from __future__ import annotations
from google.cloud import compute_v1
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request
from google.oauth2.credentials import Credentials
from database.crud import get_token
from config.config import Config
from fastapi import HTTPException


from collections.abc import Iterable



async def list_images(project_id: str, family_id: str, request: Request, db: AsyncSession):
    #Get tokens from database
    token = await get_token(request, db)

    cred = Credentials(token=token['access_token'], refresh_token=token['refresh_token'], token_uri=Config.token_uri, client_id=Config.client_id, client_secret=Config.client_secret)


    # Create a client
    client = compute_v1.ImagesClient(credentials=cred)

    # Initialize request argument(s)
    request = compute_v1.GetFromFamilyImageRequest(
        family= family_id,
        project= project_id,
    )

    # Make the request
    response = client.get_from_family(request=request)

    # Handle the response
    return response.name



async def list_image(project_id: str, request: Request, db: AsyncSession):
    """
    Retrieve a list of images available in given project.

    Args:
        project_id: project ID or project number of the Cloud project you want to list images from.

    Returns:
        An iterable collection of compute_v1.Image objects.
    """
    try:
        token = await get_token(request, db)

        cred = Credentials(token=token['access_token'], refresh_token=token['refresh_token'], token_uri=Config.token_uri,
                           client_id=Config.client_id, client_secret=Config.client_secret)
        print(token)
        image_client = compute_v1.ImagesClient(credentials=cred)
        list_img = image_client.list(project=project_id)
        dict = {}
        dict.update({list_img})
        return dict
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


