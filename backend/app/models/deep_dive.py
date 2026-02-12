from pydantic import BaseModel
from datetime import datetime



class DeepDiveCreate(BaseModel):
    sprint_id: str
    title: str
    problem: str
    hypothesis: str
    tests: str
    conclusion: str
    
    
class DeepDiveInDB(DeepDiveCreate):
    user_id: str
    created_at: datetime