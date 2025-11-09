from datetime import datetime, timedelta
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from src.exception import UnauthorizedException
import os
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv('SECRET_KEY')
REFRESH_SECRET_KEY = os.getenv('REFRESH_SECRET_KEY')
ALGORITHM = os.getenv("ALGORITHM")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth")

def create_access_token(user_id: int, nickname: str, minutes: int = 15):
    expires = datetime.now() + timedelta(minutes=minutes)
    payload = {
        'user_id': user_id, 
        'nickname': nickname, 
        'exp': expires,
        'type': 'access'
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

def create_refresh_token(user_id: int, nickname: str, days: int = 7):
    expires = datetime.now() + timedelta(days=days)
    payload = {
        'user_id': user_id, 
        'nickname': nickname, 
        'exp': expires,
        'type': 'refresh'
    }
    token = jwt.encode(payload, REFRESH_SECRET_KEY, algorithm=ALGORITHM)
    return token

def create_tokens_pair(user_id: int, nickname: str):
    access_token = create_access_token(user_id, nickname)
    refresh_token = create_refresh_token(user_id, nickname)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

async def verify_refresh_token(refresh_token: str):
    try:
        payload = jwt.decode(refresh_token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get('type') != 'refresh':
            raise UnauthorizedException   
        user_id: str = payload.get('user_id')
        nickname: str = payload.get('nickname')
        if user_id is None or nickname is None:
            raise UnauthorizedException
        return {"user_id": user_id, "nickname": nickname}
    except JWTError:
        raise UnauthorizedException
async def get_current_user_id(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get('user_id')
        return int(user_id)
    except JWTError:
        raise UnauthorizedException()
    
async def get_current_username(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get('nickname')
        return username
    except JWTError:
        raise UnauthorizedException()