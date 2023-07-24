import sqlite3
from datetime import datetime

MONEDAS = {"EUR","ETH","BNB","ADA","DOT","BTC","USDT","XRP","SOL","MATIC"}

class Movimiento:
    def __init__(self,fecha,hora,from_moneda,from_cantidad,to_moneda,to_cantidad,from_cantidad_actual, id = None):
        
        self.id = id
        self.fecha = fecha
        self.hora = hora
        self.from_moneda = from_moneda
        self.from_cantidad = from_cantidad
        self.to_moneda = to_moneda
        self.to_cantidad = to_cantidad

        self.from_cantidad_actual = from_cantidad_actual
        
    
    def __eq__(self,other):
        return self.fecha == other.fecha and self.hora == other.hora and self.from_moneda == other.from_moneda and self.from_cantidad == other.from_cantidad and self.to_moneda == other.to_moneda and self.to_cantidad == other.to_cantidad
    
    def to_dict(self):
        return{
            "id":self.id,
            "fecha":str(self.fecha),
            "hora":str(self.hora),
            "from_moneda": str(self.from_moneda),
            "from_cantidad": str(self.from_cantidad),
            "to_moneda":str(self.to_moneda),
            "to_cantidad":str(self.to_cantidad)
        }

class MovimientoDAOsqlite:
    def __init__(self,db_path):
        self.path = db_path

        query = """
        CREATE TABLE IF NOT EXISTS"movimientos" (
                "id"	INTEGER UNIQUE,
                "fecha"	TEXT NOT NULL,
                "hora"	INTEGER NOT NULL,
                "from_moneda"	TEXT NOT NULL,
                "from_cantidad"	REAL NOT NULL,
                "to_moneda"	TEXT NOT NULL,
                "to_cantidad"	REAL NOT NULL,
                PRIMARY KEY("id" AUTOINCREMENT)
            );
        """
    
        con = sqlite3.connect(self.path)
        cur = con.cursor()
        cur.execute(query)
        con.close()

    def insert(self,movimiento):
        query = """
        INSERT INTO movimientos
            (fecha,hora,from_moneda,from_cantidad,to_moneda,to_cantidad)
        VALUES(?,?,?,?,?,?)
        """

        con = sqlite3.connect(self.path)
        cur = con.cursor()
        cur.execute(query,(movimiento.fecha, movimiento.hora,movimiento.from_moneda,movimiento.from_cantidad,movimiento.to_moneda,movimiento.to_cantidad))
        print("sE ESTA INSERTANDO")
        con.commit()
        con.close()

    def get(self,id):
        query = """
        SELECT fecha,hora,from_moneda,from_cantidad,to_moneda,to_cantidad,id
            FROM movimientos
            WHERE id = ?;
        """

        con = sqlite3.connect(self.path)
        cur = con.cursor()
        cur.execute(query,(id))
        res = cur.fetchone()  #lee la primera linea necesito este u otro , o me  vale solo con el id¿?¿?¿
        con.close()
        if res:
            return Movimiento(*res)

    def get_all(self):
        query = """
        SELECT fecha,hora,from_moneda,from_cantidad,to_moneda,to_cantidad,id
            FROM movimientos
            ORDER by id;
            """
        
        con = sqlite3.connect(self.path)
        cur = con.cursor()
        cur.execute(query)
        res = cur.fetchall()
        lista = []
        for reg in res:
            lista.append(
                {
                    "fecha":reg[0],
                    "hora":reg[1],
                    "from_moneda":reg[2],
                    "from_cantidad":reg[3],
                    "to_moneda":reg[4],
                    "to_cantidad":reg[5],
                    "id":reg[6]
                }
            )
        print(lista)
        con.close()
        
        return lista
    
    

