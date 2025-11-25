from sqlalchemy.orm import Session
from src.pattern.model import CreatePattern, UpdatePattern
from src.pattern.repository import PatternRepository

class PatternService:
    def __init__(self, db: Session):
        self.db = db
    def create(self, create_data: CreatePattern) -> int:
        id = PatternRepository(self.db).create(create_data) 
        return id
    def get_by_id(self, id: int):
        return PatternRepository(self.db).get_by_id(id)
    def get_by_user_id(self, user_id: int):
        return PatternRepository(self.db).get_by_user_id(user_id)
    def update(self, update_data: UpdatePattern):
        return PatternRepository(self.db).update(update_data)
    def delete(self, id: int):
        return PatternRepository(self.db).delete(id)