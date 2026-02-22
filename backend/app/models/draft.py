from pydantic import BaseModel
from typing import Optional, List


class DraftCreate(BaseModel):
    sprint_id: str
    title: Optional[str] = ""
    problem: Optional[str] = ""
    hypothesis: Optional[str] = ""
    tests: Optional[str] = ""
    conclusion: Optional[str] = ""
    # tags: Optional[str] = ""
    tags: List[str] = []