from google.cloud import compute_v1



def list_images(project_id: str):
    # cred = service_account.Credentials.from_service_account_file('sa-key.json')
    #To create this key.json file run the following gcloud command from the docs: https://docs.cloud.google.com/iam/docs/keys-create-delete and give this iam permission compute.images.list


    # Create a client
    client = compute_v1.ImagesClient() #THis is the creds file

    # Initialize request argument(s)
    request = compute_v1.ListImagesRequest(
        project= project_id,
    )

    # Make the request
    page_result = client.list(request=request)
    print("Choose from this list debian-cloud, ubuntu-os-cloud , cos-cloud , windows-cloud")
    # Handle the response
    return [image.name for image in page_result]