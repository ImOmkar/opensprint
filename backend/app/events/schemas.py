from pydantic import BaseModel
from datetime import datetime

class EventBase(BaseModel):
    event: str
    user_id: str
    timestamp: datetime