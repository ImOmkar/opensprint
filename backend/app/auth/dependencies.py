from unittest import async_case
from fastapi import Depends, HTTPException, Request
from jose import jwt, JWTError
from app.core.config import settings
from app.db.database import database

async def get_current_user(request: Request):
    
    token = request.cookies.get("access_token")
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=["HS256"]
        )
        
        github_id = payload.get("sub")
        
        if not github_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalid")
    
    user = await database["users"].find_one({"github_id": github_id})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user["_id"] = str(user["_id"])
    
    return user