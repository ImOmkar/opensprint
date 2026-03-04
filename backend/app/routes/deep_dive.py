from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timedelta
from app.db.database import database
from app.models.deep_dive import DeepDiveCreate
from app.auth.dependencies import get_current_user
from bson import ObjectId
from app.utils.tag_utils import normalize_tags
from typing import List
from pymongo import ReturnDocument
from app.utils.wiki_links import extract_wiki_links

router = APIRouter(prefix="/deep-dives", tags=["Deep Dives"])

@router.post("/")
async def create_deep_dive(
    deep_dive: DeepDiveCreate,
    current_user=Depends(get_current_user)
):

    # Validate sprint properly
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

    # Combine content for wiki link parsing
    all_text = " ".join([
        deep_dive.title or "",
        deep_dive.problem or "",
        deep_dive.hypothesis or "",
        deep_dive.tests or "",
        deep_dive.conclusion or ""
    ])

    linked_titles = extract_wiki_links(all_text)

    resolved_ids = []

    for title in linked_titles:
        linked_dive = await database["deep_dives"].find_one({
            "title": title,
            "user_id": current_user["github_id"]
        })

        if linked_dive:
            resolved_ids.append(str(linked_dive["_id"]))

    deep_dive_doc = {
        "sprint_id": deep_dive.sprint_id,
        "user_id": current_user["github_id"],
        "title": deep_dive.title,
        "problem": deep_dive.problem,
        "hypothesis": deep_dive.hypothesis,
        "tests": deep_dive.tests,
        "conclusion": deep_dive.conclusion,
        "tags": normalize_tags(deep_dive.tags),
        "created_at": datetime.now(),
        "references": resolved_ids
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

@router.get("/by-title/{title}")
async def get_dive_by_title(
    title: str,
    current_user=Depends(get_current_user)
):
    dive = await database["deep_dives"].find_one({
        "title": {"$regex": f"^{title}$", "$options": "i"},
        "user_id": current_user["github_id"]
    })

    if not dive:
        raise HTTPException(status_code=404, detail="Dive not found")

    dive["_id"] = str(dive["_id"])
    return dive

@router.get("/public/by-title/{username}/{title}")
async def get_public_dive_by_title(username: str, title: str):

    user = await database["users"].find_one({"username": username})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    dive = await database["deep_dives"].find_one({
        "title": {"$regex": f"^{title}$", "$options": "i"},
        "user_id": user["github_id"]
    })

    if not dive:
        raise HTTPException(status_code=404, detail="Dive not found")

    dive["_id"] = str(dive["_id"])

    return dive
    
@router.put("/{dive_id}")
async def update_deep_dive(
    dive_id: str,
    body: DeepDiveCreate,
    current_user=Depends(get_current_user)
):

    existing = await database["deep_dives"].find_one({
        "_id": ObjectId(dive_id),
        "user_id": current_user["github_id"]
    })

    if not existing:
        raise HTTPException(status_code=404, detail="Deep dive not found")

    # save version
    version_data = {
        "deep_dive_id": dive_id,
        "user_id": current_user["github_id"],
        "title": existing.get("title"),
        "problem": existing.get("problem"),
        "hypothesis": existing.get("hypothesis"),
        "tests": existing.get("tests"),
        "conclusion": existing.get("conclusion"),
        "tags": existing.get("tags"),
        "created_at": existing.get("created_at"),
        "versioned_at": datetime.utcnow()
    }

    await database["deep_dive_versions"].insert_one(version_data)
    
    # Recalculate wiki references
    all_text = " ".join([
        body.title or "",
        body.problem or "",
        body.hypothesis or "",
        body.tests or "",
        body.conclusion or ""
    ])

    linked_titles = extract_wiki_links(all_text)

    resolved_ids = []

    for title in linked_titles:
        linked_dive = await database["deep_dives"].find_one({
            "title": title,
            "user_id": current_user["github_id"]
        })
    
        if linked_dive and str(linked_dive["_id"]) != dive_id:
            
            resolved_ids.append(str(linked_dive["_id"]))

    update_data = {
        "title": body.title,
        "problem": body.problem,
        "hypothesis": body.hypothesis,
        "tests": body.tests,
        "conclusion": body.conclusion,
        "tags": normalize_tags(body.tags),
        "references": resolved_ids,
        "updated_at": datetime.utcnow()
    }

    updated = await database["deep_dives"].find_one_and_update(
        {
            "_id": ObjectId(dive_id),
            "user_id": current_user["github_id"]
        },
        {
            "$set": update_data
        },
        return_document=ReturnDocument.AFTER
    )

    updated["_id"] = str(updated["_id"])

    return updated

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

@router.get("/{dive_id}/versions")
async def get_versions(
    dive_id: str,
    current_user=Depends(get_current_user)
):

    cursor = database["deep_dive_versions"].find(
        {
            "deep_dive_id": dive_id,
            "user_id": current_user["github_id"]
        }
    ).sort("versioned_at", -1)

    versions = []

    async for v in cursor:
        versions.append({
            "_id": str(v["_id"]),
            "title": v.get("title"),
            "problem": v.get("problem"),
            "hypothesis": v.get("hypothesis"),
            "tests": v.get("tests"),
            "conclusion": v.get("conclusion"),
            "tags": v.get("tags"),
            "versioned_at": v.get("versioned_at")
        })

    return versions

@router.post("/{dive_id}/restore/{version_id}")
async def restore_version(
    dive_id: str,
    version_id: str,
    current_user=Depends(get_current_user)
):

    # get version
    version = await database["deep_dive_versions"].find_one({
        "_id": ObjectId(version_id),
        "user_id": current_user["github_id"],
        "deep_dive_id": dive_id
    })

    if not version:
        raise HTTPException(status_code=404, detail="Version not found")

    # save current as version BEFORE restoring
    current = await database["deep_dives"].find_one({
        "_id": ObjectId(dive_id),
        "user_id": current_user["github_id"]
    })

    if current:

        await database["deep_dive_versions"].insert_one({
            "deep_dive_id": dive_id,
            "user_id": current_user["github_id"],
            "title": current.get("title"),
            "problem": current.get("problem"),
            "hypothesis": current.get("hypothesis"),
            "tests": current.get("tests"),
            "conclusion": current.get("conclusion"),
            "tags": current.get("tags"),
            "created_at": current.get("created_at"),
            "versioned_at": datetime.utcnow()
        })

    # restore selected version
    await database["deep_dives"].update_one(
        {"_id": ObjectId(dive_id)},
        {
            "$set": {
                "title": version.get("title"),
                "problem": version.get("problem"),
                "hypothesis": version.get("hypothesis"),
                "tests": version.get("tests"),
                "conclusion": version.get("conclusion"),
                "tags": version.get("tags"),
                "updated_at": datetime.utcnow()
            }
        }
    )

    return {"status": "restored"}

@router.get("/graph")
async def get_graph(current_user=Depends(get_current_user)):

    dives = await database["deep_dives"].find({
        "user_id": current_user["github_id"]
    }).to_list(1000)

    nodes = []
    links = []

    for dive in dives:
        nodes.append({
            "id": str(dive["_id"]),
            "name": dive["title"]
        })

    for dive in dives:
        for ref_id in dive.get("references", []):
            links.append({
                "source": str(dive["_id"]),
                "target": ref_id
            })

    return {
        "nodes": nodes,
        "links": links
    }
      
@router.get("/activity")
async def get_activity(current_user=Depends(get_current_user)):

    dives = await database["deep_dives"].find({
        "user_id": current_user["github_id"]
    }).to_list(10000)

    activity = {}

    for dive in dives:
        date_str = dive["created_at"].date().isoformat()
        activity[date_str] = activity.get(date_str, 0) + 1

    today = datetime.now().date()

    # calculate streaks
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

    # current streak
    current_streak = 0
    check_date = today

    while check_date.isoformat() in activity:
        current_streak += 1
        check_date -= timedelta(days=1)
        
    milestones = [7, 30, 90, 180, 365]

    earned = [m for m in milestones if current_streak >= m]

    next_milestone = None
    for m in milestones:
        if current_streak < m:
            next_milestone = m
            break
        
    if current_streak in milestones:

        existing = await database["notifications"].find_one({
            "user_id": current_user["github_id"],
            "type": "milestone",
            "meta.milestone": current_streak
        })

        if not existing:
            await database["notifications"].insert_one({
                "user_id": current_user["github_id"],
                "type": "milestone",
                "title": f"{current_streak} Day Streak 🔥",
                "message": f"You've reached {current_streak} consecutive days.",
                "meta": {"milestone": current_streak},
                "is_read": False,
                "created_at": datetime.utcnow()
            })
        
    today = datetime.now().date().isoformat()
    wrote_today = today in activity

    return {
        "activity": activity,
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "total_active_days": len(activity),
        "earned_milestones": earned,
        "next_milestone": next_milestone,
        "wrote_today": wrote_today
    }

@router.get("/{dive_id}")
async def get_dive_by_id(
    dive_id: str,
    current_user=Depends(get_current_user)
):

    dive = await database["deep_dives"].find_one({
        "_id": ObjectId(dive_id),
        "user_id": current_user["github_id"]
    })

    if not dive:
        return None

    dive["_id"] = str(dive["_id"])

    return dive

@router.get("/{dive_id}/backlinks")
async def get_backlinks(dive_id: str, current_user=Depends(get_current_user)):

    backlinks = await database["deep_dives"].find({
        "references": dive_id,
        "user_id": current_user["github_id"]
    }).to_list(100)

    for dive in backlinks:
        dive["_id"] = str(dive["_id"])

    return backlinks


