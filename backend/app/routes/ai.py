from fastapi import APIRouter, Depends
from app.auth.dependencies import get_current_user
from app.services.ai_service import improve_text, generate_tags
from app.models.ai import ImproveRequest
from app.services.ai_service import expand_concept

router = APIRouter(prefix="/ai", tags=['ai'])

@router.post("/improve")
async def improve_content(
    body: ImproveRequest,
    current_user=Depends(get_current_user)
):
    improved = await improve_text(body.text, body.field)
    return {"improved_text": improved}

@router.post("/suggest-tags")
async def suggest_tags(
    body: dict,
    current_user=Depends(get_current_user)
):
    content = body.get("content", "")

    tags = await generate_tags(content)

    return {"tags": tags}

@router.post("/expand-concept")
async def expand_concept_endpoint(body: dict, current_user=Depends(get_current_user)):

    concept = body.get("concept")

    result = await expand_concept(concept)

    return result
