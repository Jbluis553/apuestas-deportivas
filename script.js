const apiKey = '0d4e929879538d830372fe8b4467441a'; 
const contenedor = document.getElementById('contenedor-apuestas');
const betSlip = document.getElementById('bet-slip');

let momioSeleccionado = 0;

async function filtrar(sportKey) {
    contenedor.innerHTML = "<p>Cargando momios reales...</p>";
    
    try {
        const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?apiKey=${apiKey}&regions=us&markets=h2h&oddsFormat=american`;
        const respuesta = await fetch(url);
        const eventos = await respuesta.json();

        if (!eventos || eventos.length === 0) {
            contenedor.innerHTML = "<p>No hay partidos disponibles para esta liga ahora.</p>";
            return;
        }

        contenedor.innerHTML = ""; 
        eventos.forEach(evento => {
            const bookmaker = evento.bookmakers[0];
            if (!bookmaker) return;

            const outcomes = bookmaker.markets[0].outcomes;
            const home = outcomes.find(o => o.name === evento.home_team);
            const away = outcomes.find(o => o.name === evento.away_team);

            contenedor.innerHTML += `
                <div class="card">
                    <h4>${evento.home_team} vs ${evento.away_team}</h4>
                    <button class="momio-btn" onclick="abrirBoleto('${evento.home_team}', ${home.price})">
                        <span>Local</span> <span>${home.price > 0 ? '+' + home.price : home.price}</span>
                    </button>
                    <button class="momio-btn" onclick="abrirBoleto('${evento.away_team}', ${away.price})">
                        <span>Visitante</span> <span>${away.price > 0 ? '+' + away.price : away.price}</span>
                    </button>
                </div>
            `;
        });
    } catch (error) {
        contenedor.innerHTML = "<p>Error: Revisa tu conexión o el límite de tu API Key.</p>";
    }
}

function abrirBoleto(equipo, momio) {
    momioSeleccionado = momio;
    betSlip.style.display = 'block';
    document.getElementById('bet-team').innerText = equipo;
    document.getElementById('bet-odds').innerText = momio > 0 ? '+' + momio : momio;
    document.getElementById('monto').value = "";
    document.getElementById('total-win').innerText = "$0.00";
}

function calcularGanancia() {
    const monto = parseFloat(document.getElementById('monto').value) || 0;
    let ganancia = 0;

    if (momioSeleccionado > 0) {
        ganancia = monto * (momioSeleccionado / 100);
    } else {
        ganancia = monto / (Math.abs(momioSeleccionado) / 100);
    }
    
    document.getElementById('total-win').innerText = '$' + (monto + ganancia).toFixed(2);
}

function confirmarApuesta() {
    const monto = document.getElementById('monto').value;
    if(monto > 0) {
        alert("¡Apuesta confirmada! Suerte, Jose Luis.");
        cerrarBoleto();
    } else {
        alert("Por favor ingresa un monto.");
    }
}

function cerrarBoleto() {
    betSlip.style.display = 'none';
}
