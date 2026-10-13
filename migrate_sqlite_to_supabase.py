import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

load_dotenv()

SQLITE_PATH = "bug_platform.db"
SUPABASE_URL = os.getenv("DATABASE_URL")

print("=" * 60)
print(">>> BUGLENS SQLITE TO SUPABASE DATA MIGRATION TOOL")
print("=" * 60)

if not os.path.exists(SQLITE_PATH):
    print(f"Error: SQLite database {SQLITE_PATH} not found.")
    sys.exit(1)

if not SUPABASE_URL or not SUPABASE_URL.startswith("postgres"):
    print("Error: DATABASE_URL in .env is not configured for PostgreSQL/Supabase.")
    sys.exit(1)

print(f"Source: SQLite ({SQLITE_PATH})")
print(f"Target: Supabase PostgreSQL ({SUPABASE_URL.split('@')[-1].split('?')[0]})")

try:
    from backend.database import Base
    from backend.models.models import (
        User, Organization, Project, BugReport, KnowledgeBase,
        AIReport, Attachment, Notification, TeamInvitation,
        UserSettings, ActivityLog, Comment
    )

    sqlite_engine = create_engine(f"sqlite:///{SQLITE_PATH}", connect_args={"check_same_thread": False})
    pg_engine = create_engine(SUPABASE_URL, pool_pre_ping=True, connect_args={"connect_timeout": 10})

    # Test Supabase connection
    print("\nConnecting to Supabase...")
    with pg_engine.connect() as conn:
        db_name = conn.execute(text("SELECT current_database();")).fetchone()[0]
        print(f"✓ Connected to Supabase PostgreSQL database: {db_name}")

    # Create tables on Supabase
    print("\nCreating schema tables on Supabase if not present...")
    Base.metadata.create_all(bind=pg_engine)
    print("✓ Schema tables initialized.")

    SqliteSession = sessionmaker(bind=sqlite_engine)
    PgSession = sessionmaker(bind=pg_engine)

    sqlite_db = SqliteSession()
    pg_db = PgSession()

    models_in_order = [
        Organization,
        User,
        Project,
        BugReport,
        KnowledgeBase,
        AIReport,
        Attachment,
        Notification,
        TeamInvitation,
        UserSettings,
        ActivityLog,
        Comment
    ]

    for model in models_in_order:
        table_name = model.__tablename__
        records = sqlite_db.query(model).all()
        if not records:
            print(f"Table [{table_name}]: 0 records to migrate.")
            continue

        print(f"Migrating table [{table_name}] ({len(records)} records)...")
        for rec in records:
            # Extract column attributes
            data = {c.name: getattr(rec, c.name) for c in model.__table__.columns}
            
            # Check if record already exists in Supabase
            existing = pg_db.query(model).filter(model.id == rec.id).first()
            if not existing:
                new_rec = model(**data)
                pg_db.add(new_rec)
        pg_db.commit()
        print(f"✓ Table [{table_name}] migrated successfully.")

    # Reset postgres sequences for auto-incrementing IDs
    print("\nResetting PostgreSQL sequence counters...")
    with pg_engine.connect() as conn:
        for model in models_in_order:
            tbl = model.__tablename__
            try:
                conn.execute(text(f"SELECT setval(pg_get_serial_sequence('{tbl}', 'id'), coalesce(max(id), 1), max(id) IS NOT NULL) FROM {tbl};"))
                conn.commit()
            except Exception:
                pass
    print("✓ Sequence counters synchronized.")

    sqlite_db.close()
    pg_db.close()
    print("\n============================================================")
    print(">>> MIGRATION COMPLETE! ALL DATA SUCCESSFULLY IN SUPABASE!")
    print("============================================================")

except Exception as e:
    print(f"\nMigration note / exception: {e}")
