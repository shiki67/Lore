from sqlalchemy.orm import Session
from src.user.repository import UserRepository
from src.user.model import CreateUser, LoginUser
from src.token.service import create_access_token
from src.exception import BadRequestException
class UsersService:
    def __init__(self, db: Session):
        self.db = db
    def create_user(self, user_data: CreateUser) -> int:
        if (UserRepository(self.db).is_user_exist(user_data.nickname)):
            raise BadRequestException("User exist 400")
        else:
            user_id = UserRepository(self.db).create_user(user_data) 
            return user_id
    def auth_user(self, user_login_rq: LoginUser):
        user_data = UserRepository(self.db).login_user(user_login_rq)
        return user_data
    def get_all_users(self):
         return UserRepository(self.db).get_all_users()
    def get_user(self, user_id):
        return UserRepository(self.db).get_user(user_id)