import boto3
import json
import urllib3


  
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

with open('mock2.txt') as f:
  parsedBody = json.load(f)





RequestSkuKeys = []

for produto in parsedBody['Cart']['Items']:
    if not {'sku': produto['Sku']} in RequestSkuKeys:
        RequestSkuKeys.append({'sku': produto['Sku']})
        

dbresponse = dynamodb.batch_get_item(
    RequestItems={
        'anafonsaca-estoque': {
            'Keys': RequestSkuKeys,

            'ConsistentRead': True
        }
    },
    ReturnConsumedCapacity='TOTAL'
)

temnobanco = {}

for item in dbresponse['Responses']['anafonsaca-estoque']:
    temnobanco.update({item['sku']: item})
    
cartcounter = 0
for produto in parsedBody['Cart']['Items']:
    print("cart counter:" + str(cartcounter))
    print("produto: " + produto['Sku'])
    tam = produto['Description'].lower()
    temnobanco[produto['Sku']][tam] = str(int(temnobanco[produto['Sku']][tam]) - 1)
    if int(temnobanco[produto['Sku']][tam]) >= 0:
        print("tem estoque")
        print("preno no banco: " + str(temnobanco[produto['Sku']]['preco']))
        print("preco antes: " + str(parsedBody['Cart']['Items'][cartcounter]['UnitPrice']))
        parsedBody['Cart']['Items'][cartcounter]['UnitPrice'] = temnobanco[produto['Sku']]['preco']
        print("preco depois: " + str(parsedBody['Cart']['Items'][cartcounter]['UnitPrice']))
    else:
        print("esgotado no banco")
        del parsedBody['Cart']['Items'][cartcounter]
    cartcounter += 1

parsedBody['Cart']['Discount'] = None
parsedBody['SoftDescriptor'] = 'anafonshop'
parsedBody['Shipping']['SourceZipCode'] = '88330786'



table = dynamodb.Table('anafonsaca-vendas')
table.put_item(
    Item={
        'venda': parsedBody['OrderNumber'],
        'cpf': parsedBody['Customer']['Identity'],
        'email': parsedBody['Customer']['Email'],
        'phone': parsedBody['Customer']['Phone'],
        'nome': parsedBody['Customer']['FullName'],
        'rua': parsedBody['Shipping']['Address']['Street'],
        'numero': parsedBody['Shipping']['Address']['Number'],
        'complemento': parsedBody['Shipping']['Address']['Complement'],
        'bairro': parsedBody['Shipping']['Address']['District'],
        'cidade': parsedBody['Shipping']['Address']['City'],
        'estado': parsedBody['Shipping']['Address']['State'],
        'items': parsedBody['Cart']['Items'],
        'cupom': parsedBody['Cart']['Discount'],
    }
)


datapost = json.dumps(parsedBody)
print('')
print('')
print('')
print('')
print('')
print('')
print(datapost)
print('')
print('')
print('')
print('')
print('')
print('')
http = urllib3.PoolManager()
r = http.request('POST', 'https://cieloecommerce.cielo.com.br/api/public/v1/orders',
                headers={'Content-Type': 'application/json', 'MerchantId': 'a55fccab-9542-4a22-8404-ff4aaa631374'},
                body=datapost)


print(str(json.loads(r.data)))
#print('"' + str(json.loads(r.data)['settings']['checkoutUrl'] + '"'))








