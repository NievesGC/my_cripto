from my_cripto import app
from flask import render_template, request, jsonify
from my_cripto.models import MovimientoDAOsqlite, Movimiento
from my_cripto import consulta
import sqlite3

dao = MovimientoDAOsqlite(app.config["PATH_SQLITE"])

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/v1/movements", methods = ["GET"])
def todos():
    try:
        movimientos = dao.get_all()
        respuesta = {"status":"success", 
                    "data":movimientos}
        return jsonify(respuesta) #trae los datos de la base de datos
    except:
        respuesta = { "status": "fail",
                    "mensaje": "Error en base de datos "
        }
        return jsonify(respuesta,400)


@app.route("/api/v1/tasa/<from_moneda>/<to_moneda>",methods = ["GET"])
def cambio(from_moneda,to_moneda):
    try:
        from_cantidad = float(request.args.get('from_cantidad')) #trae del fetch el dato from_cantidad
        data = {"from_moneda": from_moneda, "to_moneda": to_moneda, "from_cantidad" : from_cantidad} #crea diccionario data 
        rate = consulta.get_to_cantidad(data) #trae los valores de la api, aqui se hace la consulta de los valores
        info_divisa = consulta.get_info_divisa(dao.get_all()) #busca todos los datos de bd movimientos y se los pasa info divisa, este crea un "json",donde pone los valores de la cantidad que se ha cambiado tanto de from como de to, pero en from lo resta - para descontarlo de las existencias de monedas
        monedas = list(info_divisa.keys()) #me en una lista sola las claves de las monedas que tiene existencias en la base de datos
        respuesta = {"status": "success", 
                     "rate":rate, #devuelve los valores consultados a coinapiio -DICCIONARIO
                     "monedas":monedas} #devuelve las monedas de las que hay existencia - LISTA  (de las que han estado en la tabla, tengan existencias o no )
        return jsonify(respuesta) #Lo convierte json
    except:
        respuesta = {"status":"fail", 
                     "mensaje":"Error en la consulta"}
        return(respuesta,400)

@app.route("/api/v1/movement", methods = ["POST"])
def inserta():
    try:
        info_divisa = consulta.get_info_divisa(dao.get_all()) #Coje los datos de la base de datos, los pasa info divisa para validar las monedas y la cantidad que hay
        movimiento = Movimiento(request.json.get("fecha"),#Esta api trae el json de js, entonces saca los datos de json y los genera con la class Movimientos
                                request.json.get("hora"),
                                request.json.get("from_moneda"),
                                request.json.get("from_cantidad"),
                                request.json.get("to_moneda"),
                                request.json.get("to_cantidad"),
                                request.json.get("from_cantidad_actual"),
                                info_divisa #y mete en la variable movimiento, todos los datos mas infodivisa
                                ) 

        dao.insert(movimiento) #Introduce los datos en la base de datos--****no se que hace con el dato de info divisa
        respuesta = {"status": "success",
                     "mensaje": "Compra realizada con éxito",
                     "id": "<nuevo id creado>",
                     "monedas": info_divisa}
        return jsonify(respuesta,201)
    except ValueError as e:
        respuesta ={
            "status": "fail",
            "mensaje":  str(e)
        }
        return jsonify(respuesta,200)
    except sqlite3.Error as e:
        respuesta = {
            "status": "fail",
            "mensaje": str(e)
        }
        return jsonify(respuesta)


@app.route("/api/v1/status", methods = ["GET"])
def status():
    try:
        datos = dao.get_all() #trae los datos de la base de datos
        data = consulta.get_data_status(datos) #consulta el precio de las monedas y calcula el precio en euros de todas
        respuesta ={"status": "success",
                    "data":data}
        return jsonify(respuesta)
    except:
        respuesta= {"status":"fail",
                    "mensaje":"Error en consulta"}
        return jsonify(respuesta, 400) 
        
    
    