

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

function validarCalculo(event){
    event.preventDefault()

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