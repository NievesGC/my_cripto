import requests

apikey = "54402FA8-8B15-4F66-80E6-E67FB12E99BA"



def get_to_cantidad(data):
    from_moneda = data["from_moneda"]
    to_moneda = data["to_moneda"]
    from_cantidad= data["from_cantidad"]
    url=f"https://rest.coinapi.io/v1/exchangerate/{from_moneda}/{to_moneda}?apikey={apikey}"
    try:
        response = requests.get(url)
        respuesta = response.json()
        precio_unitario =  respuesta["rate"]
        if response.status_code == 200:
            to_cantidad = from_cantidad * precio_unitario
            return to_cantidad
    except:
        return response.status_code, "-",respuesta["error"] #esto no va



