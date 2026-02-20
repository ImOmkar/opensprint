from fastapi import APIRouter, Depends, Query
from app.db.database import database
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/")
async def search_deep_dives(
    q: str = Query(..., min_length=1),
    current_user=Depends(get_current_user)
):

    results = []

    cursor = database["deep_dives"].find(
        {
            "user_id": current_user["github_id"],
            "$text": {"$search": q}
        },
        {
            "score": {"$meta": "textScore"},
            "title": 1,
            "problem": 1,
            "tags": 1,
            "sprint_id": 1
        }
    ).sort([("score", {"$meta": "textScore"})])

    async for dive in cursor:

        sprint = await database["sprints"].find_one({
            "_id": dive["sprint_id"]
        })

        results.append({
            "_id": str(dive["_id"]),
            "title": dive["title"],
            "problem": dive["problem"],
            "tags": dive.get("tags", []),
            "sprintId": str(dive["sprint_id"]),
            "sprintTitle": sprint["title"] if sprint else "Unknown"
        })

    return results