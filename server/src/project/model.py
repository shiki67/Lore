from sqlalchemy import Column, String, Integer, ForeignKey
from src.database import Base
from pydantic import BaseModel
from typing import Optional

class Project(Base):
    __tablename__ = 'project'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(120))
    description = Column(String(1500))
    user_id = Column(Integer, ForeignKey('user.id'))

class CreateProject(BaseModel):
    name: str
    description: str

class UpdateProject(BaseModel):
    id: int
    name: Optional[str] = None
    description: Optional[str] = None