const apiKey = '0d4e929879538d830372fe8b4467441a';
let saldo = parseFloat(localStorage.getItem('saldo')) || 1000.00;
let historial = JSON.parse(localStorage.getItem('historial')) || [];
let momioSeleccionado = 0;
let equipoSeleccionado = "";
let tipoTransaccion = "";

// Elementos UI
const saldoDisplay = document.getElementById('saldo-display');
const contenedor = document.getElementById('contenedor-apuestas');

function actualizarUI() {
    saldoDisplay.innerText = saldo.toFixed(2);
    localStorage.setItem('saldo', saldo);
    localStorage.setItem('historial', JSON.stringify(historial));
}

function registrarMovimiento(tipo, monto, detalle) {
    const fecha = new Date().toLocaleString('es-MX', { hour12: true });
    historial.unshift({ fecha, tipo, monto, detalle });
    actualizarUI();
}

async function filtrar(sportKey) {
    contenedor.innerHTML = "<div class='loader'>Consultando momios reales...</div>";
    try {
        const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?apiKey=${apiKey}&regions=us&markets=h2h&oddsFormat=american`;
        const res = await fetch(url);
        const eventos = await res.json();
        
        if (!eventos || eventos.length === 0) throw new Error();
        
        contenedor.innerHTML = "";
        eventos.forEach(ev => {
            const outcomes = ev.bookmakers[0].markets[0].outcomes;
            contenedor.innerHTML += `
                <div class="card">
                    <h4>${ev.home_team} vs ${ev.away_team}</h4>
                    <button class="momio-btn" onclick="abrirBoleto('${outcomes[0].name}', ${outcomes[0].price})">
                        <span>${outcomes[0].name}</span> <span>${outcomes[0].price > 0 ? '+' : ''}${outcomes[0].price}</span>
                    </button>
                    <button class="momio-btn" onclick="abrirBoleto('${outcomes[1].name}', ${outcomes[1].price})">
                        <span>${outcomes[1].name}</span> <span>${outcomes[1].price > 0 ? '+' : ''}${outcomes[1].price}</span>
                    </button>
                </div>`;
        });
    } catch (e) {
        contenedor.innerHTML = "<p>Usando datos de prueba (API desconectada)</p>";
        // Datos de respaldo automáticos
        const backup = [{home_team: 'América', away_team: 'Chivas', bookmakers: [{markets: [{outcomes: [{name: 'América', price: -110}, {name: 'Chivas', price: +150}]}]}]}];
        backup.forEach(ev => { /* Mismo bloque de renderizado de arriba */ });
    }
}

function abrirBoleto(equipo, momio) {
    momioSeleccionado = momio;
    equipoSeleccionado = equipo;
    document.getElementById('bet-slip').style.display = 'block';
    document.getElementById('bet-team').innerText = equipo;
    document.getElementById('bet-odds').innerText = momio > 0 ? '+' + momio : momio;
}

function calcularGanancia() {
    const monto = parseFloat(document.getElementById('monto').value) || 0;
    let ganancia = (momioSeleccionado > 0) ? (monto * (momioSeleccionado / 100)) : (monto / (Math.abs(momioSeleccionado) / 100));
    document.getElementById('total-win').innerText = '$' + (monto + ganancia).toFixed(2);
}

function confirmarApuesta() {
    const monto = parseFloat(document.getElementById('monto').value);
    if (monto > saldo) return alert("Saldo insuficiente");
    if (monto <= 0) return alert("Ingresa un monto válido");

    saldo -= monto;
    registrarMovimiento('apuesta', monto, `Apuesta: ${equipoSeleccionado}`);
    alert("¡Apuesta colocada con éxito!");
    cerrarBoleto();
}

// CAJERO Y PERFIL
function abrirCajero(tipo) {
    tipoTransaccion = tipo;
    document.getElementById('modal-cajero').style.display = 'block';
    document.getElementById('cajero-titulo').innerText = tipo === 'deposito' ? 'DEPOSITAR' : 'RETIRAR';
}

function procesarTransaccion() {
    const monto = parseFloat(document.getElementById('cajero-monto').value);
    if (monto <= 0) return;

    if (tipoTransaccion === 'deposito') {
        saldo += monto;
        registrarMovimiento('deposito', monto, 'Depósito manual');
    } else {
        if (monto > saldo) return alert("Saldo insuficiente");
        saldo -= monto;
        registrarMovimiento('retiro', monto, 'Retiro de fondos');
    }
    cerrarCajero();
}

function mostrarPerfil() {
    const lista = document.getElementById('lista-transacciones');
    document.getElementById('modal-perfil').style.display = 'block';
    lista.innerHTML = historial.map(i => `
        <div class="transaccion-item">
            <small>${i.fecha}</small>
            <strong>${i.tipo === 'deposito' ? '+' : '-'}$${i.monto.toFixed(2)}</strong>
        </div>`).join('');
}

function cerrarBoleto() { document.getElementById('bet-slip').style.display = 'none'; }
function cerrarCajero() { document.getElementById('modal-cajero').style.display = 'none'; }
function cerrarPerfil() { document.getElementById('modal-perfil').style.display = 'none'; }

// Inicializar
actualizarUI();
