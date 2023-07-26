import requests

apikey = "54402FA8-8B15-4F66-80E6-E67FB12E99BA"



def get_to_cantidad(data):
    from_moneda = data["from_moneda"]
    to_moneda = data["to_moneda"]
    from_cantidad = data["from_cantidad"]
    url = f"https://rest.coinapi.io/v1/exchangerate/{from_moneda}/{to_moneda}?apikey={apikey}"
    try:
        response = requests.get(url)
        respuesta = response.json()
        precio_unitario = respuesta["rate"]
        to_cantidad = from_cantidad * precio_unitario 
        if response.status_code == 200:
            return {"from_moneda":from_moneda, 
                    "from_cantidad":from_cantidad,
                    "to_moneda":to_moneda,
                    "rate":to_cantidad,
                    "precio_unitario":precio_unitario}
    except:
        return response.status_code, "-",respuesta["error"] #esto no va



def get_info_divisa(data):
    info_divisa ={}
    for fila in data:
        if fila["to_moneda"] not in  info_divisa:
            info_divisa[fila["to_moneda"]]={"balance":0}
        cantidad_to_fila= fila["to_cantidad"]
        info_divisa[fila['to_moneda']]["balance"]+=cantidad_to_fila
        
        if fila["from_moneda"] not in  info_divisa:
            info_divisa[fila["from_moneda"]]={"balance":0}
        cantidad_from_fila= fila["from_cantidad"]
        info_divisa[fila['from_moneda']]["balance"]-=cantidad_from_fila
    return info_divisa
      
def get_data_status(data):
    url = f"https://rest.coinapi.io/v1/exchangerate/EUR/?apikey={apikey}"
    info_divisa = get_info_divisa(data)
    valores = {"ETH":0,"BNB":0,"ADA":0,"DOT":0,"BTC":0,"USDT":0,"XRP":0,"SOL":0,"MATIC":0,"EUR":1}
    price = 0
    response = requests.get(url)
    respuesta = response.json()
    for rates in respuesta["rates"]:
        if rates["asset_id_quote"] in valores:
            valor = rates["rate"]
            valores[rates["asset_id_quote"]] = valor
    actual_value = 0
    for moneda in info_divisa:
        if moneda in valores:
            
            value_eur = info_divisa[moneda]["balance"] / valores[moneda]
            info_divisa[moneda]["valor"]=value_eur
            if moneda != 'EUR':
                actual_value+=value_eur
            else:
                price=value_eur
    


    return {"wallet": info_divisa,
            "price": price,
            "actual_value":actual_value}
