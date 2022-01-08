import boto3
import json
import urllib3
#import certifi
import json
from base64 import b64encode



def lambda_handler(event, context):

 
    #instância o serviço da banco de dados DynamoDB
    dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

#senha para pegarme, somente a key no username:
    username = 'sk_0Xyz8zbt2uQp821D'
    password = ''

#Python Basic Auth
    encoded_credentials = b64encode(bytes(f'{username}:{password}',
                                encoding='ascii')).decode('ascii')
    auth_header = f'Basic {encoded_credentials}'

  
    parsedBody = json.loads(event)
    

    
    #cria uma lista única dos skus presentes nos items do pedido que entrou via json, 
    # para depois puxar esses skus do banco de dados :    
    RequestSkuKeys = []
    for produto in parsedBody['items']:
        if not {'sku': produto['Sku']} in RequestSkuKeys:
            RequestSkuKeys.append({'sku': produto['Sku']})
            
    #puxa os skus do banco de dados do estoque e cria uma lista:     
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

        #verifica se para cada item+tamanho do pedido json, tem estoque disponível (lista populada pelo db), puxa o preço do servidor e edita o nome para a fatura:
        
    cartcounter = 0
    for produto in parsedBody['items']:
        tam = produto['Description'].lower()
        temnobanco[produto['Sku']][tam] = str(int(temnobanco[produto['Sku']][tam]) - 1)
        if int(temnobanco[produto['Sku']][tam]) >= 0:
            #puxa o preço do item da lista banco:
            parsedBody['items'][cartcounter]['UnitPrice'] = temnobanco[produto['Sku']]['preco'] + "00"
            #edita nome do item para exibir o tamanho escolhido:
            parsedBody['items'][cartcounter]['Name'] = parsedBody['items'][cartcounter]['Name'] + " tamanho: " + parsedBody['items'][cartcounter]['Description']
           # parsedBody['Cart']['Items'][cartcounter]['Type'] = 'Service'
            
        else:
            del parsedBody['items'][cartcounter]
        cartcounter += 1

    #parsedBody['Cart']['Discount'] = None
    #parsedBody['SoftDescriptor'] = 'anafonshop'
 
    #insere o pedido na tabela:
    #    
    table = dynamodb.Table('anafonsaca-vendas')
    table.put_item(
        Item={
            'venda': "teste" + parsedBody['OrderNumber'],
            'cpf': parsedBody['document'],
            'email': parsedBody['email'],
            'phone': parsedBody['phone'],
            'nome': parsedBody['name'],
            'rua': parsedBody['deliverystreetaddress'],
            'numero': parsedBody['deliverystreetnumber'],
            'complemento': parsedBody['deliverycomplement'],
            'bairro': parsedBody['deliverydistrict'],
            'cidade': parsedBody['deliverycity'],
            'estado': parsedBody['deliverystate'],
            'items': parsedBody['items'],
            'carttotal': parsedBody['total'],
            'parcelas': parsedBody['installments'],
            'paystatus': 'aguardando'
        ##    'cupom': parsedBody['Cart']['Discount'],
        }
    )

    #monta objeto de items no formato para o pagar.me:
    valortotalcheck = 0
    itemscheckout = []
    icount = 0
    for produto in parsedBody['items']:
        obj = {}
        obj['amount'] = produto['UnitPrice']
        valortotalcheck += int(produto['UnitPrice'])
        #nome/descricao ja foi atualizado após a funcao do banco de dados
        obj['description'] = produto['Name']
        obj['quantity'] = '1'
        obj['code'] = produto['Sku']
        itemscheckout.append(obj)
        icount += 1
        
    retorno = {}
    retorno['status'] = 'estoque'

    if valortotalcheck > 0:


        pagarmepost = {
        "items": itemscheckout,
        "customer": {
            "name": parsedBody['name'],
            "email": parsedBody['email'],
            "document": parsedBody['document'],
            "type": parsedBody['buyertype'],
            "phones": {
                "mobile_phone": {
                    "country_code": parsedBody['phonecountry'],
                    "area_code": parsedBody['phoneareacode'],
                    "number": parsedBody['phone']
                }
            }
        },
        "payments": [
            {
                "payment_method": "credit_card",
                "credit_card": {
                    "recurrence": "false",
                    "installments": parsedBody['installments'],
                    "statement_descriptor": parsedBody['SoftDescriptor'],
                    "card": {
                        "number": parsedBody['cardNumber'],
                        "holder_name": parsedBody['cardHolder'],
                        "exp_month": parsedBody['cardExpirationMonth'],
                        "exp_year": parsedBody['cardExpirationYear'],
                        "cvv": parsedBody['cardCsc'],
                        "billing_address": {
                            "street": parsedBody['streetaddress'],
                            "number": parsedBody['streetnumber'],
                            "neighborhood": parsedBody['district'],
                            "zip_code": parsedBody['postalcode'],
                            "city": parsedBody['city'],
                            "state": parsedBody['state'],
                            "country": parsedBody['countryname']                
                        }
                    }
                }
            }
        ]}
        

        pagarmejson = json.dumps(pagarmepost)


        http = urllib3.PoolManager(
            #    cert_reqs="CERT_REQUIRED",
            #    ca_certs=certifi.where()
        )
        
        r2 = http.request('POST', 'https://api.pagar.me/core/v5/orders',
                headers={
            'Authorization': auth_header,
            'Content-Type': 'application/json' 
            },    
                body=pagarmejson
            )

        #string = r2.body.read().decode('utf-8')
        resposta = r2.data.decode('utf8')
        
        inforesposta = json.loads(resposta);
        
  
        retorno['status'] = inforesposta['status']
        retorno['payload'] = inforesposta
        
    retornojson = json.dumps(retorno)


    return {
        'statusCode': '200',
         'headers': {
            'Access-Control-Allow-Origin': '*'
        },
        'body': retornojson
    }

  
jaysao = '{"name":"Frederico FloreS","email":"frederico@jardimsonoro.com","document":"05099450903","countryname":"BR","phone":"988128123","postalcode":"88060292","state":"SC","city":"florianópolis","district":"são joão do rio vermelho","streetaddress":"avenida red park","streetnumber":"123","complement":"cdonmini0","deliveryname":"Frederico FloreS","deliverycountryname":"BR","deliveryphone":"41991595808","deliverypostalcode":"88060292","deliverystate":"SC","deliverycity":"florianópolis","deliverydistrict":"são joão do rio vermelho","deliverystreetaddress":"avenida red park","deliverystreetnumber":"123","deliverycomplement":"asdasd","deliveryequalbill":"deliveryequalbill","deliverytype":"free","payment-type":"pix","cardNumber":"4242424242424242","cardHolder":"Ana Paula","cardExpirationMonth":"03","cardExpirationYear":"2026","cardCsc":"123","installments":"1","items":[{"Name":"vestido hygge","Description":"G","UnitPrice":"848","Quantity":"1","Type":"Asset","Sku":"VES02SS22","Weight":"1"}],"OrderNumber":"pnfJimdz_1641156908740","SoftDescriptor":"pnfJimdz","buyertype":"individual","phonecountry":"55","phoneareacode":"41","total":"848"}'  

print(lambda_handler(jaysao, 'nada'))  
    


