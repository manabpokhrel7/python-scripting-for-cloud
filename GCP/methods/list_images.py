from google.cloud import compute_v1
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request
from google.oauth2.credentials import Credentials
from database.crud import get_token
from config.config import Config

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

# def list_images(project_id: str):
#     # cred = service_account.Credentials.from_service_account_file('sa-key.json')
#     #To create this key.json file run the following gcloud command from the docs: https://docs.cloud.google.com/iam/docs/keys-create-delete and give this iam permission compute.images.list
#
#
#     # Create a client
#     client = compute_v1.ImagesClient() #THis is the creds file
#
#     # Initialize request argument(s)
#     request = compute_v1.ListImagesRequest(
#         project= project_id,
#     )
#
#     # Make the request
#     page_result = client.list(request=request)
#     print("Choose from this list debian-cloud, ubuntu-os-cloud , cos-cloud , windows-cloud")
#     # Handle the response
#     return [image.name for image in page_result]
#
# from google.cloud import compute_v1

