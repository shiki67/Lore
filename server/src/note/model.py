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
    
class CreateNote(BaseModel):
    data: dict[str]
    pattern_id: int
    user_id: int

class UpdateNote(BaseModel):
    id: int
    data: Optional[dict[str]] = None
    pattern_id: Optional[int] = None
    