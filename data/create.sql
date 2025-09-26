CREATE TABLE "movimientos" (
	"id"	INTEGER UNIQUE,
	"fecha"	TEXT NOT NULL,
	"hora"	INTEGER NOT NULL,
	"from_moneda"	TEXT NOT NULL,
	"from_cantidad"	REAL NOT NULL,
	"to_moneda"	TEXT NOT NULL,
	"to_cantidad"	REAL NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
)

CREATE INDEX "orden" ON "movimientos" (
	"fecha"	DESC,
	"hora"	DESC
)
