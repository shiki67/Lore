from typing import List
from sqlalchemy.orm import Session
from src.user.model import User, CreateUser, UserData, LoginUser
from passlib.context import CryptContext
from src.exception import UnauthorizedException, NotFoundException

bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

class UserRepository:
    def __init__(self, db: Session):
        self.db = db
    def get_user_by_nickname(self, nickname: str) -> User:
        user = self.db.query(User).filter(User.nickname == nickname).first()
        if user is None:
            raise NotFoundException("User not found 404")
        return user
    def is_user_exist(self, nickname: str) -> bool:
        user = self.db.query(User).filter(User.nickname == nickname).first()
        if user is None:
            return False
        return True
    def create_user(self, user_data:CreateUser) -> int:
        user = User(
            nickname = user_data.nickname,
            email = user_data.email,
            password = bcrypt_context.hash(user_data.password)
        )
        self.db.add(user)
        self.db.commit()
        return user.id
    def login_user(self, user_data: LoginUser) -> UserData:
        user = self.get_user_by_nickname(user_data.nickname) 
        if not bcrypt_context.verify(user_data.password, user.password):
            raise UnauthorizedException('Invalid password 401')
        return UserData(
            id = user.id,
            nickname = user.nickname,
            email= user.email
        )
    def get_all_users(self) -> List[UserData]:
        users = self.db.query(User).all()
        return [UserData(id=user.id, nickname=user.nickname) for user in users]
    
    