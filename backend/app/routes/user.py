from fastapi import APIRouter, HTTPException, Depends
from app.db.database import database
from bson import ObjectId
from app.auth.dependencies import get_current_user
from datetime import datetime, timedelta
from app.models.user import CuriosityUpdate, OpenQuestionUpdate

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/")
async def get_users():
    users = []
    async for user in database["users"].find():
        user["_id"] = str(user["_id"])
        users.append(user)
    return users

@router.get("/me/stats")
async def get_my_stats(current_user=Depends(get_current_user)):

    github_id = current_user["github_id"]

    active_sprints = await database["sprints"].count_documents({
        "user_id": github_id,
        "status": "active"
    })

    completed_sprints = await database["sprints"].count_documents({
        "user_id": github_id,
        "status": "completed"
    })

    total_deep_dives = await database["deep_dives"].count_documents({
        "user_id": github_id
    })

    return {
        "active_sprints": active_sprints,
        "completed_sprints": completed_sprints,
        "total_deep_dives": total_deep_dives
    }

@router.patch("/me/curiosity")
async def update_curiosity(
    body: CuriosityUpdate,
    current_user=Depends(get_current_user)
):

    curiosity = body.curiosity
    print("curiosity", curiosity)

    if curiosity:
        curiosity = curiosity.strip()

    await database["users"].update_one(
        {"github_id": current_user["github_id"]},
        {"$set": {"curiosity": curiosity}}
    )

    return {"success": True}

@router.patch("/me/open-question")
async def update_open_question(
    body: OpenQuestionUpdate,
    current_user=Depends(get_current_user)):
    
    await database["users"].update_one(
        {"github_id": current_user["github_id"]},
        {"$set": {"open_question": body.open_question}}
    )

    return {"success": True}

@router.get("/{username}")
async def public_profile(username: str):
    user = await database["users"].find_one(
        {"username": username}
    )
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user["_id"] = str(user["_id"])

    user["curiosity"] = user.get("curiosity", "Learning in public")
    
    user["open_question"] = user.get("open_question", "Nothing to ask...")

    #fetch user sprints
    sprints = []
    async for sprint in database["sprints"].find(
        {"user_id": user["github_id"]}
    ):
        sprint["_id"] = str(sprint["_id"])
        sprints.append(sprint)
        
    activity = await database["activity"].find_one({
        "user_id": user["github_id"]
    })

    stats = {
        "current_streak": activity.get("current_streak", 0)
    } if activity else {"current_streak": 0}
        
    return {
        "user": user,
        "sprints":sprints,
        "stats": stats
    }
    
@router.get("/{username}/timeline")
async def public_timeline(username: str):

    user = await database["users"].find_one(
        {"username": username}
    )

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    github_id = user["github_id"]

    timeline = {}

    async for dive in database["deep_dives"].find(
        {"user_id": github_id}
    ).sort("created_at", -1):

        date = dive["created_at"].strftime("%Y-%m-%d")

        if date not in timeline:
            timeline[date] = []

        timeline[date].append({
            "id": str(dive["_id"]),
            "title": dive["title"],
            "sprint_id": dive["sprint_id"]
        })

    return timeline
      
@router.get("/{username}/activity")
async def public_activity(username: str):

    user = await database["users"].find_one(
        {"username": username}
    )

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    dives = await database["deep_dives"].find({
        "user_id": user["github_id"]
    }).to_list(10000)

    activity = {}

    for dive in dives:
        date_str = dive["created_at"].date().isoformat()
        activity[date_str] = activity.get(date_str, 0) + 1

    today = datetime.utcnow().date()

    # ---- longest streak ----
    sorted_dates = sorted([
        datetime.fromisoformat(d).date()
        for d in activity.keys()
    ])

    longest_streak = 0
    streak = 0
    prev = None

    for d in sorted_dates:
        if prev and (d - prev).days == 1:
            streak += 1
        else:
            streak = 1

        longest_streak = max(longest_streak, streak)
        prev = d

    # ---- current streak ----
    current_streak = 0
    check_date = today

    while check_date.isoformat() in activity:
        current_streak += 1
        check_date -= timedelta(days=1)

    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "total_active_days": len(activity)
    }
    
@router.get("/{username}/concepts")
async def get_user_concepts(username: str):

    user = await database["users"].find_one({"username": username})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    dives = database["deep_dives"].find({
        "user_id": user["github_id"]
    })

    concepts = {}

    async for dive in dives:

        dive_id = str(dive["_id"])

        # tags
        if dive.get("tags"):
            for tag in dive["tags"]:
                if tag not in concepts:
                    concepts[tag] = dive_id

        # title as concept
        if dive.get("title"):
            title = dive["title"]
            if title not in concepts:
                concepts[title] = dive_id

    result = [
        {
            "name": concept,
            "dive_id": dive_id
        }
        for concept, dive_id in concepts.items()
    ]

    return {
        "concepts": result[:12]
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
