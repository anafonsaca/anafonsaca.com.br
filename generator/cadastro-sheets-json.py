import csv, urllib.request, json


## url para a google sheets, publicada na web como csv, com compartilhamento aberto a todos:
url = 'https://docs.google.com/spreadsheets/u/1/d/1LfVTzMDrG0m87-JT3dLFieYFf5vIW_Fz38j1TMcUZX8/export?format=csv'
##################################################


response = urllib.request.urlopen(url)
lines = [l.decode('utf-8') for l in response.readlines()]
##cr = csv.reader(lines)
data = {}
csvReader = csv.DictReader(lines)
for rows in csvReader:
	id = rows['sku']
	data[id] = rows


print(json.dumps(data, indent=4))

