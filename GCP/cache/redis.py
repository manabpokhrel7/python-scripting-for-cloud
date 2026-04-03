import redis
import os

#For local
# r = redis.Redis(host='localhost', port=6379, decode_responses=True)
#For Cloud
r = redis.Redis(
    host=os.getenv("REDIS_HOST"),
    port=int(os.getenv("REDIS_PORT", "6379")),
    decode_responses=True,
)