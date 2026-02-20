from fastapi import FastAPI
from app.db.database import database
from app.routes import user, sprint, deep_dive, search
from app.auth import github
from fastapi.middleware.cors import CORSMiddleware
from app.routes import draft

app = FastAPI(title="OpenSprint API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(user.router)
app.include_router(github.router)
app.include_router(sprint.router)
app.include_router(deep_dive.router)
app.include_router(search.router)
app.include_router(draft.router)

@app.get("/")
async def root():
    return {"message": "OpenSprint backend running"}


@app.get("/health")
async def health_check():
    try:
        await database.command("ping")
        return {"status": "MongoDB Connected"}
    except Exception as e:
        return {"status": "MongoDB not connected", "error": str(e)}