# This snippet has been automatically generated and should be regarded as a
# code template only.
# It will require modifications to work:
# - It may require correct/in-range values for request initialization.
# - It may require specifying regional endpoints when creating the service
#   client as shown in:
#   https://googleapis.dev/python/google-api-core/latest/client_options.html
from google.cloud import resourcemanager_v3

def sample_list_projects():
    # Create a client
    client = resourcemanager_v3.ProjectsClient()

    # Initialize request argument(s)
    request = resourcemanager_v3.ListProjectsRequest(
        parent="parent_value",
    )

    # Make the request
    page_result = client.list_projects(request=request)

    # Handle the response
    for response in page_result:
        print(response)