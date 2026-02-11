from __future__ import annotations
from fastapi import FastAPI
from create_instance import (
    create_instance,
    disk_from_image,
)
import google.auth
import google.auth.exceptions
from create_instance import get_image_from_family
from list_instances import sample_aggregated_list
from delete_instance import sample_delete
from zones import zone_list
from list_images import list_images
from disk_type import disk_list
from logger import logger

app = FastAPI()

@app.get("/get_zones")
def get_zones():
    try:
        default_project_id = google.auth.default()[1]
        return zone_list(default_project_id)
    except:
        return "there is no zones available at the moment "

@app.get("/get_Images")
def get_images(image_project_id: str):
    try:
        return list_images(image_project_id)
    except:
        return "there are no images in the region check other regions like debian-cloud, ubuntu-os-cloud , cos-cloud , windows-cloud"

@app.get("/disk_types")
def disk_types(zone: str):
    try:
        return disk_list(zone)
    except:
        return f"there is no disk types available in this {zone}"

@app.post("/create_machine")
def create_machine( instance_name: str, instance_zone: str, disk_type: str):
    try:
        disk_type = f"zones/{instance_zone}/diskTypes/{disk_type}"
        newest_debian = get_image_from_family(
            project="debian-cloud", family="debian-12"
        )
        disks = [disk_from_image(disk_type, 10, True, newest_debian.self_link)]
        default_project_id = google.auth.default()[1]
        create_instance(default_project_id, instance_zone, instance_name, disks)
        return {f" Here we created the instance {instance_name}"}
    except:
        return "Either the region is exhausted choose another region or the instance name is already taken for your region"

@app.get("/list_instance")
def list_instance():
    try:
        return sample_aggregated_list()
    except Exception as e:
        logger.error(f"ERROR: {e}")

@app.post("/delete_instance")
def delete_instance(instance_name: str, zone_name: str):
    try:
        print(instance_name, zone_name)
        return sample_delete(instance_name , zone_name)
    except Exception as e:
        logger.error(f"ERROR: {e}")
        return "We cant find any instances in this project to delete try gcloud auth application-default login and gcloud init command to select another project"











