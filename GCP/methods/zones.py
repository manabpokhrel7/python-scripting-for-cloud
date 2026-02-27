from google.cloud import compute_v1

def zone_list(project_id: str):
    # Create a client
    client = compute_v1.ZonesClient()

    # Initialize request argument(s)
    request = compute_v1.ListZonesRequest(
        project= project_id ,
    )

    # Make the request
    page_result = client.list(request=request)
    # # Handle the response
    # for zone in page_result:
    #     return zone.name

    return [zone.name for zone in page_result]