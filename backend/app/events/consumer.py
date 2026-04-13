from kafka import KafkaConsumer
import json
import asyncio
from datetime import datetime
from app.db.database import database

consumer = KafkaConsumer(
    "opensprint-events",
    bootstrap_servers="localhost:9092",
    value_deserializer=lambda x: json.loads(x.decode("utf-8"))
)

print("Kafka consumer started...")


# ✅ async handler
async def handle_event(event):
    print(event)

    if event["event"] == "dive_view":

        await database["analytics"].insert_one({
            "type": "dive_view",
            "dive_id": event["dive_id"],
            "visitor_id": event["user_id"],
            "referrer": event.get("referrer", "direct"),
            "created_at": datetime.now()
        })


# ✅ sync loop calling async
for message in consumer:

    event = message.value
    print("Received:", event)

    asyncio.run(handle_event(event))