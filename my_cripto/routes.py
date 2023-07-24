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
        respuesta = {"status": "sucess", 
                     "rate":rate}
        return jsonify(respuesta)
    except:
        respuesta = {"status":"fail", 
                     "mensaje":"Error en la consulta"}
        return(respuesta,400)

@app.route("/api/v1/movimiento", methods = ["POST"])
def inserta():
    try:
        movimiento = Movimiento(request.json.get("fecha"),
                                request.json.get("hora"),
                                request.json.get("from_moneda"),
                                request.json.get("from_cantidad"),
                                request.json.get("to_moneda"),
                                request.json.get("to_cantidad"),
                                request.json.get("from_cantidad_actual"),)
        #print(movimiento)

        #mvm = dao.get(movimiento)
        dao.insert(movimiento)
        respuesta = {"status": "sucess",
                     "mensaje": "Compra realizada con éxito",
                     "id": "<nuevo id creado>"}
        print("SOY EL MOVIMIENTO",movimiento)
        print("SOY RESPUESTA", respuesta)
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
    pass
    """
    datos = dao.get_all()
        
    
    
    gestion = " llamo a una funcion para que me deculda los datos que necesito insertar en la tabla"

    return (gestion) "los datos que voy a insertar en status"""