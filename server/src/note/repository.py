from typing import List
from sqlalchemy.orm import Session
from src.note.model import Note, CreateNote, UpdateNote
from sqlalchemy import and_
from passlib.context import CryptContext
from src.exception import UnauthorizedException, NotFoundException

class NoteRepository:
    def __init__(self, db: Session):
        self.db = db
    def create(self, create_data: CreateNote, user_id: int) -> int:
        note = Note(
            data = create_data.data,
            pattern_id = create_data.pattern_id,
            user_id = user_id
        )
        self.db.add(note)
        self.db.commit()
        return note.id
    def get_by_user_id(self, user_id: int) -> List[Note]:
        return self.db.query(Note).filter(Note.user_id == user_id).all()
    def get_for_project(self, user_id: int, project_id):
        return self.db.query(Note).filter(
        Note.user_id == user_id,
        Note.project_id == project_id
        ).all()
    def get_by_id(self, pattern_id: int):
        return self.db.query(Note).filter(Note.id == pattern_id).first()
    def update(self, update_data: UpdateNote):
        note = self.get_by_id(update_data.id)
        if note:
            update_dict = update_data.model_dump()
            update_dict.pop('id', None)
            for key, value in update_dict.items():
                if hasattr(note, key):
                    setattr(note, key, value)
            self.db.commit()
            self.db.refresh(note)
        return note
    def delete(self, id: int) -> bool:
        note = self.get_by_id(id)
        if note:
            self.db.delete(note)
            self.db.commit()
            return True
        return False