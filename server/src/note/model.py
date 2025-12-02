from sqlalchemy import Column, String, Integer, JSON, ForeignKey
from src.database import Base
from pydantic import BaseModel
from typing import List, Optional

class Note(Base):
    __tablename__ = 'note'
    id = Column(Integer, primary_key=True, autoincrement=True)
    data = Column(JSON)
    pattern_id = Column(Integer, ForeignKey('pattern.id'))
    user_id = Column(Integer, ForeignKey('user.id'))
    project_id = Column(Integer)
    
class CreateNote(BaseModel):
    data: dict
    pattern_id: int

class UpdateNote(BaseModel):
    id: int
    data: Optional[dict] = None
    pattern_id: Optional[int] = None
    project_id: Optional[int] = None
    