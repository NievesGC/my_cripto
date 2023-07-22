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
    movimientos = dao.get_all()
    return {"status":"sucess", "data":movimientos}

@app.route("/api/v1/tasa/<from_moneda>/<to_moneda>",methods = ["GET"])
def cambio(from_moneda,to_moneda):
    from_cantidad = float(request.args.get('from_cantidad'))
    data = {"from_moneda": from_moneda, "to_moneda": to_moneda, "from_cantidad" : from_cantidad}
    rate = consulta.get_to_cantidad(data)
    return jsonify(rate)

@app.route("/api/v1/movimiento", methods = ["POST"])
def inserta():
    movimiento = Movimiento(request.json.get("fecha"),
                            request.json.get("hora"),
                            request.json.get("from_moneda"),
                            request.json.get("from_cantidad"),
                            request.json.get("to_moneda"),
                            request.json.get("to_cantidad"))
    dao.insert(movimiento)
    

