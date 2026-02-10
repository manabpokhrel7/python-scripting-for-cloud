from google.cloud import compute_v1
import google.auth
def sample_delete(instance_name: str, zone_name: str):
    # Create a client
    client = compute_v1.InstancesClient()
    default_project_id = google.auth.default()[1]
    # Initialize request argument(s)
    request = compute_v1.DeleteInstanceRequest(
        instance=instance_name,
        project=default_project_id,
        zone=zone_name,
    )

    # Make the request
    response = client.delete(request=request)

    # Handle the response
    return f"we have deleted the {response}"