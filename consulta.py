import requests

apikey = "1B731114-B858-433E-89F1-A792584BE95B"

url=f"https://rest.coinapi.io/v1/exchangerate/BTC/EUR?apikey={apikey}"

response = requests.get(url)

print(response.text)