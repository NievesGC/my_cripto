from my_cripto import app
from flask import render_template

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/v1/movimientos", methods = ["GET"])
def tabla():
    return "crear validadores de movimientos para que lo meta en los datos"
