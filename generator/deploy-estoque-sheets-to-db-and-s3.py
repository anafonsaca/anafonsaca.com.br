import boto3
import json
import urllib3
import csv
import urllib.request
from botocore.exceptions import NoCredentialsError

## url para a google sheets, publicada na web como csv, com compartilhamento aberto a todos:
url = 'https://docs.google.com/spreadsheets/u/1/d/1LfVTzMDrG0m87-JT3dLFieYFf5vIW_Fz38j1TMcUZX8/export?format=csv'
##################################################

response = urllib.request.urlopen(url)
lines = [l.decode('utf-8') for l in response.readlines()]

data = {}
csvReader = csv.DictReader(lines)
for rows in csvReader:
	id = rows['sku']
	data[id] = rows


############### insere no dynamodb

dynamodb = boto3.resource('dynamodb')

table = dynamodb.Table('anafonsaca-estoque')


with table.batch_writer() as writer:
    for roupa in data:  
        writer.put_item(Item={
        'sku': roupa,
        'p':  int(data[roupa]['p']),
        
        'm': int(data[roupa]['m']),
        
        'g': 
            int(data[roupa]['g']), 
        
        
        'u': 
            int(data[roupa]['u']),
        
        
        'preco': 
            str(data[roupa]['preco'])
        
    })
        
        
        
        
        
 

####### gera arquivo json limpo pro s3

estoque = {}
for sku in data:
    estoque.update({sku: {"sku": sku, "p": data[sku]['p'], "m": data[sku]['m'], "g": data[sku]['g'], "u": data[sku]['u']}})

jsonFilePath = '../data/estoque.json'

with open(jsonFilePath, 'w') as jsonFile:
    jsonFile.write(json.dumps(estoque, indent=4))


#### upload to s3

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

input("press enter")
uploaded = upload_to_aws('../data/estoque.json', 'anafonsaca', 'estoque.json')
