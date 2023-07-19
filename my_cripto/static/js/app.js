var pet_todos = new XMLHttpRequest()

function appendCell(row,data){
    let the_cell = document.createElement("td")
    the_cell.innerHTML = data
    row.appendChild(the_cell)
}

function muestraTodos(data){
    
    //let data = lista.data
    let the_father = document.querySelector("#tabla_movimientos")

    for (let i=0; i < data.length; i++){
        let the_row = document.createElement("tr")
        the_father.appendChild(the_row)

        appendCell(the_row,data[i].fecha)
        appendCell(the_row,data[i].hora)
        appendCell(the_row,data[i].from_moneda)
        appendCell(the_row,data[i].from_cantidad)
        appendCell(the_row,data[i].to_moneda)
        appendCell(the_row,data[i].to_cantidad)
    }
}

function validarCalculo(event){
    event.preventDefault()

    /*let fecha = document.querySelector("#fecha").value; esta es la primera opcion pero creo que no va a funcionar 
    porque no se donde va abuscar fecha, en lal de abajo que es la que creo mas viable y depsues abria que cambiar el 
    models/Movimiento, provar primeor con let y despes con var* y con la hora loi mismo */
    //let fecha = new Date(document.querySelector("#fecha").value)-----> esta es la que creo que va a funconar y la primera que probare si me hace flata validacion
    /* crear validador de fecha - por si cambian la hora del navegador para que no lo puedan trucar
    let fechaUltimoMovimiento = no se como meterlo aun (tiene que ser en formato iso para copder compararlo en el if)
    en teoria este debe estar en ISO porque el new Date nos lo va a devolver en iso, si no utilizar .toISOString(.slice(0,10))
    para transformarlo a ISO*****ojo***** con los formatos de fecha y hora que si no me lo coge y da fallo, revisar bn
    si hay que usarlo para la hora ****ojo**** que es tiene slice de 0 a 10 y seria de 10,a x(el que sea)
    aunque estas validaciones las tengo que meter aqui,porque....
    if (fecha < fechaUltimoMovimiento)
        alert("La fecha del sitema oprativo ha sido modificada, si desea continuar con la operacion restablezca la fecha")
        return
    */
    //let hora = document.querySelector("#hora").value;
    //let hora = new Date("1970-01-01T" + document.querySelector("#hora").value + "Z")-----------> sta es la que creo que va a funconar y la primera que probare si me hace flata validacion
    
    let fecha = new Date(document.querySelector("#fecha").value)

    let hora = new Date("1970-01-01T" + document.querySelector("#hora").value + "Z")
    let from_moneda = document.querySelector("#from_moneda").value
    let from_cantidad = document.querySelector("#from_cantidad").value
    if (from_cantidad < 0){
        alert("La cantidad ha de ser mayor a 0")
        return
    }
    let to_moneda = document.querySelector("#to_moneda").value
    
    guardarCalculo(fecha,hora,from_moneda,from_cantidad,to_moneda)
}

function convert_to_json(registro){
    return registro.json()
}

function process_error(error){
    alert("Se ha producido el error :" + error)
}

window.onload = function (){
/*
    fetch("meter la consulta a coinappio con los valores formatedos de validarCalculo")
        .then(convert_to_json)
        .then(all_movements)
        if (data.from_cantidad == precio_unitario*to_cantidad){
            alert("La cantidad from ha sido cambiada, vuelva a poner la cantidad inicial o vuelva a calcular para poder validar la compra")
            return
            }
        .catch(process_error)*/

 
    fetch("/api/v1/movimientos")
        .then(convert_to_json)
        .then(muestraTodos)
        .catch(process_error)
    

    

    let btnCompra = document.querySelector("#btnCompra")
    btnCompra.addEventListener("click", function(event){
        event.preventDefault()

        let formulario = document.querySelector("#tasa_intercambio")
        formulario.classList.remove("invisible")

        document.querySelector("#calcular").addEventListener("click",validarCalculo)
    })
}