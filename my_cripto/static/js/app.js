

function appendCell(row,data){
    let the_cell = document.createElement("td")
    the_cell.innerHTML = data
    row.appendChild(the_cell)
}

function muestraTodos(data){
    
    
    let the_father = document.querySelector("#tabla_movimientos")

    for (let i=0; i < data.data.length; i++){
        let the_row = document.createElement("tr")
        the_father.appendChild(the_row)

        appendCell(the_row,data.data[i].fecha)
        appendCell(the_row,data.data[i].hora)
        appendCell(the_row,data.data[i].from_moneda)
        appendCell(the_row,data.data[i].from_cantidad)
        appendCell(the_row,data.data[i].to_moneda)
        appendCell(the_row,data.data[i].to_cantidad)
    }
}

function convert_to_json(registro){
    return registro.json();
}

function process_error(error){
    alert("Se ha producido el error :" + error)
}
function consulta(){
    let f_moneda = document.querySelector("#from_moneda").value;
    
    let f_cantidad = document.querySelector("#from_cantidad").value;
    if (isNaN(f_cantidad)){
        alert("Los valores introducidos han de ser numéricos");
        return;
    }
    if (f_cantidad < 0) {
        alert("La cantidad ha de ser superior a 0");
        return;
    }
    
    let t_moneda = document.querySelector("#to_moneda").value;

    unificaDatos(f_moneda,t_moneda,f_cantidad) //dejar de momento aqui/creo que no va a funconar para la validacion,tiene que ir destras de fetch?¿? como le meto las variables para que no me de error undefined
    
    fetch(`/api/v1/tasa/${f_moneda}/${t_moneda}?from_cantidad=${f_cantidad}`)
        .then(convert_to_json)
        .then(muestraConsulta) 
        .catch(process_error);
 
}

function muestraConsulta(rate){
    let to_moneda = document.querySelector("#to_moneda").value;
    let the_father = document.querySelector("#to_moneda_muestra");
    the_father.innerHTML=""
    
    let pCantidadTo = document.createElement("p");
    pCantidadTo.id = "to_cantidad";
   
    let pPrecioUnitario = document.createElement("p");
    pPrecioUnitario.id = "precio_unitario";
   
    let rate_num = parseFloat(rate.rate);
    let precioUnitario = parseFloat(rate.precio_unitario);
   
    pCantidadTo.innerHTML = "Cantidad: " + rate_num.toFixed(10);
    pPrecioUnitario.innerHTML = "Precio unitario: " + precioUnitario.toFixed(10);
    
    the_father.appendChild(pCantidadTo);
    the_father.appendChild(pPrecioUnitario);

    unificaDatos(rate_num,precioUnitario)
}

function unificaDatos(f_moneda,t_moneda,f_cantidad,rate_num,precioUnitario){
    let fecha = new Date().toISOString().slice(0,10);
    let fechaHora = new Date()
    let horas = fechaHora.getHours();
    let minutos = fechaHora.getMinutes();
    let hora =`${horas}:${minutos}`;
    let from_cantidad_actual = document.querySelector("#from_cantidad").value;
    data = {"fecha": fecha,
            "hora": hora,
            "from_moneda": f_moneda,
            "from_cantidad": f_cantidad,
            "from_cantidad_actual": from_cantidad_actual,
            "to_moneda": t_moneda,
            "to_cantidad": rate_num,
            "precio_unitario": precioUnitario
        }
}

function guardarMovimiento(){
    let data = data;
    let options = {
        body: JSON.stringify(data),
        method: "POST",
        headers: {
            "Content-Type":"application/json"
        }
    };
    fetch("/api/v1/movimiento")
        .then(convert_to_json)
        .then(inserta)
        .catch(process_error)

}

function inserta(){
    fetch("/api/v1/movimiento")
        .then(convert_to_json)
        .then(muestraTodos)
        .catch(process_error)
}

window.onload = function(){

    fetch("/api/v1/movimientos")
        .then(convert_to_json)
        .then(muestraTodos)
        .catch(process_error)
    

    let btnCompra = document.querySelector("#btnCompra")
    
    btnCompra.addEventListener("click", function(event){
        event.preventDefault()

        let formulario = document.querySelector("#tasa_intercambio")
        formulario.classList.remove("invisible")

        document.querySelector("#calcular").addEventListener("click",function(event){
            event.preventDefault();
            consulta();
            
        })
            
        document.querySelector("#submit").addEventListener("click",function(event){
            event.preventDefault();
            guardarMovimiento;
            

        })

        }
    )

    
    
}