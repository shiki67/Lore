from typing import List
from sqlalchemy.orm import Session
from src.pattern.model import Pattern, CreatePattern, UpdatePattern
from passlib.context import CryptContext
from src.exception import UnauthorizedException, NotFoundException

class PatternRepository:
    def __init__(self, db: Session):
        self.db = db
    def create(self, pattern_data: CreatePattern) -> int:
        pattern = Pattern(
            name = pattern_data.name,
            fields = pattern_data.fields,
            user_id = pattern_data.user_id
        )
        self.db.add(pattern)
        self.db.commit()
        return pattern.id
    def get_by_user_id(self, user_id: int) -> List[Pattern]:
        return self.db.query(Pattern).filter((Pattern.user_id == user_id) | (Pattern.user_id.is_(None))).all()
    def get_by_id(self, pattern_id: int):
        return self.db.query(Pattern).filter(Pattern.id == pattern_id).first()
    def update(self, update_data: UpdatePattern):
        pattern = self.get_by_id(update_data.id)
        if pattern:
            update_dict = update_data.model_dump()
            update_dict.pop('id', None)
            for key, value in update_dict.items():
                if hasattr(pattern, key):
                    setattr(pattern, key, value)
            self.db.commit()
            self.db.refresh(pattern)
        return pattern
    def delete(self, id: int) -> bool:
        pattern = self.get_by_id(id)
        if pattern:
            self.db.delete(pattern)
            self.db.commit()
            return True
        return False