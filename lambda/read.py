import boto3
import json
import urllib3
from botocore.exceptions import ClientError


dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

orderstable = dynamodb.Table('anafonsaca-vendas')

estoquetable = dynamodb.Table('anafonsaca-estoque')

pedido = '1638718108746AMtgfeoU'  

comprado = {}

try:
    response = orderstable.get_item(Key={'venda': pedido})
except ClientError as e:
    print(e.response['Error']['Message'])
else:
    orderdetail = response['Item']

for sku in orderdetail['items']:
    print (sku['Sku'])
    print (sku['Description'])
    tamanho = sku['Description'].lower()
    estoquetable.update_item(
        Key={
            'sku': sku['Sku']
        },
        UpdateExpression='SET ' + tamanho + ' = ' + tamanho + ' + :val1',
        ExpressionAttributeValues={
            ':val1': -1
        }
    )

