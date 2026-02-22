from fastapi import APIRouter, Depends
from datetime import datetime
from bson import ObjectId

from app.db.database import database
from app.models.draft import DraftCreate
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/drafts", tags=["drafts"])


# Save or update draft
@router.post("/")
async def save_draft(
    draft: DraftCreate,
    current_user=Depends(get_current_user)
):

    existing = await database["drafts"].find_one({
        "user_id": current_user["github_id"],
        "sprint_id": draft.sprint_id
    })

    data = {
        "user_id": current_user["github_id"],
        "sprint_id": draft.sprint_id,
        "title": draft.title,
        "problem": draft.problem,
        "hypothesis": draft.hypothesis,
        "tests": draft.tests,
        "conclusion": draft.conclusion,
        "tags": draft.tags,
        "updated_at": datetime.utcnow()
    }

    if existing:

        await database["drafts"].update_one(
            {"_id": existing["_id"]},
            {"$set": data}
        )

        return {"status": "updated"}

    else:

        await database["drafts"].insert_one(data)

        return {"status": "created"}


# Load draft
@router.get("/{sprint_id}")
async def get_draft(
    sprint_id: str,
    current_user=Depends(get_current_user)
):

    draft = await database["drafts"].find_one({
        "user_id": current_user["github_id"],
        "sprint_id": sprint_id
    })

    if not draft:
        return None

    return {
        "title": draft.get("title", ""),
        "problem": draft.get("problem", ""),
        "hypothesis": draft.get("hypothesis", ""),
        "tests": draft.get("tests", ""),
        "conclusion": draft.get("conclusion", ""),
        "tags": draft.get("tags", [])
    }


# Delete draft after submission
@router.delete("/{sprint_id}")
async def delete_draft(
    sprint_id: str,
    current_user=Depends(get_current_user)
):

    await database["drafts"].delete_one({
        "user_id": current_user["github_id"],
        "sprint_id": sprint_id
    })

    return {"status": "deleted"}