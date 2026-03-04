from google.cloud import compute_v1
import google.auth
from starlette.requests import Request
from google.oauth2.credentials import Credentials

def sample_delete(instance_name: str, zone_name: str, request: Request):
    Token = request.session.get('access_token')
    print(Token)
    cred = Credentials(Token)
    # Create a client
    client = compute_v1.InstancesClient(credentials=cred)
    default_project_id = google.auth.default()[1]
    # Initialize request argument(s)
    request = compute_v1.DeleteInstanceRequest(
        instance=instance_name,
        project="project-92fd223f-0cf0-4e0e-95c",
        zone=zone_name,
    )

    # Make the request
    response = client.delete(request=request)

    # Handle the response
    return f"we have deleted the {response}"