let saveRate;
let saveWallet;

function appendCell(row,data){
    let the_cell = document.createElement("td")
    the_cell.innerHTML = data
    row.appendChild(the_cell)
}

function muestraTodos(data){
    if (data.status == "sucess"){
        let the_father = document.querySelector("#tabla_movimientos")
        the_father.innerHTML=""

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
    } else {
        alert("Se a producido el error: " + data.mensaje)
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
    

    
    fetch(`/api/v1/tasa/${f_moneda}/${t_moneda}?from_cantidad=${f_cantidad}`)
        .then(convert_to_json)
        .then(function (rate) {  
            saveRate = rate          
            muestraConsulta(rate)
        })
        .catch(process_error);
        
}

function muestraConsulta(rate){
    return new Promise(function (resolve, reject){
        if (rate.status == "sucess"){
            let the_father = document.querySelector("#to_moneda_muestra");
            the_father.innerHTML=""
            
            let pCantidadTo = document.createElement("p");
            pCantidadTo.id = "to_cantidad";
        
            let pPrecioUnitario = document.createElement("p");
            pPrecioUnitario.id = "precio_unitario";
        
            rate_num = parseFloat(rate.rate.rate);
            let precioUnitario = parseFloat(rate.rate.precio_unitario);
        
            pCantidadTo.innerHTML =  rate_num.toFixed(10);
            pPrecioUnitario.innerHTML =  precioUnitario.toFixed(10);
            
            the_father.appendChild(pCantidadTo);
            the_father.appendChild(pPrecioUnitario);
            
            resolve(rate)
        } else{
            alert("Se ha prodcido el error:" + rate.mensaje);
            reject("Error en la consulta");
        }
    });
}

function guardarMovimiento(rate){
    let fecha = new Date().toISOString().slice(0,10);
    let fechaHora = new Date()
    let horas = fechaHora.getHours();
    let minutos = fechaHora.getMinutes();
    let hora =`${horas}:${minutos}`;
    let from_moneda = document.querySelector("#from_moneda").value;
    let from_cantidad_actual = document.querySelector("#from_cantidad").value;
    let to_moneda = document.querySelector("#to_moneda").value;
    let to_cantidad = document.querySelector("#to_cantidad").textContent;
    let from_cantidad = JSON.stringify(rate.rate.from_cantidad);

    let data = {"fecha": fecha,
                "hora": hora,
                "from_moneda": from_moneda,
                "from_cantidad": from_cantidad,
                "to_moneda": to_moneda,
                "to_cantidad": to_cantidad,
                "from_cantidad_actual": from_cantidad_actual}
            
    let options = {
        body: JSON.stringify(data),
        method:"POST",
        headers: {
            "Content-Type":"application/json"
        }
    };
    
    if (rate.monedas[0].includes(rate.rate.from_moneda) || rate.rate.from_moneda == 'EUR' ){
        fetch("/api/v1/movimiento",options)
            .then(convert_to_json)
            .then(inserta)
            .catch(process_error)
    }else{
        alert("Saldo insuficiente")
    }
        
            
}

function inserta(respuesta){

    let resp = respuesta[0]
    if (resp && resp.status === "sucess"){
        alert(resp.mensaje)
        fetch("/api/v1/movimientos")
        .then(convert_to_json)
        .then(muestraTodos)
        .catch(process_error) 
    } else {
        alert(resp.mensaje)
    }

      
}

function muestraStatus(wallet){

    if (wallet.status == "sucess"){
        //muestra la tabla de saldos
        let the_father = document.querySelector("#tabla_estado_inversion")
        the_father.innerHTML = ""

        for (divisa in  wallet.data.wallet) {
            let the_row = document.createElement("tr")
            the_father.appendChild(the_row)
            appendCell(the_row,wallet.data.wallet[divisa].balance)
            appendCell(the_row,divisa)
            appendCell(the_row,wallet.data.wallet[divisa].valor)
        }
        //muesta valor actual

        let the_father_va = document.querySelector("#valor_actual")
        the_father_va.innerHTML = ""
        let spanValor = document.createElement("span")
        let valorActual = wallet.data.actual_value
        spanValor.innerHTML = valorActual
        the_father_va.appendChild(spanValor)
        //the_father_va.firstChild.textContent = "Valor actual: "
        
        // muesta precio
        let the_father_pre = document.querySelector("#precio")
        the_father_pre.innerHTML = ""
        let spanPrecio = document.createElement("span")
        let precio = wallet.data.price
        spanPrecio.innerHTML = precio
        the_father_pre.appendChild(spanPrecio)
        //the_father_pre.firstChild.textContent = "Precio: "

        // muesta resultado
        let the_father_re = document.querySelector("#resultado")
        the_father_re.innerHTML = ""
        let spanResultado = document.createElement("span")
        let resultado = (wallet.data.actual_value + wallet.data.price)
        spanResultado.innerHTML = resultado
        the_father_re.appendChild(spanResultado)
        //the_father_re.firstChild.textContent = "Resultado: "
        saveWallet = wallet
    }else{
        alert("Se ha producido el error: " + wallet.mensaje)
    }
        
        
}
    
    
    


window.onload = function(){

    fetch("/api/v1/movimientos")
        .then(convert_to_json)
        .then(muestraTodos)
        .catch(process_error)

    
    

    let btnCompra = document.querySelector("#btnCompra")
    let contadorCompra = 0
    btnCompra.addEventListener("click", function(event){
        event.preventDefault()

        if (contadorCompra == 0){
            let formulario = document.querySelector("#tasa_intercambio")
            formulario.classList.remove("invisible")

        let btnCalcular =document.querySelector("#calcular")
            btnCalcular.addEventListener("click",function(event){
            event.preventDefault();
            consulta();
            
        })
            
        let btnAceptar = document.querySelector("#submit");
            btnAceptar.addEventListener("click", function (event) {
            event.preventDefault();
            guardarMovimiento(saveRate);
        })
        contadorCompra = 1

        }else if (contadorCompra==1){
            document.querySelector("#tasa_intercambio").classList.add("invisible")
            contadorCompra = 0
        }
        
        let btnCerrar =document.querySelector("#cerrar")
        btnCerrar.addEventListener("click", function(event){
            event.preventDefault()
            document.querySelector("#tasa_intercambio").classList.add("invisible")
            contadorCompra = 0
        })


        }  
        
        
    )
    
    
    let btnStatus = document.querySelector("#btnStatus")
    btnStatus.addEventListener("click", function(event){
        event.preventDefault();
        let formularioStatus = document.querySelector("#estado_inversion")
        formularioStatus.classList.remove("invisible")
        fetch("/api/v1/status")
            .then(convert_to_json)
            .then(muestraStatus)
            .catch(process_error)
        
            
            


    })

    
    let btnRecalcular = document.querySelector("#recalcular");
    btnRecalcular.addEventListener("click",function(event){
        event.preventDefault();
        
        //formularioStatus = document.querySelector("#estado_inversion")
        fetch("/api/v1/status")
            .then(convert_to_json)
            .then(muestraStatus)
            .catch(process_error)             
    })
}