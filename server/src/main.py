from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager
from src.database import Base, engine
from src.user.view import router as auth_router
from src.project.view import router as project_router
from src.pattern.view import router as pattern_router
from src.note.view import router as note_router
from src.init_db import initialize_database
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_database()
    yield
    
app = FastAPI(lifespan=lifespan)
app.include_router(auth_router)
app.include_router(project_router)
app.include_router(pattern_router)
app.include_router(note_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
Base.metadata.create_all(bind=engine)