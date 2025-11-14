from fastapi import APIRouter, Depends, Form
from src.database import get_db
from sqlalchemy.orm import Session
from src.project.model import Project, CreateProject, UpdateProject
from src.project.service import ProjectService
from src.token.service import get_current_user_id
from src.users.model import User
from src.exceptions import NotFoundException

router = APIRouter()

@router.post("/project")
async def add_project(
    project_data: CreateProject,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
    ):
    project_id = ProjectService(db).create_project(project_data, user_id)
    return {"project_id": project_id}

@router.get("/project")
async def get_my_films(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    return ProjectService(db).get_project_by_user_id(user_id)

@router.get("/project/{project_id}")
async def get_film_by_id(
    project_id: int, 
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
    ):
    project = ProjectService(db).get_project_by_id(project_id, user_id)
    if not project:
        raise NotFoundException()
    return project

@router.put("/project/{project_id}")
async def update_film(
    project_data: UpdateProject,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    updated_data = ProjectService(db).update_project(project_data, user_id)
    if not updated_data:
        raise NotFoundException()
    return {"project": updated_data}

@router.delete("/projects/{project_id}")
async def delete_film(
    project_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    success = ProjectService(db).delete_film(project_id, user_id)
    if not success:
        raise NotFoundException()
    return {"message": "Проект удален"}