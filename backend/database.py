import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./bug_platform.db")

# Normalize postgres:// to postgresql:// for SQLAlchemy
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

is_sqlite = DATABASE_URL.startswith("sqlite")

try:
    if is_sqlite:
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        # PostgreSQL (Supabase) configuration
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=300,
            connect_args={"connect_timeout": 5}
        )
        # Verify connection on startup
        with engine.connect() as conn:
            pass
        print(f"Connected successfully to Supabase PostgreSQL ({DATABASE_URL.split('@')[-1].split('?')[0]}).")
except Exception as e:
    print(f"Notice: Supabase remote connection not reachable ({e}). Using local SQLite database.")
    DATABASE_URL = "sqlite:///./bug_platform.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

