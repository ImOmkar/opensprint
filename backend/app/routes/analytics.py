from fastapi import APIRouter, Request
from datetime import datetime
from app.db.database import database
from app.models.analytics import AnalyticsEvent

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.post("/event")
async def track_event(event: AnalyticsEvent, request: Request):

    data = event.dict()

    data["created_at"] = datetime.now()

    await database["analytics_events"].insert_one(data)

    return {"status": "ok"}


@router.get("/dive/{dive_id}")
async def get_dive_analytics(dive_id: str):

    events = database["analytics_events"]

    views = await events.count_documents({
        "type": "dive_view",
        "dive_id": dive_id
    })

    readers = len(await events.distinct(
        "visitor_id",
        {
            "type": "dive_view",
            "dive_id": dive_id
        }
    ))

    # views by day
    timeline = await events.aggregate([
        {
            "$match": {
                "type": "dive_view",
                "dive_id": dive_id
            }
        },
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": "$created_at"
                    }
                },
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}}
    ]).to_list(100)

    # traffic sources
    sources = await events.aggregate([
        {
            "$match": {
                "type": "dive_view",
                "dive_id": dive_id
            }
        },
        {
            "$group": {
                "_id": "$referrer",
                "count": {"$sum": 1}
            }
        }
    ]).to_list(20)

    return {
        "views": views,
        "readers": readers,
        "timeline": timeline,
        "sources": sources
    }

@router.get("/sprint/{sprint_id}")
async def get_sprint_analytics(sprint_id: str):

    events = database["analytics_events"]

    total_views = await events.count_documents({
        "type": "dive_view",
        "sprint_id": sprint_id
    })

    unique_visitors = len(await events.distinct(
        "visitor_id",
        {
            "type": "dive_view",
            "sprint_id": sprint_id
        }
    ))

    dives = await database["deep_dives"].find({
        "sprint_id": sprint_id
    }).to_list(100)

    dive_stats = []

    for dive in dives:

        views = await events.count_documents({
            "type": "dive_view",
            "dive_id": str(dive["_id"])
        })

        dive_stats.append({
            "title": dive["title"],
            "dive_id": str(dive["_id"]),
            "views": views
        })

    dive_stats = sorted(dive_stats, key=lambda x: x["views"], reverse=True)

    traffic_sources = await events.aggregate([
        {
            "$match": {
                "type": "dive_view",
                "sprint_id": sprint_id
            }
        },
        {
            "$group": {
                "_id": "$referrer",
                "count": {"$sum": 1}
            }
        }
    ]).to_list(20)

    return {
        "views": total_views,
        "visitors": unique_visitors,
        "dives": dive_stats,
        "sources": traffic_sources
    }