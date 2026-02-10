from google.cloud import compute_v1
import google.auth
def disk_list(zone: str):
    default_project_id = google.auth.default()[1]
    # Create a client
    client = compute_v1.DiskTypesClient()

    # Initialize request argument(s)
    request = compute_v1.ListDiskTypesRequest(
        project= default_project_id,
        zone= zone,
    )

    # Make the request
    page_result = client.list(request=request)

    my_result = []

    # Handle the response
    for response in page_result:
        my_result.append(response.name)
    return my_result

