import datetime
from typing import Annotated
from fastapi import APIRouter, Depends, Form, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError
import jwt
from src.user.service import UsersService
from src.user.model import CreateUser, LoginUser
from src.token.model import Token
from sqlalchemy.orm import Session
from src.database import get_db
from src.token.service import create_tokens_pair, verify_refresh_token
from  src.exception import UnauthorizedException

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth")

@router.post("/registration")
async def add_user(
    nickname: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
    ):
    user_id = UsersService(db).create_user(
        CreateUser(
            nickname=nickname,
            email=email,
            password=password
        )
    )
    return user_id

@router.post('/auth', response_model=Token)
async def auth_user(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
):
    user_data = UsersService(db).auth_user(
        LoginUser(
            nickname=form_data.username, 
            password=form_data.password
        )
    )
    tokens = create_tokens_pair(
        user_id=str(user_data.id),
        nickname=user_data.nickname
    )
    
    return Token(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type='bearer'
    )

@router.post('/refresh', response_model=Token)
async def refresh_tokens(
    refresh_token: str = Form(...),
    db: Session = Depends(get_db)
):
    user_data = await verify_refresh_token(refresh_token)
    tokens = create_tokens_pair(
        user_id=user_data["user_id"],
        nickname=user_data["nickname"]
    )
    
    return Token(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type='bearer'
    )

