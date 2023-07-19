from my_cripto import app
from flask import render_template, request
from my_cripto.models import MovimientoDAOsqlite, Movimiento
import sqlite3

dao = MovimientoDAOsqlite(app.config["PATH_SQLITE"])

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/v1/movimientos", methods = ["GET"])
def todos():
    movimientos = dao.get_all()
    registro = {"status":"sucess","data":movimientos}
    return registro

"""    
@app.route("/api/v1/tasa/<moneda_from>/<moneda_to>",methods = ["POST"])
def insert():
    movimiento = Movimiento(request.json.get("fecha"),
                            request.json.get("hora"),
                            request.json.get("from_moneda"),
                            request.json.get("from_cantidad"),
                            request.json.get("to_moneda"),
                            request.json.get("to_cantidad")
                            )
    MovimientoDAOsqlite.insert(movimiento)
    """