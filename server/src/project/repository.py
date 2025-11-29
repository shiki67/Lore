from typing import List
from sqlalchemy.orm import Session
from src.project.model import Project, CreateProject, UpdateProject
from passlib.context import CryptContext
from src.exception import UnauthorizedException, NotFoundException

class ProjectRepository:
    def __init__(self, db: Session):
        self.db = db
    def create_project(self, project_data: CreateProject, user_id) -> int:
        project = Project(
            name = project_data.name,
            description = project_data.description,
            user_id = user_id
        )
        self.db.add(project)
        self.db.commit()
        return project.id
    def get_projects_by_user_id(self, user_id: int) -> List[Project]:
        return self.db.query(Project).filter(Project.user_id == user_id).all()
    def get_project_by_id(self, project_id: int):
        return self.db.query(Project).filter(Project.id == project_id).first()
    def update_project(self, update_data: UpdateProject):
        project = self.get_project_by_id(update_data.id)
        if project:
            update_dict = update_data.model_dump()
            update_dict.pop('id', None)
            for key, value in update_dict.items():
                if hasattr(project, key):
                    setattr(project, key, value)
            self.db.commit()
            self.db.refresh(project)
        return project
    def delete_project(self, project_id: int) -> bool:
        project = self.get_project_by_id(project_id)
        if project:
            self.db.delete(project)
            self.db.commit()
            return True
        return False