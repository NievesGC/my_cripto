#SIMULADOR DE COMPRA DE CRIPTO MONEDAS Y CARTERA 




# Gestión de movimientos



Prototipo de aplicación web realizada con flask y javascript con estructura SPA.

Permite simular la compra, tardeo y venta de criptomonedas de entre las siguientes

- **_EUR_**, 		BTC,

- ETH,		USDT,

- BNB, 		XRP,

- ADA, 		SOL,

- DOT,		MATIC



## Reglas básicas de la simulación de compra-venta

1. Se parte de infinitos euros (siempre se pueden conseguir más trabajando)

2. Solo se puede vender una criptomoneda si se dispone de saldo de la misma. Se ha comprado anteriormente y aún no se ha vendido.



## Funcionalidad de la aplicación

Tiene una pantalla única. En la que te encontraras al inicio la lista de movimientos, pulsando sobre el botón Compra puedes deplegar el tpv, en el que puedes realizar los intercambios de monedas. Y con el botón Status, el estado de inversión, donde podrás ver los saldos de las monedas, el coste real en euros y su valor en euros al momento de abrir y pulsar sobre recalcular.





## Instalación



### Servicios externos



Esta aplicación utiliza coinAPI.io como servicio para calcular el valor actual de cada cripto. Para hacerla funcionar es necesario obtener una apikey en [su web](https://www.coinapi.io/market-data-api/pricing)



### Paso a paso



1. Replicar el fichero `.env_template` y renombrarlo a `.env`

2. Informar las siguientes claves:

    - FLASK_APP: main.py (no cambiar)

    - FLASK_DEBUG: debe ser False en entornos de producción, si vas a modificar la aplicación es más cómodo a True

    - FLASK_API_KEY: la apikey de coinApi.io obtenida más arriba

    - FLASK_PATH_SQLITE: dejar como está



## Ejecución de la aplicación

1. Instalar todas las dependencias. Escribir

```

pip install -r requeriments.txt

```



2. Lanzar la aplicación desde directorio donde esté instalada. Teclear

```

flask run