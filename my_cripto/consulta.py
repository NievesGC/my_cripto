import requests

apikey = "1B731114-B858-433E-89F1-A792584BE95B"





"""
tenemos json 
sacar variables json ---- from_moneda /from_cantidad/ to_moneda x
formatear la api con las monedas x
cogemos el response (que es el precio unitario)x
-metemos el preciop unitario en una valiable para devolver x
- calculamos to_cantidad = response*from_cantidad x
-capturar errores
-lo empaquetamos muy bonito y lo mandamos a js
"""



def get_to_cantidad(data):
    from_moneda = data["from_moneda"]
    to_moneda = data["to_moneda"]
    from_cantidad = data["from_cantidad"]
    url=f"https://rest.coinapi.io/v1/exchangerate/{from_moneda}/{to_moneda}?apikey={apikey}"
    try:
        response = requests.get(url)
        respuesta = response.json()
        precio_unitario =  respuesta["rate"]
        to_cantidad = precio_unitario * float(from_cantidad)
        if response.status_code == 200:
            return to_cantidad
    except:
        return 5



