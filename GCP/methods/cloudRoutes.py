from fastapi import HTTPException, APIRouter, Depends
from methods.create_instance import (
    create_instance,
    disk_from_image,
)
from methods.create_instance import get_image_from_family
from methods.list_instances import sample_aggregated_list
from methods.delete_instance import sample_delete
from methods.zones import zone_list
from methods.list_images import list_images, list_image
from methods.disk_type import disk_list
from methods.machinetype import machine_list
from methods.project import search_all_accessible_projects
from methods.projectcreate import sample_create_project, sample_delete_project
from logger import logger
from starlette.requests import Request
from database.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from my_pydantic_class import (getProject, getImage, getZone, deleteInstance, createInstance, projectResponse,
                               zoneResponse, imageResponse, diskResponse, machineResponse, instanceResponse,
                               deleteResponse)



router = APIRouter( tags=["Cloud"])

@router.post("/get_projects", response_model=projectResponse)
async def get_projects(request: Request, db: AsyncSession = Depends(get_db)):
    try:
        projectList = await search_all_accessible_projects(request, db)
        return projectResponse(project_name=projectList)
    except Exception as e:
        logger.exception(e)
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/get_zones", response_model=zoneResponse)
async def get_zones(payload: getProject, request: Request, db: AsyncSession = Depends(get_db)):
    try:
        result= await zone_list(payload.project_id, request, db)
        return zoneResponse(zone_name=result)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/get_Images", response_model=imageResponse)
async def get_images(payload: getImage, request: Request, db: AsyncSession = Depends(get_db)):
    try:
        result= await list_images(payload.image_project_id, payload.family_id, request, db)
        return imageResponse(image_name=result)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/disk_types", response_model=diskResponse)
async def disk_types(payload: getZone, request: Request, db: AsyncSession = Depends(get_db)):
    try:
        result= await disk_list(payload.zone, payload.project_id, request, db)
        return diskResponse(disk_name=result)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/machine_type", response_model=machineResponse)
async def machine_type(payload: getProject, request: Request, db: AsyncSession = Depends(get_db)):
    try:
        result= await machine_list(payload.project_id, request, db)
        return machineResponse(machine_name=result)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/create_machine")
async def create_machine(payload: createInstance, request: Request, db: AsyncSession = Depends(get_db)):
    try:
        final_disk_type = f"zones/{payload.zone}/diskTypes/{payload.disk_type}"
        newest_debian = await get_image_from_family(
            request, db, project= payload.image_project, family= payload.image_family,
        )
        disks = [await disk_from_image(final_disk_type, payload.disk_size_gb, True, newest_debian.self_link)]
        await create_instance(payload.project_id, payload.zone, payload.instance_name, disks, payload.machine_type, request, db)
        logger.info('instance successfully created ')
        return {f" Here we created the instance {payload.instance_name}"}
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/list_instance", response_model=instanceResponse)
async def list_instance(payload: getProject, request: Request, db: AsyncSession = Depends(get_db)):
    try:
        result= await sample_aggregated_list(payload.project_id, request, db)
        return instanceResponse(instance_name=result)
    except Exception as e:
        logger.exception(f"ERROR: {e}")
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/delete_instance", response_model=deleteResponse)
async def delete_instance(payload: deleteInstance,  request: Request, db: AsyncSession = Depends(get_db)):
    try:
        result= await sample_delete(payload.instance_name , payload.zone, payload.project_id, request, db)
        return deleteResponse(delete_details=result)
    except Exception as e:
        logger.error(f"ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/get_all_images")
async def list_images(project_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    try:
        result = await list_image(project_id, request, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/project_create")
async def create_project(project_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    try:
        return await sample_create_project(project_id, request, db)
    except Exception as e:
        logger.exception(e)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/project_delete")
async def delete_project(project_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    try:
        return await sample_delete_project(project_id, request, db)
    except Exception as e:
        logger.error(f"ERROR deleting project {project_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

