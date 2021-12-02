
import json
import urllib3
import time
import hashlib

email = "cliente@gmail.com"

emailhashed = hashlib.sha256(email.encode("utf-8")).hexdigest()

print(emailhashed)
  
AccessToken = 'EAADi3vDKwFcBALqcC4atYDVaekQjZAZCKsRRWCuri8Q7UhfsyTppZCJkYcj6t3gBTHbJ8nUf0uzTtiYHaZBNOMsobj2pvqLGJIjiLlzL98sNgb3gt6a6IEc1tse2sDgAERmOvynbqutvcM4KYz6zkQ2cRBNlUyJwlViQ3bQ1WTWl6DANq2GXox08cXXqtH0ZD'
UserData = {
    "em":emailhashed
}
CustomData = {
    "value":"110",
    "currency":"BRL",
    "order_id":"00001"
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