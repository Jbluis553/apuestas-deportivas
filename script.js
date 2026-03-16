const apiKey = '0d4e929879538d830372fe8b4467441a';
let saldo = 1000.00;
let momioSeleccionado = 0;
let equipoSeleccionado = "";

const contenedor = document.getElementById('contenedor-apuestas');
const saldoDisplay = document.getElementById('saldo-display');

async function filtrar(sportKey) {
    contenedor.innerHTML = "<p>Cargando mercados...</p>";
    try {
        const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?apiKey=${apiKey}&regions=us&markets=h2h&oddsFormat=american`;
        const respuesta = await fetch(url);
        const eventos = await respuesta.json();
        
        if (!eventos || eventos.length === 0) throw new Error();
        renderizar(eventos);
    } catch (e) {
        // Datos de prueba estilo Novibet si falla la API
        const prueba = [
            {home_team: 'Real Madrid', away_team: 'Barcelona', bookmakers: [{markets: [{outcomes: [{name: 'Real Madrid', price: -110}, {name: 'Barcelona', price: +150}]}]}]},
            {home_team: 'Lakers', away_team: 'Nets', bookmakers: [{markets: [{outcomes: [{name: 'Lakers', price: +120}, {name: 'Nets', price: -140}]}]}]}
        ];
        renderizar(prueba);
    }
}

function renderizar(eventos) {
    contenedor.innerHTML = "";
    eventos.slice(0, 10).forEach(evento => {
        const outcomes = evento.bookmakers[0].markets[0].outcomes;
        contenedor.innerHTML += `
            <div class="card">
                <h4>${evento.home_team} vs ${evento.away_team}</h4>
                <button class="momio-btn" onclick="abrirBoleto('${outcomes[0].name}', ${outcomes[0].price})">
                    <span>${outcomes[0].name}</span> <span>${outcomes[0].price > 0 ? '+' + outcomes[0].price : outcomes[0].price}</span>
                </button>
                <button class="momio-btn" onclick="abrirBoleto('${outcomes[1].name}', ${outcomes[1].price})">
                    <span>${outcomes[1].name}</span> <span>${outcomes[1].price > 0 ? '+' + outcomes[1].price : outcomes[1].price}</span>
                </button>
            </div>`;
    });
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
    if (monto > saldo) {
        alert("Saldo insuficiente");
    } else if (monto > 0) {
        saldo -= monto;
        saldoDisplay.innerText = saldo.toFixed(2);
        alert(`Apuesta colocada: $${monto} al equipo ${equipoSeleccionado}. ¡Buena suerte!`);
        cerrarBoleto();
    }
}

function cerrarBoleto() {
    document.getElementById('bet-slip').style.display = 'none';
}
