# from kafka import KafkaProducer
# import json

# producer = KafkaProducer(
#     bootstrap_servers="localhost:9092",
#     value_serializer=lambda v: json.dumps(v).encode("utf-8")
# )

# TOPIC = "opensprint-events"

# def send_event(event_name: str, payload: dict):
#     try:
#         producer.send(TOPIC, {
#             "event": event_name,
#             **payload
#         })
#     except Exception as e:
#         print("Kafka error:", e)

from kafka import KafkaProducer
import json

TOPIC = "opensprint-events"

try:
    producer = KafkaProducer(
        bootstrap_servers="localhost:9092",
        value_serializer=lambda v: json.dumps(v).encode("utf-8")
    )
    print("Kafka connected successfully")
except Exception as e:
    print("Kafka unavailable:", e)
    producer = None


def send_event(event_name: str, payload: dict):
    if producer is None:
        print("Skipping event. Kafka not available.")
        return

    try:
        producer.send(
            TOPIC,
            {
                "event": event_name,
                **payload
            }
        )
        producer.flush()
    except Exception as e:
        print("Kafka error:", e)