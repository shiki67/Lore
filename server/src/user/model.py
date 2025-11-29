from sqlalchemy import Column, String, Integer
from src.database import Base
from pydantic import BaseModel

class User(Base):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True, autoincrement=True)
    nickname = Column(String(120), unique=True)
    email = Column(String(120), unique=True)
    password = Column(String(256))

class UserData(BaseModel):
    id: int
    nickname: str
    email: str

class UserInfo(BaseModel):
    nickname: str
    email: str
class CreateUser(BaseModel):
    nickname: str
    email: str
    password: str

class LoginUser(BaseModel):
    nickname: str
    password: str
