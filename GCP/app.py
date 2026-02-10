from __future__ import annotations
from fastapi import FastAPI
from create_instance import (
    create_instance,
    disk_from_image,
)
from google.cloud import compute_v1
import google.auth
import google.auth.exceptions
from create_instance import get_image_from_family
from list_instances import sample_aggregated_list
from delete_instance import sample_delete
from zones import zone_list
from list_images import list_images
from disk_type import disk_list
app = FastAPI()

@app.get("/get_zones")
def get_zones():
    default_project_id = google.auth.default()[1]
    return zone_list(default_project_id)

@app.get("/get_Images")
def get_images(image_project_id: str):
    return list_images(image_project_id)

@app.get("/disk_types")
def disk_types(zone: str):
    return disk_list(zone)

@app.post("/create_machine")
def create_machine( instance_name: str, instance_zone: str):
    disk_type = f"zones/{instance_zone}/diskTypes/pd-standard"
    newest_debian = get_image_from_family(
        project="debian-cloud", family="debian-12"
    )
    disks = [disk_from_image(disk_type, 10, True, newest_debian.self_link)]
    default_project_id = google.auth.default()[1]
    create_instance(default_project_id, instance_zone, instance_name, disks)
    return {f" Here we created the instance {instance_name}"}

@app.get("/list_instance")
def list_instance():
    return sample_aggregated_list()

@app.post("/delete_instance")
def delete_instance(instance_name: str, zone_name: str):
    print(instance_name, zone_name)
    return sample_delete(instance_name , zone_name)











