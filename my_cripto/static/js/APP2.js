/* // ==================== VARIABLES GLOBALES ====================
let savedExchangeRate = null;
let savedWalletData = null;
let buyFormVisible = false;
let statusFormVisible = false;

// ==================== CONFIGURACIÓN ====================
const SELECTORS = {
    // Tablas
    movementsTable: '#tabla_movimientos',
    statusTable: '#tabla_estado_inversion',
    
    // Formularios
    exchangeForm: '#tasa_intercambio',
    statusContainer: '#estado_inversion',
    displayContainer: '#to_moneda_muestra',
    
    // Inputs
    fromCurrency: '#from_moneda',
    fromAmount: '#from_cantidad',
    toCurrency: '#to_moneda',
    toAmount: '#to_cantidad',
    
    // Botones
    buyBtn: '#btnCompra',
    closeBtn: '#cerrar',
    calculateBtn: '#calcular',
    submitBtn: '#submit',
    statusBtn: '#btnStatus',
    recalculateBtn: '#recalcular'
};

const API_URLS = {
    movements: '/api/v1/movimientos',
    movement: '/api/v1/movimiento',
    status: '/api/v1/status',
    exchangeRate: (from, to, amount) => `/api/v1/tasa/${from}/${to}?from_cantidad=${amount}`
};

// ==================== FUNCIONES DE UTILIDAD ====================
function getElement(selector) {
    return document.querySelector(selector);
}

function showError(message) {
    alert("❌ Error: " + message);
}

function showSuccess(message) {
    alert("✅ " + message);
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

// ==================== FUNCIONES DE VALIDACIÓN ====================
function validateAmount(amount) {
    if (!amount || amount.trim() === '') {
        showError("Please enter an amount");
        return false;
    }
    if (isNaN(amount)) {
        showError("Amount must be a valid number");
        return false;
    }
    if (parseFloat(amount) <= 0) {
        showError("Amount must be greater than 0");
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
    const table = getElement(SELECTORS.movementsTable);
    table.innerHTML = "";

    if (data.status === "success" && data.data && data.data.length > 0) {
        data.data.forEach(movement => {
            const row = document.createElement("tr");
            
            // Agregar cada celda
            row.appendChild(createTableCell(movement.fecha));
            row.appendChild(createTableCell(movement.hora));
            row.appendChild(createTableCell(movement.from_moneda));
            row.appendChild(createTableCell(movement.from_cantidad));
            row.appendChild(createTableCell(movement.to_moneda));
            row.appendChild(createTableCell(movement.to_cantidad));
            
            table.appendChild(row);
        });
    } else {
        // Mostrar mensaje si no hay datos
        const row = document.createElement("tr");
        const cell = createTableCell("No movements found");
        cell.setAttribute("colspan", "6");
        row.appendChild(cell);
        table.appendChild(row);
    }
}

function displayExchangeRate(exchangeRate) {
    if (exchangeRate.status !== "success") {
        showError(exchangeRate.mensaje || "Exchange rate calculation failed");
        return;
    }

    const container = getElement(SELECTORS.displayContainer);
    container.innerHTML = "";
    
    const rateValue = parseFloat(exchangeRate.rate.rate);
    const unitPrice = parseFloat(exchangeRate.rate.precio_unitario);
    
    // Crear elementos para mostrar el resultado
    const amountElement = document.createElement("p");
    amountElement.id = "to_cantidad";
    amountElement.innerHTML = rateValue.toFixed(5);
    
    const priceElement = document.createElement("p");
    priceElement.id = "unit_price";
    priceElement.innerHTML = "Precio unitario: " + unitPrice.toFixed(5);
    
    container.appendChild(amountElement);
    container.appendChild(priceElement);
}

function displayWalletStatus(wallet) {
    if (wallet.status !== "success") {
        showError(wallet.mensaje || "Failed to load wallet status");
        return;
    }

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
}

function displaySummaryValue(selector, value) {
    const container = getElement(selector);
    container.innerHTML = "";
    const span = document.createElement("span");
    span.innerHTML = value;
    container.appendChild(span);
}

// ==================== FUNCIONES DE NEGOCIO ====================
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
            showError("Error: " + error.message);
        });
}

function executeTransaction() {
    if (!savedExchangeRate) {
        showError("Please calculate the conversion before purchasing");
        return;
    }

    // Verificar saldo suficiente
    const fromCurrency = savedExchangeRate.rate.from_moneda;
    const hasSufficientBalance = savedExchangeRate.monedas[0].includes(fromCurrency) || fromCurrency === 'EUR';
    
    if (!hasSufficientBalance) {
        showError("Insufficient balance");
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
                showSuccess(result.mensaje || "Transaction completed successfully");
                loadMovements(); // Recargar movimientos
            } else {
                showError(result.mensaje || "Transaction failed");
            }
        })
        .catch(function(error) {
            showError("Transaction failed: " + error.message);
        });
}

function loadMovements() {
    fetch(API_URLS.movements)
        .then(convertToJson)
        .then(displayMovements)
        .catch(function(error) {
            showError("Failed to load movements: " + error.message);
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
        executeTransaction();
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
}; */