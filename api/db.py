# api/db.py
import os
from sqlmodel import create_engine, SQLModel, Session
from dotenv import load_dotenv

load_dotenv()

database_url = os.getenv("DATABASE_URL")

if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

if not database_url:
    raise ValueError(" DATABASE_URL is missing! Check your .env file.")

engine = create_engine(
    database_url, 
    echo=False, 
    pool_pre_ping=True, 
    pool_recycle=300
)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session