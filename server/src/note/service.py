from sqlalchemy.orm import Session
from src.note.model import CreateNote, UpdateNote
from src.note.repository import NoteRepository

class NoteService:
    def __init__(self, db: Session):
        self.db = db
    def create(self, create_data: CreateNote, user_id: int) -> int:
        id = NoteRepository(self.db).create(create_data, user_id) 
        return id
    def get_by_id(self, id: int):
        return NoteRepository(self.db).get_by_id(id)
    def get_for_project(self,user_id, project_id):
        return NoteRepository(self.db).get_for_project(user_id, project_id)
    def get_by_user_id(self, user_id: int):
        return NoteRepository(self.db).get_by_user_id(user_id)
    def update(self, update_data: UpdateNote):
        return NoteRepository(self.db).update(update_data)
    def delete(self, id: int):
        return NoteRepository(self.db).delete(id)