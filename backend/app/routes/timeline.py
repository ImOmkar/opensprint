from fastapi import APIRouter, Depends
from datetime import datetime
from bson import ObjectId
from app.db.database import database
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/timeline", tags=["timeline"])


@router.get("/")
async def get_timeline(current_user=Depends(get_current_user)):

    dives = await database["deep_dives"].find(
        {"user_id": current_user["github_id"]},
        {
            "title": 1,
            "created_at": 1,
            "sprint_id": 1
        }
    ).sort("created_at", -1).to_list(500)

    timeline = {}

    for dive in dives:
        date = dive["created_at"].strftime("%Y-%m-%d")

        timeline.setdefault(date, []).append({
            "id": str(dive["_id"]),
            "title": dive["title"],
            "sprint_id": str(dive["sprint_id"])
        })

    return timeline