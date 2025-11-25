from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager
from src.database import Base, engine
from src.user.view import router as auth_router
from src.project.view import router as project_router
from src.pattern.view import router as pattern_router
from src.init_db import initialize_database  # Импортируем функцию инициализации

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    initialize_database()
    print("✅ Application started")
    yield
    # Shutdown logic (опционально)
    print("🛑 Application shutting down")
    
app = FastAPI(lifespan=lifespan)
app.include_router(auth_router)
app.include_router(project_router)
app.include_router(pattern_router)

Base.metadata.create_all(bind=engine)