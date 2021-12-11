import boto3
import json
import urllib3
from botocore.exceptions import ClientError


dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

orderstable = dynamodb.Table('anafonsaca-vendas')

estoquetable = dynamodb.Table('anafonsaca-estoque')

pedido = '1638718108746AMtgfeoU'  

comprado = {}


#pega dados da ordem do banco:
try:
    response = orderstable.get_item(Key={'venda': pedido})
except ClientError as e:
    print(e.response['Error']['Message'])
else:
    orderdetail = response['Item']

try:
    worked=orderdetail['processada']
except:
    worked="no"


if (worked == 'no'):
    #puxa itens comprados da ordem:
    for sku in orderdetail['items']:
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

    #puxa todo estoque pra gerar um novo estoque json:    

    response = estoquetable.scan()
    estoque = response['Items']

    while 'LastEvaluatedKey' in response:
        response = estoquetable.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
        estoque.extend(response['Items'])

    novoestoque = {}
    for produto in estoque:
        novoestoque.update({produto['sku']: {'sku': produto['sku'], 'p': int(produto['p']), 'm': int(produto['m']), 'g': int(produto['g']), "u": int(produto['u'])}})

    jsonFilePath = '/tmp/estoque.json'

    with open(jsonFilePath, 'w') as jsonFile:
        jsonFile.write(json.dumps(novoestoque, indent=4))

    #sobe estoque json atualizado pro s3:

    def upload_to_aws(local_file, bucket, s3_file):
        s3 = boto3.client('s3')

        try:
            s3.upload_file(local_file, bucket, s3_file, ExtraArgs={'ACL': 'public-read'})
            print("Upload Successful")
            return True
        except FileNotFoundError:
            print("The file was not found")
            return False
        except NoCredentialsError:
            print("Credentials not available")
            return False

    uploaded = upload_to_aws('/tmp/estoque.json', 'anafonsaca', 'estoque.json')

    # atualiza estatus de já processada na ordem:

    orderstable.update_item(
    Key={
        'venda': ordernumber
    },
    UpdateExpression='SET worked = :val1',
    ExpressionAttributeValues={
        ':val1': 'yes'
    }
)
else:
    print("japrocessada")