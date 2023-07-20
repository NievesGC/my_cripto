from my_cripto import app
from flask import render_template, request
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

@app.route("/api/v1/tasa/daigualelnombre",methods = ["GET"])
def cambio():
    print(request.args)
    from_cantidad = request.args.get("from_cantidad")
    from_moneda = request.args.get("from_moneda")
    to_moneda = request.args.get("to_moneda")
    data = {"from_moneda": from_moneda,
            "from_cantidad": from_cantidad,
            "to_moneda": to_moneda}
    print(data)
    resultado = consulta.get_to_cantidad(data)
    print(resultado)
    return {"resultado": resultado}

