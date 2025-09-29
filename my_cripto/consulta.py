
from my_cripto import app
import requests
from flask import Flask



apikey = app.config["API_KEY"]




def get_to_cantidad(data):
    from_moneda = data["from_moneda"] 
    to_moneda = data["to_moneda"]
    from_cantidad = data["from_cantidad"]
    url = f"https://rest.coinapi.io/v1/exchangerate/{from_moneda}/{to_moneda}?apikey={apikey}"
    try:
        response = requests.get(url) #manda la consula a la api 
        respuesta = response.json() #convierte la respuesta json
        precio_unitario = respuesta["rate"] #saca el valor del precio unitatio que est aen la clave "rate"
        to_cantidad = from_cantidad * precio_unitario 
        if response.status_code == 200: #si esta todo bien (200), devuelve esos datos 
            return {"from_moneda":from_moneda, 
                    "from_cantidad":from_cantidad,
                    "to_moneda":to_moneda,
                    "rate":to_cantidad,
                    "precio_unitario":precio_unitario}
    except:
        return response.status_code, "-",respuesta["error"]   #si no esta todo ok(200), devuelve el codigo del error y el mensaje del error 



def get_info_divisa(data): #recibe todos los datods que estan en la table, (base de datos) #pero tambien le pasa datos para revisar, entonces la primera inicializacion coge los datos de la tabla y despues sirve para ir metiendo lo datos, y decuelve la exisrencia de todas las monedas
    info_divisa ={}
    
    for fila in data: 
        if fila["to_moneda"] not in  info_divisa: #si la moneda no esta en el dic de arriba
            info_divisa[fila["to_moneda"]]={"balance":0} #mete la moneda y la pone con balance 0 ej EUR:{"balance: 0"}
        cantidad_to_fila= fila["to_cantidad"]
        info_divisa[fila['to_moneda']]["balance"]+=cantidad_to_fila #suma la cantidad de esa moneda en el valor de balance
        
        if fila["from_moneda"] not in  info_divisa:
            info_divisa[fila["from_moneda"]]={"balance":0}
        cantidad_from_fila= fila["from_cantidad"]
        info_divisa[fila['from_moneda']]["balance"]-=cantidad_from_fila  #resta la cantidad de esa moneda en el valor de balance - para llevar un conteo de la catidad de las monedas que tien en la cartera 
    
    return info_divisa
      
def get_data_status(data):
    url = f"https://rest.coinapi.io/v1/exchangerate/EUR/?apikey={apikey}" #hace una consulta de todas las monedas 
    info_divisa= get_info_divisa(data) #pide la existencia de mondas en la cartera
    valores = {"ETH":0,"BNB":0,"ADA":0,"DOT":0,"BTC":0,"USDT":0,"XRP":0,"SOL":0,"MATIC":0,"EUR":1} #inicio los las monedas con valor 0
    price = 0
    response = requests.get(url) #hago la peticion de la api
    respuesta = response.json() #convierto la respuesta json
    for rates in respuesta["rates"]:
        if rates["asset_id_quote"] in valores: 
            valor = rates["rate"]
            valores[rates["asset_id_quote"]] = valor #saca los valores por las monedas y los introduce en valores
    actual_value = 0
    for moneda in info_divisa:
        if moneda in valores:
            
            value_eur = info_divisa[moneda]["balance"] / valores[moneda]
            info_divisa[moneda]["valor"]= round(value_eur, 2) 
            if moneda != 'EUR':
                actual_value+=value_eur
            else:
                price=value_eur
    
    #hace el calculo de las monedas que hay a euros 

    actual_value = round(actual_value, 2)
    price = round(price, 2)


    return {"wallet": info_divisa,
            "price": price,
            "actual_value":actual_value}

