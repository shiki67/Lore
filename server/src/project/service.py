from sqlalchemy.orm import Session
from src.project.model import CreateProject, UpdateProject
from src.project.repository import ProjectRepository

class ProjectService:
    def __init__(self, db: Session):
        self.db = db
    def create_project(self, project_data: CreateProject) -> int:
        project_id = ProjectRepository(self.db).create_project(project_data) 
        return project_id
    def get_project_by_id(self, project_id: int):
        return ProjectRepository(self.db).get_project_by_id(project_id)
    def get_project_by_user_id(self, user_id: int):
        return ProjectRepository(self.db).get_projects_by_user_id(user_id)
    def update_project(self, project_data: UpdateProject):
        return ProjectRepository(self.db).update_project(project_data)
    def delete_project(self, project_id: int):
        return ProjectRepository(self.db).delete_project(project_id)