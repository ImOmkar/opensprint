from kafka import KafkaProducer
import json

producer = KafkaProducer(
    bootstrap_servers="localhost:9092",
    value_serializer=lambda v: json.dumps(v).encode("utf-8")
)

TOPIC = "opensprint-events"

def send_event(event_name: str, payload: dict):
    try:
        producer.send(TOPIC, {
            "event": event_name,
            **payload
        })
    except Exception as e:
        print("Kafka error:", e)