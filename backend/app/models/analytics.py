from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AnalyticsEvent(BaseModel):

    type: str

    dive_id: Optional[str] = None
    sprint_id: Optional[str] = None
    username: Optional[str] = None

    visitor_id: str

    referrer: Optional[str] = None

    created_at: datetime = datetime.utcnow()