import json

from Redis.redis import r
mylist = ["apple", "banana", "cherry"]

r.lpush("mylist", json.dumps(mylist))
print(r.llen("mylist"))
