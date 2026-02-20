from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import RedirectResponse
from app.auth.dependencies import get_current_user
from fastapi import Depends
from app.core.config import settings
from app.db.database import database
from datetime import datetime, timedelta
from jose import jwt
import httpx
import os

router = APIRouter(prefix="/auth/github", tags=["Auth"])


@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    return current_user

@router.get("/login")
async def github_login():
    github_auth_url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={settings.GITHUB_CLIENT_ID}"
        f"&redirect_uri={settings.GITHUB_REDIRECT_URI}"
        f"&scope=read:user user:email"
    )
    return RedirectResponse(github_auth_url)

@router.get("/callback")
async def github_callback(code: str, response: Response):

    async with httpx.AsyncClient() as client:

        # Exchange code for access token
        token_response = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": settings.GITHUB_REDIRECT_URI,
            },
        )

        token_json = token_response.json()
        access_token = token_json.get("access_token")

        if not access_token:
            raise HTTPException(status_code=400, detail="OAuth failed")

        # Fetch user profile
        user_response = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        user_data = user_response.json()

    # Upsert user
    user_doc = {
        "github_id": str(user_data["id"]),
        "username": user_data["login"],
        "email": user_data.get("email"),
        "avatar_url": user_data.get("avatar_url"),
        "created_at": datetime.now(),
    }

    existing_user = await database["users"].find_one(
        {"github_id": user_doc["github_id"]}
    )

    if not existing_user:
        await database["users"].insert_one(user_doc)

    # 🔹 Create JWT
    token_payload = {
        "sub": user_doc["github_id"],
        "exp": datetime.now() + timedelta(hours=24)
    }

    jwt_token = jwt.encode(
        token_payload,
        settings.JWT_SECRET,
        algorithm="HS256"
    )

    # Set HTTP-only cookie
    response = RedirectResponse("http://localhost:5173/auth-success")
    response.set_cookie(
        key="access_token",
        value=jwt_token,
        httponly=True,
        secure=False,
        samesite="lax",
        domain="localhost"
    )

    return response
    

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token") 
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}