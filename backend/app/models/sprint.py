from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SpringCreate(BaseModel):
    title: str
    goal: str
    description: str | None = None
    start_date: datetime
    end_date: datetime
    
class SprintInDB(SpringCreate):
    user_id: str
    status: str = 'active'
    created_at: datetime
    completed_at: datetime | None = None