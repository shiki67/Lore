from fastapi import APIRouter, Depends
from src.database import get_db
from sqlalchemy.orm import Session
from src.note.model import CreateNote, UpdateNote
from src.note.service import NoteService
from src.token.service import get_current_user_id
from src.exception import NotFoundException

router = APIRouter()

@router.post("/note")
async def add(
    create_data: CreateNote,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
    ):
    create_data.user_id = user_id
    id = NoteService(db).create(create_data)
    return {"note_id": id}

@router.get("/note")
async def get(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    return NoteService(db).get_by_user_id(user_id)

@router.get("/note/{id}")
async def get_by_id(
    id: int, 
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
    ):
    note = NoteService(db).get_by_id(id)
    if not note:
        raise NotFoundException()
    return note

@router.put("/note/{id}")
async def update(
    update_data: UpdateNote,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    updated_data = NoteService(db).update(update_data)
    if not updated_data:
        raise NotFoundException()
    return {"note": updated_data}

@router.delete("/note/{id}")
async def delete(
    id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    success = NoteService(db).delete(id)
    if not success:
        raise NotFoundException()
    return {"message": "Заметка удалена"}