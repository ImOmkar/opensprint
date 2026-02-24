from pydantic import BaseModel


class ImproveRequest(BaseModel):
    text: str
    field: str  # problem | hypothesis | tests | conclusion