from fastapi import APIRouter, Depends
from src.database import get_db
from sqlalchemy.orm import Session
from src.pattern.model import CreatePattern, UpdatePattern
from src.pattern.service import PatternService
from src.token.service import get_current_user_id
from src.exception import NotFoundException

router = APIRouter()

@router.post("/pattern")
async def add(
    create_data: CreatePattern,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
    ):
    create_data.user_id = user_id
    id = PatternService(db).create(create_data)
    return {"pattern_id": id}

@router.get("/pattern")
async def get(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    return PatternService(db).get_by_user_id(user_id)

@router.get("/pattern/{id}")
async def get_by_id(
    id: int, 
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
    ):
    pattern = PatternService(db).get_by_id(id)
    if not pattern:
        raise NotFoundException()
    return pattern

@router.put("/pattern/{id}")
async def update(
    update_data: UpdatePattern,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    updated_data = PatternService(db).update(update_data)
    if not updated_data:
        raise NotFoundException()
    return {"pattern": updated_data}

@router.delete("/pattern/{id}")
async def delete(
    id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    if id == 0:
        return {"message": "Нельзя удалить шаблон анкеты"}
    success = PatternService(db).delete(id)
    if not success:
        raise NotFoundException()
    return {"message": "Шаблон удален"}