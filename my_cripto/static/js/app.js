var pet_todos = new XMLHttpRequest()

function appendCell(row,data){
    let the_cell = document.createElement("td")
    the_cell.innerHTML = data
    row.appendChild(the_cell)
}

function muestraTodos(){
    let pedido = this.responseText
    let lista = JSON.parse(pedido)
    let data = lista.data
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

window.onload = function (){
    pet_todos.open("GET","/api/v1/movimientos")
    pet_todos.addEventListener("load", muestraTodos)

    pet_todos.send()
}