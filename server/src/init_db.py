from src.database import Base, engine, SessionLocal
from src.pattern.model import Pattern

def initialize_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        Pattern.create_default_pattern(db)
        print("База данных инициализирована, шаблон по умолчанию создан")
    except Exception as e:
        print(f"Ошибка при инициализации базы данных: {e}")
    finally:
        db.close()