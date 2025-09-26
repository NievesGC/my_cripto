// ==================== VARIABLES GLOBALES ====================
let savedExchangeRate = null;
let savedWalletData = null;
let buyFormVisible = false;
let statusFormVisible = false;

// ==================== CONFIGURACIÓN ====================
const SELECTORS = {
    // Tablas
    movementsTable: 'movements-table',
    statusTable: '#status-table',
    
    // Formularios
    exchangeForm: '#exchange-form',
    statusContainer: '#status-container',
    displayContainer: 'display-container',
    
    // Inputs
    fromCurrency: '#from-currency',
    fromAmount: '#from-amount',
    toCurrency: '#to-currency',
    toAmount: '#to-amount',
    
    // Botones
    buyBtn: '#buy-btn',
    closeBtn: '#close-btn',
    calculateBtn: '#calculate-btn',
    submitBtn: '#submit',
    statusBtn: '#status-btn',
    recalculateBtn: '#recalculate'
};

const API_URLS = {
    movements: '/api/v1/movements',
    movement: '/api/v1/movement',
    status: '/api/v1/status',
    exchangeRate: (from, to, amount) => `/api/v1/tasa/${from}/${to}?from_cantidad=${amount}`
};

// ==================== FUNCIONES DE UTILIDAD ====================
function getElement(selector) {
    return document.querySelector(selector);
}

function showError(message) {
    alert("Error: " + message);
}

function showSuccess(message) {
    alert(message);
}

function convertToJson(response) {
    return response.json();
}

