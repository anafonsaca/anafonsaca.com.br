
import json
import urllib3
import time
import hashlib

email = "cliente@gmail.com"

emailhashed = hashlib.sha256(email.encode("utf-8")).hexdigest()

print(emailhashed)
  
AccessToken = 'EAADi3vDKwFcBADitZBEMVbfaUHKtWHxxqjdl3EwK470q1W6QONLpqTWqxUylCqaELht9Wd9W7p7tthOGOP7TIKZChunXUWQUoGULYWbKPaVr5NNRprO3qyR3EDs2RmvA1I5f0IHW2H5MftU8lh9mrCkg4eOFuKnlkN5QcJEHwMaMlyVsCEQZApGxy3jlakZD'
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