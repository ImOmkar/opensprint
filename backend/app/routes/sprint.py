from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from app.db.database import database
from app.models.sprint import SpringCreate
from app.auth.dependencies import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/sprints", tags=["Sprints"])


@router.post("/")
async def create_sprint(
  sprint: SpringCreate,
  current_user = Depends(get_current_user)
):

    sprint_doc = {
        "title": sprint.title,
        "goal": sprint.goal,
        "description": sprint.description,
        "start_date": sprint.start_date,
        "end_date": sprint.end_date,
        "user_id": current_user["github_id"],
        "status": "active",
        "created_at": datetime.now()
    }    
    
    result = await database["sprints"].insert_one(sprint_doc)
    sprint_doc["_id"] = str(result.inserted_id)
    return sprint_doc


@router.get("/mine")
async def get_my_sprints(current_user=Depends(get_current_user)):
    sprints = []
    
    async for sprint in database["sprints"].find(
        {"user_id": current_user["github_id"]}
    ):
        sprint["_id"] = str(sprint["_id"])
        sprints.append(sprint)
        
    return sprints

@router.put("/{sprint_id}")
async def update_sprint(
    sprint_id: str,
    sprint: SpringCreate,
    current_user=Depends(get_current_user)
):

    try:
        existing = await database["sprints"].find_one(
            {
                "_id": ObjectId(sprint_id),
                "user_id": current_user["github_id"]
            }
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid sprint ID")

    if not existing:
        raise HTTPException(status_code=404, detail="Sprint not found")

    await database["sprints"].update_one(
        {"_id": ObjectId(sprint_id)},
        {
            "$set": {
                "title": sprint.title,
                "goal": sprint.goal,
                "description": sprint.description,
                "start_date": sprint.start_date,
                "end_date": sprint.end_date
            }
        }
    )

    return {"message": "Sprint updated"}

@router.delete("/{sprint_id}")
async def delete_sprint(
    sprint_id: str,
    current_user=Depends(get_current_user)
):

    try:
        sprint = await database["sprints"].find_one(
            {
                "_id": ObjectId(sprint_id),
                "user_id": current_user["github_id"]
            }
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid sprint ID")

    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")

    await database["sprints"].delete_one({"_id": ObjectId(sprint_id)})

    # Optional: also delete associated deep dives
    await database["deep_dives"].delete_many({"sprint_id": sprint_id})

    return {"message": "Sprint deleted"}

# @router.patch("/{sprint_id}/toggle")
# async def toggle_sprint(
#     sprint_id: str,
#     current_user=Depends(get_current_user)
# ):

#     try:
#         sprint = await database["sprints"].find_one(
#             {
#                 "_id": ObjectId(sprint_id),
#                 "user_id": current_user["github_id"]
#             }
#         )
#     except Exception:
#         raise HTTPException(status_code=400, detail="Invalid sprint ID")

#     if not sprint:
#         raise HTTPException(status_code=404, detail="Sprint not found")

#     new_status = "completed" if sprint["status"] == "active" else "active"

#     await database["sprints"].update_one(
#         {"_id": ObjectId(sprint_id)},
#         {"$set": {"status": new_status}}
#     )

#     return {"status": new_status}

@router.patch("/{sprint_id}/toggle")
async def toggle_sprint(
    sprint_id: str,
    current_user=Depends(get_current_user)
):

    try:
        sprint = await database["sprints"].find_one(
            {
                "_id": ObjectId(sprint_id),
                "user_id": current_user["github_id"]
            }
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid sprint ID")

    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")

    if sprint["status"] == "active":
        new_status = "completed"
        completed_at = datetime.utcnow()

        await database["sprints"].update_one(
            {"_id": ObjectId(sprint_id)},
            {
                "$set": {
                    "status": new_status,
                    "completed_at": completed_at
                }
            }
        )

    else:
        new_status = "active"

        await database["sprints"].update_one(
            {"_id": ObjectId(sprint_id)},
            {
                "$set": {
                    "status": new_status
                },
                "$unset": {
                    "completed_at": ""
                }
            }
        )

    return {"status": new_status}