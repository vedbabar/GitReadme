import os
from sqlmodel import create_engine, SQLModel, Session
from dotenv import load_dotenv

# 1. Load variables from .env file (for local dev)
load_dotenv()

# 2. Get Database URL
database_url = os.getenv("DATABASE_URL")

# 3. Fix for Neon/Render: SQLAlchemy needs 'postgresql://', not 'postgres://'
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

if not database_url:
    raise ValueError(" DATABASE_URL is missing! Check your .env file.")

# 4. Create the Engine
engine = create_engine(database_url, echo=False)

def init_db():
    """Creates tables if they don't exist (Replaces prisma push/migrate)"""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Helper for using the DB in endpoints"""
    with Session(engine) as session:
        yield session