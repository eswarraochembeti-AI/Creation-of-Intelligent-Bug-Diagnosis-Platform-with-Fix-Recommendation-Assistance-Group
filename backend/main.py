import os
import sys
from pathlib import Path

# Ensure project root is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.database import engine, Base, SessionLocal
from backend.routers import auth_router, bugs_router, knowledge_router, analytics_router, reports_router, team_router, search_router
from backend.seed_data import seed_database

# Create all tables
Base.metadata.create_all(bind=engine)

os.makedirs("uploads", exist_ok=True)

app = FastAPI(title="Intelligent Bug Diagnosis Platform", version="1.0.0")

# Mount uploads static directory for attachments & screenshots
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router.router)
app.include_router(bugs_router.router)
app.include_router(knowledge_router.router)
app.include_router(analytics_router.router)
app.include_router(reports_router.router)
app.include_router(team_router.router)
app.include_router(search_router.router)

from backend.rag.vector_store import vector_store

@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        # Ensure status column exists in users table for existing SQLite databases
        try:
            with engine.connect() as conn:
                cursor = conn.connection.cursor()
                columns = [col[1] for col in cursor.execute("PRAGMA table_info(users)").fetchall()]
                if "status" not in columns:
                    cursor.execute("ALTER TABLE users ADD COLUMN status VARCHAR DEFAULT 'Active'")
                    conn.connection.commit()
        except Exception as e:
            print(f"Schema check error: {e}")

        seed_database(db)
        vector_store.ensure_initialized(db)
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "name": "BugLens - Intelligent Bug Diagnosis Platform API",
        "status": "healthy",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "API is running"}

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
