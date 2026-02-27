from google.cloud import compute_v1
import google.auth

def machine_list():
    # Create a client
    client = compute_v1.MachineTypesClient()
    default_project_id = google.auth.default()[1]
    # Initialize request argument(s)
    request = compute_v1.AggregatedListMachineTypesRequest(
        project= default_project_id,
    )

    # Make the request
    page_result = client.aggregated_list(request=request)
    dict = {}
    for zone, response in page_result:
        if response.machine_types:
            for i in response.machine_types:
                print(f"found {i.name} in {zone}")
                dict[i.name] = zone
    return dict
