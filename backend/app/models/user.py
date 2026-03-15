from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    github_id: str
    username: str
    email: Optional[EmailStr] = None
    avatar_url: Optional[str] = None
    open_question: Optional[str] = None
    curiosity: Optional[str] = None
    profile_theme: Optional[str] = "dark"

class CuriosityUpdate(BaseModel):
    curiosity: Optional[str] = None
    
class OpenQuestionUpdate(BaseModel):
    open_question: Optional[str] = None

class ThemeUpdate(BaseModel):
    profile_theme: Optional[str] = "dark"

class UserInDB(UserBase):
    created_at: datetime