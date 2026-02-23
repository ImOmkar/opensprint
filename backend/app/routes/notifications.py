from fastapi import APIRouter, Depends
from bson import ObjectId
from datetime import datetime

from app.db.database import database
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/")
async def get_notifications(current_user=Depends(get_current_user)):

    notifications = await database["notifications"] \
        .find({"user_id": current_user["github_id"]}) \
        .sort("created_at", -1) \
        .limit(20) \
        .to_list(20)

    # convert ObjectId to string
    for n in notifications:
        n["_id"] = str(n["_id"])

    return notifications


@router.post("/{notification_id}/read")
async def mark_as_read(notification_id: str, current_user=Depends(get_current_user)):

    await database["notifications"].update_one(
        {
            "_id": ObjectId(notification_id),
            "user_id": current_user["github_id"]
        },
        {"$set": {"is_read": True}}
    )

    return {"status": "ok"}