from fastapi import APIRouter, Depends, Query, HTTPException
from app.db.database import database

from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/search", tags=["search"])



@router.get("/")
async def search_by_concept(concept: str):

    dives = database["deep_dives"].find({
        "$or": [
            {"title": {"$regex": concept, "$options": "i"}},
            {"tags": {"$in": [concept]}}
        ]
    }).limit(50)

    results = []

    async for dive in dives:

        user = await database["users"].find_one(
            {"github_id": dive["user_id"]}
        )

        results.append({
            "id": str(dive["_id"]),
            "title": dive["title"],
            "username": user["username"] if user else None,
            "created_at": dive.get("created_at")
        })

    return {"results": results}


# @router.get("/")
# async def search_deep_dives(
#     q: str = Query(..., min_length=1),
#     current_user=Depends(get_current_user)
# ):

#     results = []

#     cursor = database["deep_dives"].find(
#         {
#             "user_id": current_user["github_id"],
#             "$text": {"$search": q}
#         },
#         {
#             "score": {"$meta": "textScore"},
#             "title": 1,
#             "problem": 1,
#             "tags": 1,
#             "sprint_id": 1
#         }
#     ).sort([("score", {"$meta": "textScore"})])

#     async for dive in cursor:

#         sprint = await database["sprints"].find_one({
#             "_id": dive["sprint_id"]
#         })

#         results.append({
#             "_id": str(dive["_id"]),
#             "title": dive["title"],
#             "problem": dive["problem"],
#             "tags": dive.get("tags", []),
#             "sprintId": str(dive["sprint_id"]),
#             "sprintTitle": sprint["title"] if sprint else "Unknown"
#         })

#     return results

