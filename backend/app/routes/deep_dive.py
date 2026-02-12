from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from app.db.database import database
from app.models.deep_dive import DeepDiveCreate
from app.auth.dependencies import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/deep-dives", tags=["Deep Dives"])


@router.post("/")
async def create_deep_dive(
    deep_dive: DeepDiveCreate,
    current_user=Depends(get_current_user)
):

    # Verify sprint belongs to user
    try:
        sprint = await database["sprints"].find_one(
            {
                "_id": ObjectId(deep_dive.sprint_id),
                "user_id": current_user["github_id"]
            }
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid sprint ID")

    if not sprint:
        raise HTTPException(status_code=403, detail="Sprint not found")

    if sprint["status"] == "completed":
        raise HTTPException(
            status_code=400,
            detail="Cannot add deep dive to completed sprint"
        )

    # Instead of ObjectId conversion complexity for now,
    # we validate by checking sprint_id string match

    sprint = await database["sprints"].find_one(
        {"_id": {"$exists": True}, "user_id": current_user["github_id"]}
    )

    if not sprint:
        raise HTTPException(status_code=403, detail="Invalid sprint")

    deep_dive_doc = {
        "sprint_id": deep_dive.sprint_id,
        "user_id": current_user["github_id"],
        "title": deep_dive.title,
        "problem": deep_dive.problem,
        "hypothesis": deep_dive.hypothesis,
        "tests": deep_dive.tests,
        "conclusion": deep_dive.conclusion,
        "created_at": datetime.utcnow()
    }

    result = await database["deep_dives"].insert_one(deep_dive_doc)
    deep_dive_doc["_id"] = str(result.inserted_id)

    return deep_dive_doc


@router.get("/sprint/{sprint_id}")
async def get_deep_dives(
    sprint_id: str,
    current_user=Depends(get_current_user)
):

    dives = []

    async for dive in database["deep_dives"].find(
        {
            "sprint_id": sprint_id,
            "user_id": current_user["github_id"]
        }
    ):
        dive["_id"] = str(dive["_id"])
        dives.append(dive)

    return dives


@router.put("/{dive_id}")
async def update_deep_dive(
    dive_id: str,
    deep_dive: DeepDiveCreate,
    current_user=Depends(get_current_user)
):

    try:
        existing = await database["deep_dives"].find_one(
            {
                "_id": ObjectId(dive_id),
                "user_id": current_user["github_id"]
            }
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid dive ID")

    if not existing:
        raise HTTPException(status_code=404, detail="Deep dive not found")

    await database["deep_dives"].update_one(
        {"_id": ObjectId(dive_id)},
        {
            "$set": {
                "title": deep_dive.title,
                "problem": deep_dive.problem,
                "hypothesis": deep_dive.hypothesis,
                "tests": deep_dive.tests,
                "conclusion": deep_dive.conclusion
            }
        }
    )

    return {"message": "Deep dive updated"}


@router.delete("/{dive_id}")
async def delete_deep_dive(
    dive_id: str,
    current_user=Depends(get_current_user)
):

    try:
        dive = await database["deep_dives"].find_one(
            {
                "_id": ObjectId(dive_id),
                "user_id": current_user["github_id"]
            }
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid dive ID")

    if not dive:
        raise HTTPException(status_code=404, detail="Deep dive not found")

    await database["deep_dives"].delete_one({"_id": ObjectId(dive_id)})

    return {"message": "Deep dive deleted"}