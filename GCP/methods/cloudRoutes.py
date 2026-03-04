from fastapi import HTTPException, APIRouter, Depends
from methods.create_instance import (
    create_instance,
    disk_from_image,
)
import google.auth
import google.auth.exceptions
from methods.create_instance import get_image_from_family
from methods.list_instances import sample_aggregated_list
from methods.delete_instance import sample_delete
from methods.zones import zone_list
from methods.list_images import list_images
from methods.disk_type import disk_list
from methods.machinetype import machine_list
from logger import logger
from starlette.requests import Request
from database.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession



router = APIRouter(prefix="/cloud", tags=["Cloud"])

@router.get("/get_zones")
def get_zones():
    try:
        default_project_id = google.auth.default()[1]
        return zone_list(default_project_id)
    except:
        raise HTTPException(status_code=404, detail="Zone not found")

@router.get("/get_Images")
def get_images(family_id: str, image_project_id: str):
    try:
        return list_images(image_project_id, family_id)
    except:
        raise HTTPException(status_code=404, detail="Image not found")

@router.get("/disk_types")
def disk_types(zone: str):
    try:
        return disk_list(zone)
    except:
        return f"there is no disk types available in this {zone}"

@router.post("/machine_type")
def machine_type():
    return machine_list()

@router.post("/create_machine")
def create_machine( instance_name: str, instance_zone: str, disk_type: str, image_project: str, image_family: str, machine_type: str, disk_size_gb: int):
    try:
        disk_type = f"zones/{instance_zone}/diskTypes/{disk_type}"
        newest_debian = get_image_from_family(
            project= image_project, family= image_family
        )
        disks = [disk_from_image(disk_type, disk_size_gb, True, newest_debian.self_link)]
        default_project_id = "project-92fd223f-0cf0-4e0e-95c"
        create_instance(default_project_id, instance_zone, instance_name, disks, machine_type)
        logger.info('instance successfully created ')
        return {f" Here we created the instance {instance_name}"}
    except Exception as e:
        logger.error(f"Error: {e}")

@router.get("/list_instance")
async def list_instance(request: Request, db: AsyncSession = Depends(get_db)):
    try:
        return await sample_aggregated_list(request, db)
    except Exception as e:
        logger.exception(f"ERROR: {e}")

@router.post("/delete_instance")
def delete_instance(instance_name: str, zone_name: str, request: Request):
    try:
        print(instance_name, zone_name)
        return sample_delete(instance_name , zone_name, request)
    except Exception as e:
        logger.error(f"ERROR: {e}")
        return "We cant find any instances in this project to delete try gcloud auth application-default login and gcloud init command to select another project"



