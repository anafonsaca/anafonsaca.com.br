
import json
import urllib3
import time
import hashlib

email = "cliente@gmail.com"

emailhashed = hashlib.sha256(email.encode("utf-8")).hexdigest()

print(emailhashed)
  
AccessToken = 'EAADi3vDKwFcBADYm7Mobb27AO4JGJmsaZAqlVZCmISxpUva5Sa8NJRZBh89LQSAZAJ4tKgzfJCR2WkE2PW4zBBGtgkLxGMmq7b0YDYckbjPiJiGtvlFR7sJWZBNlUpMnnYi1TUZAMAIAwJrCjH10VsaV99MRq4YMIsNOwBgJbdCu7V4b6MEbPpz9lmcR4ugPMZD'
UserData = {
    "em":emailhashed
}
CustomData = {
    "value":"110",
    "currency":"BRL",
    "order_id":"00002"
}
Event = {
    "event_name":"Purchase",
    "event_time":int(time.time()),
    "user_data":UserData,
    "custom_data":CustomData,
    "action_source":"website",
    
}



payload = 'data=[' + json.dumps(Event) + ']' + '&access_token=' + AccessToken

print(payload)

http = urllib3.PoolManager()
r = http.request('POST', 'https://graph.facebook.com/v12.0/613123119936316/events',
                body=payload)
print(str(json.loads(r.data)))