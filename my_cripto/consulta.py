import requests

apikey = "1B731114-B858-433E-89F1-A792584BE95B"



def get_to_cantidad(data):
    from_moneda = data["from_moneda"]
    to_moneda = data["to_moneda"]
    url=f"https://rest.coinapi.io/v1/exchangerate/{from_moneda}/{to_moneda}?apikey={apikey}"
    try:
        response = requests.get(url)
        respuesta = response.json()
        precio_unitario =  respuesta["rate"]
        if response.status_code == 200:
            return precio_unitario
    except:
        return response.status_code, "-",respuesta["error"] #esto no va



