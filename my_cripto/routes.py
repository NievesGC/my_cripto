from my_cripto import app
from flask import render_template, request, jsonify
from my_cripto.models import MovimientoDAOsqlite, Movimiento
from my_cripto import consulta
import sqlite3

dao = MovimientoDAOsqlite(app.config["PATH_SQLITE"])

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/v1/movimientos", methods = ["GET"])
def todos():
    try:
        movimientos = dao.get_all()
        respuesta = {"status":"sucess", 
                    "data":movimientos}
        return jsonify(respuesta)
    except:
        respuesta = { "status": "fail",
                    "mensaje": "Error en base de datos "
        }
        return jsonify(respuesta,400)


@app.route("/api/v1/tasa/<from_moneda>/<to_moneda>",methods = ["GET"])
def cambio(from_moneda,to_moneda):
    try:
        from_cantidad = float(request.args.get('from_cantidad'))
        data = {"from_moneda": from_moneda, "to_moneda": to_moneda, "from_cantidad" : from_cantidad}
        rate = consulta.get_to_cantidad(data)
        info_divisa = consulta.get_info_divisa(dao.get_all())
        monedas = list(info_divisa.keys()),
        respuesta = {"status": "sucess", 
                     "rate":rate,
                     "monedas":monedas}
        return jsonify(respuesta)
    except:
        respuesta = {"status":"fail", 
                     "mensaje":"Error en la consulta"}
        return(respuesta,400)

@app.route("/api/v1/movimiento", methods = ["POST"])
def inserta():
    try:
        info_divisa = consulta.get_info_divisa(dao.get_all())
        movimiento = Movimiento(request.json.get("fecha"),
                                request.json.get("hora"),
                                request.json.get("from_moneda"),
                                request.json.get("from_cantidad"),
                                request.json.get("to_moneda"),
                                request.json.get("to_cantidad"),
                                request.json.get("from_cantidad_actual"),
                                info_divisa
                                )
        
        dao.insert(movimiento)
        respuesta = {"status": "sucess",
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
        datos = dao.get_all()
        data = consulta.get_data_status(datos)
        respuesta ={"status": "sucess",
                    "data":data}
        return jsonify(respuesta)
    except:
        respuesta= {"status":"fail",
                    "mensaje":"Error en consulta"}
        
    
    