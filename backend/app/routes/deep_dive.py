from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from app.db.database import database
from app.models.deep_dive import DeepDiveCreate
from app.auth.dependencies import get_current_user
from bson import ObjectId
from app.utils.tag_utils import normalize_tags
from typing import List
from pymongo import ReturnDocument

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
        "tags": normalize_tags(deep_dive.tags),
        "created_at": datetime.now()
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

    update_data = {
        "title": body.title,
        "problem": body.problem,
        "hypothesis": body.hypothesis,
        "tests": body.tests,
        "conclusion": body.conclusion,
        "tags": body.tags,
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

    dives_cursor = database["deep_dives"].find({
        "user_id": current_user["github_id"]
    })

    dives = await dives_cursor.to_list(length=None)

    nodes = []
    links = []

    title_to_id = {}

    # Create nodes
    for dive in dives:

        dive_id = str(dive["_id"])
        title = dive["title"]

        nodes.append({
            "id": dive_id,
            "name": title
        })

        title_to_id[title] = dive_id

    # Create links
    import re

    for dive in dives:

        source_id = str(dive["_id"])

        content_fields = [
            dive.get("problem", ""),
            dive.get("hypothesis", ""),
            dive.get("tests", ""),
            dive.get("conclusion", "")
        ]

        for content in content_fields:

            matches = re.findall(r"\[\[(.*?)\]\]", content)

            for match in matches:

                target_id = title_to_id.get(match)

                if target_id:

                    links.append({
                        "source": source_id,
                        "target": target_id
                    })

    return {
        "nodes": nodes,
        "links": links
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
async def get_backlinks(
    dive_id: str,
    current_user=Depends(get_current_user)
):

    dive = await database["deep_dives"].find_one({
        "_id": ObjectId(dive_id),
        "user_id": current_user["github_id"]
    })

    if not dive:
        return []

    title = dive["title"]

    cursor = database["deep_dives"].find({
        "user_id": current_user["github_id"],
        "$or": [
            {"problem": {"$regex": f"\\[\\[{title}\\]\\]", "$options": "i"}},
            {"hypothesis": {"$regex": f"\\[\\[{title}\\]\\]", "$options": "i"}},
            {"tests": {"$regex": f"\\[\\[{title}\\]\\]", "$options": "i"}},
            {"conclusion": {"$regex": f"\\[\\[{title}\\]\\]", "$options": "i"}}
        ]
    })

    results = []

    async for doc in cursor:
        results.append({
            "_id": str(doc["_id"]),
            "title": doc["title"],
            "sprint_id": doc["sprint_id"],
            "created_at": doc["created_at"]
        })

    return results

