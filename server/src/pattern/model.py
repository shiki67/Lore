from sqlalchemy import Column, String, Integer, JSON, ForeignKey
from src.database import Base
from pydantic import BaseModel
from typing import List, Optional

class Pattern(Base):
    __tablename__ = 'pattern'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String)
    fields = Column(JSON)
    user_id = Column(Integer, ForeignKey('user.id'))
    @classmethod
    def create_default_pattern(cls, session):
        default_pattern = session.query(cls).filter_by(id=0).first()
        if not default_pattern:
            default_pattern = cls(
                id=0,
                name="Анкета персонажа",
                fields=["Полное имя", "Сокращенное имя", "Дата рождения", "Возраст", "Раса", "Описание", "История"]
            )
            session.add(default_pattern)
            session.commit()

class CreatePattern(BaseModel):
    name: int
    fields: List[str]
    user_id: Optional[int] = None

class UpdatePattern(BaseModel):
    id: int
    name: Optional[int] = None
    fields: Optional[List[str]] = []