from typing import Optional
from datetime import datetime
import uuid
from sqlmodel import Field, SQLModel

class User(SQLModel, table=True):
    id: str = Field(primary_key=True) 
    email: str = Field(unique=True, index=True)
    customApiKey: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class Readme(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    repoUrl: str = Field(unique=True, index=True)
    content: Optional[str] = None
    status: str = Field(default="PENDING")
    # Foreign Key to User
    userId: Optional[str] = Field(default=None, foreign_key="user.id")
    userEmail: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
