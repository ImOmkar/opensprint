from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class DeepDiveCreate(BaseModel):
    sprint_id: str
    title: str
    problem: str
    hypothesis: str
    tests: str
    conclusion: str
    tags: Optional[List[str]] = []
    
    
class DeepDiveInDB(DeepDiveCreate):
    user_id: str
    created_at: datetime