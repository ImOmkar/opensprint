from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional



class UserBase(BaseModel):
    github_id: str
    username: str
    email: Optional[EmailStr] = None
    avatar_url: Optional[str] = None
    
    
class UserInDB(UserBase):
    created_at: datetime