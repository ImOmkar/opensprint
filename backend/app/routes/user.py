from fastapi import APIRouter, HTTPException
from app.db.database import database
from bson import ObjectId

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/")
async def get_users():
    users = []
    async for user in database["users"].find():
        user["_id"] = str(user["_id"])
        users.append(user)
    return users


@router.get("/{username}")
async def public_profile(username: str):
    user = await database["users"].find_one(
        {"username": username}
    )
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user["_id"] = str(user["_id"])
    
    #fetch user sprints
    sprints = []
    async for sprint in database["sprints"].find(
        {"user_id": user["github_id"]}
    ):
        sprint["_id"] = str(sprint["_id"])
        sprints.append(sprint)
        
    return {
        "user": user,
        "sprints":sprints
    }
    
    

@router.get("/{username}/{sprint_id}")
async def public_sprint_detail(username: str, sprint_id: str):

    user = await database["users"].find_one({"username": username})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        sprint = await database["sprints"].find_one(
            {
                "_id": ObjectId(sprint_id),
                "user_id": user["github_id"]
            }
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid sprint ID")

    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")

    sprint["_id"] = str(sprint["_id"])

    deep_dives = []
    async for dive in database["deep_dives"].find(
        {"sprint_id": sprint_id}
    ):
        dive["_id"] = str(dive["_id"])
        deep_dives.append(dive)

    return {
        "user": {
            "username": user["username"],
            "avatar_url": user["avatar_url"]
        },
        "sprint": sprint,
        "deep_dives": deep_dives
    }