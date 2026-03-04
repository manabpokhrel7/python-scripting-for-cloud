from fastapi import HTTPException, APIRouter, Depends
from methods.create_instance import (
    create_instance,
    disk_from_image,
)
from methods.create_instance import get_image_from_family
from methods.list_instances import sample_aggregated_list
from methods.delete_instance import sample_delete
from methods.zones import zone_list
from methods.list_images import list_images
from methods.disk_type import disk_list
from methods.machinetype import machine_list
from methods.project import search_all_accessible_projects
from logger import logger
from starlette.requests import Request
from database.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession



router = APIRouter(prefix="/cloud", tags=["Cloud"])

@router.post("/get_projects")
async def get_projects(request: Request, db: AsyncSession = Depends(get_db)):
    return await search_all_accessible_projects(request, db)


@router.get("/get_zones")
async def get_zones(project_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    try:
        return await zone_list(project_id, request, db)
    except:
        raise HTTPException(status_code=404, detail="Zone not found")

@router.get("/get_Images")
async def get_images(family_id: str, image_project_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    try:
        return await list_images(image_project_id, family_id, request, db)
    except:
        raise HTTPException(status_code=404, detail="Image not found")

@router.get("/disk_types")
async def disk_types(zone: str, project_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    try:
        return await disk_list(zone, project_id, request, db)
    except:
        return f"there is no disk types available in this {zone}"

@router.post("/machine_type")
async def machine_type(project_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    return await machine_list(project_id, request, db)

@router.post("/create_machine")
async def create_machine( instance_name: str, instance_zone: str, disk_type: str, image_project: str, image_family: str, machine_type: str, disk_size_gb: int, project_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    try:
        disk_type = f"zones/{instance_zone}/diskTypes/{disk_type}"
        newest_debian = await get_image_from_family(
            request, db, project= image_project, family= image_family,
        )
        disks = [await disk_from_image(disk_type, disk_size_gb, True, newest_debian.self_link)]
        await create_instance(project_id, instance_zone, instance_name, disks, machine_type, request, db)
        logger.info('instance successfully created ')
        return {f" Here we created the instance {instance_name}"}
    except Exception as e:
        logger.error(f"Error: {e}")

@router.get("/list_instance")
async def list_instance(project_name: str, request: Request, db: AsyncSession = Depends(get_db)):
    try:
        return await sample_aggregated_list(project_name, request, db)
    except Exception as e:
        logger.exception(f"ERROR: {e}")

@router.post("/delete_instance")
async def delete_instance(instance_name: str, zone_name: str, project_name: str,  request: Request, db: AsyncSession = Depends(get_db)):
    try:
        print(instance_name, zone_name)
        return await sample_delete(instance_name , zone_name, project_name, request, db)
    except Exception as e:
        logger.error(f"ERROR: {e}")
        return f"{e}"
