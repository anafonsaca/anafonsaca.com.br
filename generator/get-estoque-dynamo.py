import boto3
import json
import urllib3
from botocore.exceptions import NoCredentialsError



  
dynamodb = boto3.resource('dynamodb')


with open('mock2.txt') as f:
  data = json.load(f)

RequestSkuKeys = []

for produto in data['Cart']['Items']:
  if not {'sku': produto['Sku']} in RequestSkuKeys:
    RequestSkuKeys.append({'sku': produto['Sku']})



response = dynamodb.batch_get_item(
        RequestItems={
            'anafonsaca-estoque': {
              'Keys': RequestSkuKeys,
  
                'ConsistentRead': True
            }
        },
        ReturnConsumedCapacity='TOTAL'
    )


banco = {}


for item in response['Responses']['anafonsaca-estoque']:

  banco.update({item['sku']: item})

cartcounter = 0
for produto in data['Cart']['Items']:
  tam = produto['Description'].lower()
  banco[produto['Sku']][tam] = str(int(banco[produto['Sku']][tam]) - 1)
  if int(banco[produto['Sku']][tam]) >= 0:
    data['Cart']['Items'][cartcounter]['UnitPrice'] = banco[produto['Sku']]['preco']
  else:
    del data['Cart']['Items'][cartcounter]
  cartcounter += 1

print(data['Cart']['Items'])