function getCurrentDateTime() {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${minutes}`;
    return { date, time };
}

function deleteRate(){
    const fromCurrencyShow = getElement(SELECTORS.fromCurrency).value="";
    const fromAmountShow = getElement(SELECTORS.fromAmount).value="";
    const toCurrencyShow = getElement(SELECTORS.toCurrency).value=""; 
    const resultAmount = document.getElementById("to-amount").innerText="Cantidad:"; 
    const resultUnitPrice = document.getElementById("unit_price").innerText="";
}

// ==================== FUNCIONES DE VALIDACIÓN ====================
function validateAmount(amount) {
    if (!amount || amount === "") {
        showError("Por favor introduzca cantidad.");
        return false;
    }
    if (isNaN(amount)) {
        showError("La cantidad debe ser un número válido.");
        return false;
    }
    if (parseFloat(amount) <= 0) {
        showError("La cantidad sebe ser superior a 0.");
        return false;
    }
    return true;
}

// ==================== FUNCIONES DE RENDERIZADO ====================
function createTableCell(content) {
    const cell = document.createElement("td");
    cell.innerHTML = content;
    return cell;
}


function displayMovements(data) {
    const table = document.getElementById(SELECTORS.movementsTable);
    table.innerHTML = "";

    if (data.status === "success"){
        for (let i=0; i < data.data.length; i++){ 
            const row = document.createElement("tr");
            
            // Agregar cada celda
            row.appendChild(createTableCell(data.data[i].fecha));
            row.appendChild(createTableCell(data.data[i].hora));
            row.appendChild(createTableCell(data.data[i].from_moneda));
            row.appendChild(createTableCell(data.data[i].from_cantidad));
            row.appendChild(createTableCell(data.data[i].to_moneda));
            row.appendChild(createTableCell(data.data[i].to_cantidad));
            
            table.appendChild(row);   
        }    
    } else {
        alert( data.mensaje) /*  si  va -- pero no saca data.mensaje  */
    }
     
      
}

function displayExchangeRate(exchangeRate) {
    if (exchangeRate.status === "success") { 
        const container = document.getElementById(SELECTORS.displayContainer);
        container.innerHTML = "";
        
        const rateValue = parseFloat(exchangeRate.rate.rate);
        const unitPrice = parseFloat(exchangeRate.rate.precio_unitario);
        
        // Crear elementos para mostrar el resultado
        const amountElement = document.createElement("p");
        amountElement.id = "to-amount";
        amountElement.innerHTML = rateValue.toFixed(5);
        
        const priceElement = document.createElement("p");
        priceElement.id = "unit_price";
        priceElement.innerHTML = "Precio unitario: " + unitPrice.toFixed(5);
        
        container.appendChild(amountElement);
        container.appendChild(priceElement);
            
    }else{
        showError(exchangeRate.mensaje);
    } 
}

function displayWalletStatus(wallet) {
    if (wallet.status === "success") {
        // Mostrar tabla de monedas
        const table = getElement(SELECTORS.statusTable);
        table.innerHTML = "";

        for (const currency in wallet.data.wallet) {
            if (currency !== "EUR") {
                const row = document.createElement("tr");
                row.appendChild(createTableCell(wallet.data.wallet[currency].balance));
                row.appendChild(createTableCell(currency));
                row.appendChild(createTableCell(wallet.data.wallet[currency].valor));
                table.appendChild(row);
            }
        }

        // Mostrar valores de resumen
        displaySummaryValue('#valor_actual', wallet.data.actual_value);
        displaySummaryValue('#precio', wallet.data.price);
        displaySummaryValue('#resultado', wallet.data.actual_value + wallet.data.price);
        
        savedWalletData = wallet;
        
    }else{
        showError(wallet.mensaje);
    }
}

function displaySummaryValue(selector, value) {
    const container = getElement(selector);
    container.innerHTML = "";
    const span = document.createElement("span");
    span.innerHTML = value;
    container.appendChild(span);
}



function calculateExchangeRate() {
    const fromCurrency = getElement(SELECTORS.fromCurrency).value;
    const fromAmount = getElement(SELECTORS.fromAmount).value;
    const toCurrency = getElement(SELECTORS.toCurrency).value;
    
    // Validar entrada
    if (!validateAmount(fromAmount)) {
        return;
    }
    
    // Hacer petición a la API
    const url = API_URLS.exchangeRate(fromCurrency, toCurrency, fromAmount);
    
    fetch(url)
        .then(convertToJson)
        .then(function(exchangeRate) {
            savedExchangeRate = exchangeRate;
            displayExchangeRate(exchangeRate);
            getElement(SELECTORS.submitBtn).disabled = false;
        })
        .catch(function(error) {
            showError(error.message);
        });
}

function executeTransaction() {
    if (!savedExchangeRate) {
        showError("Por favor, calcula antes de la compra");
        return;
    }

    // Verificar saldo suficiente
    const fromCurrency = savedExchangeRate.rate.from_moneda;
    const hasSufficientBalance = savedExchangeRate.monedas.includes(fromCurrency) || fromCurrency === 'EUR';
    
    if (!hasSufficientBalance) {
        showError("Saldo insuficiente");
        return;
    }

    // Preparar datos del movimiento
    const { date, time } = getCurrentDateTime();
    const movementData = {
        fecha: date,
        hora: time,
        from_moneda: savedExchangeRate.rate.from_moneda,
        from_cantidad: savedExchangeRate.rate.from_cantidad,
        to_moneda: savedExchangeRate.rate.to_moneda,
        to_cantidad: getElement(SELECTORS.toAmount).textContent,
        from_cantidad_actual: getElement(SELECTORS.fromAmount).value
    };

    // Enviar a la API
    const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(movementData)
    };

    fetch(API_URLS.movement, options)
        .then(convertToJson)
        .then(function(response) {
            const result = response[0];
            if (result && result.status === "success") {
                showSuccess(result.mensaje || "La compra se ha realizado correctamente. ");
                loadMovements(); // Recargar movimientos
            } else {
                showError(result.mensaje);
            }
        })
        .catch(function(error) {
            showError("Error: en executeTransaction " + error.message);
        });
}


function loadMovements() {
    fetch("/api/v1/movements")
        .then(convertToJson)
        .then(displayMovements)
        .catch(function(error) {
            showError("Failedm en el fetch movements: " + error.message);
        });
}

function loadWalletStatus() {
    fetch(API_URLS.status)
        .then(convertToJson)
        .then(displayWalletStatus)
        .catch(function(error) {
            showError("Failed to load wallet status: " + error.message);
        });
}
// ==================== FUNCIONES DE UI ====================
function toggleFormVisibility(formSelector) {
    const form = getElement(formSelector);
    form.classList.toggle("invisible");
    return !form.classList.contains("invisible");
}

function hideForm(formSelector) {
    getElement(formSelector).classList.add("invisible");
}

function showForm(formSelector) {
    getElement(formSelector).classList.remove("invisible");
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Botón de compra - mostrar/ocultar formulario
    getElement(SELECTORS.buyBtn).addEventListener("click", function(event) {
        event.preventDefault();
        buyFormVisible = toggleFormVisibility(SELECTORS.exchangeForm);
    });

    // Botón cerrar formulario
    getElement(SELECTORS.closeBtn).addEventListener("click", function(event) {
        event.preventDefault();
        hideForm(SELECTORS.exchangeForm);
        deleteRate();
        buyFormVisible = false;
    });

    // Botón calcular tipo de cambio
    getElement(SELECTORS.calculateBtn).addEventListener("click", function(event) {
        event.preventDefault();
        calculateExchangeRate();
    });

    // Cambios en selects de moneda - deshabilitar botón submit
    getElement(SELECTORS.fromCurrency).addEventListener("change", function() {
        getElement(SELECTORS.submitBtn).disabled = true;
    });
    
    getElement(SELECTORS.toCurrency).addEventListener("change", function() {
        getElement(SELECTORS.submitBtn).disabled = true;
    });

    // Botón ejecutar transacción
    getElement(SELECTORS.submitBtn).addEventListener("click", function(event) {
        event.preventDefault();
        confirm("¿Quiere realizar compra?");
        if(confirm){
            executeTransaction();
            deleteRate();
        }
        

    });

    // Botón estado de inversión
    getElement(SELECTORS.statusBtn).addEventListener("click", function(event) {
        event.preventDefault();
        
        if (!statusFormVisible) {
            showForm(SELECTORS.statusContainer);
            loadWalletStatus();
            statusFormVisible = true;
        } else {
            hideForm(SELECTORS.statusContainer);
            statusFormVisible = false;
        }
    });

    // Botón recalcular estado
    getElement(SELECTORS.recalculateBtn).addEventListener("click", function(event) {
        event.preventDefault();
        loadWalletStatus();
    });
}

// ==================== INICIALIZACIÓN ====================
window.onload = function() {
    // Cargar movimientos iniciales
    loadMovements();
    
    // Configurar todos los event listeners
    setupEventListeners();
    
    console.log("Crypto Exchange App loaded successfully");
};
