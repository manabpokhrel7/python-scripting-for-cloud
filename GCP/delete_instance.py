from google.cloud import compute_v1

def sample_delete(instance_name: str, project_name: str, zone_name: str):
    # Create a client
    client = compute_v1.InstancesClient()

    # Initialize request argument(s)
    request = compute_v1.DeleteInstanceRequest(
        instance=instance_name,
        project=project_name,
        zone=zone_name,
    )

    # Make the request
    response = client.delete(request=request)

    # Handle the response
    print(response)