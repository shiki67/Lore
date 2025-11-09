from fastapi import FastAPI
from src.database import Base, engine
from src.user.view import router as auth_router

app = FastAPI()

app.include_router(auth_router)

Base.metadata.create_all(bind=engine)