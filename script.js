const apiKey = 'D40a414b7afc31212ba93838aee846b2'; 
const contenedor = document.getElementById('contenedor-apuestas');
const betSlip = document.getElementById('bet-slip');

// Función para obtener momios reales
async function filtrar(sportKey) {
    contenedor.innerHTML = `<p>Consultando eventos en vivo...</p>`;
    const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?apiKey=${apiKey}&regions=us&markets=h2h&oddsFormat=american`;

    try {
        const respuesta = await fetch(url);
        const eventos = await respuesta.json();

        if (eventos.length === 0) {
            contenedor.innerHTML = "<p>No hay partidos disponibles por ahora.</p>";
            return;
        }

        contenedor.innerHTML = "";
        eventos.forEach(evento => {
            const bookmaker = evento.bookmakers[0];
            if (!bookmaker) return;

            const outcomes = bookmaker.markets[0].outcomes;
            const home = outcomes.find(o => o.name === evento.home_team);
            const away = outcomes.find(o => o.name === evento.away_team);
            const draw = outcomes.find(o => o.name === 'Draw');

            contenedor.innerHTML += `
                <div class="card">
                    <h4>${evento.home_team} vs ${evento.away_team}</h4>
                    <button class="momio-btn" onclick="abrirBoleto('${evento.home_team}', ${home.price})">
                        <span>Local</span> <span>${home.price > 0 ? '+' + home.price : home.price}</span>
                    </button>
                    ${draw ? `<button class="momio-btn" onclick="abrirBoleto('Empate', ${draw.price})">
                        <span>Empate</span> <span>${draw.price > 0 ? '+' + draw.price : draw.price}</span>
                    </button>` : ''}
                    <button class="momio-btn" onclick="abrirBoleto('${evento.away_team}', ${away.price})">
                        <span>Visitante</span> <span>${away.price > 0 ? '+' + away.price : away.price}</span>
                    </button>
                </div>
            `;
        });
    } catch (e) {
        contenedor.innerHTML = "<p>Error al cargar datos. Verifica tu API Key.</p>";
    }
}

// Lógica del Boleto de Apuesta
let momioSeleccionado = 0;

function abrirBoleto(equipo, momio) {
    momioSeleccionado = momio;
    betSlip.style.display = 'block';
    document.getElementById('bet-team').innerText = equipo;
    document.getElementById('bet-odds').innerText = momio > 0 ? '+' + momio : momio;
    calcularGanancia();
}

function calcularGanancia() {
    const monto = document.getElementById('monto').value || 0;
    let ganancia = 0;

    if (momioSeleccionado > 0) {
        ganancia = monto * (momioSeleccionado / 100);
    } else {
        ganancia = monto / (Math.abs(momioSeleccionado) / 100);
    }
    
    document.getElementById('total-win').innerText = '$' + (parseFloat(monto) + parseFloat(ganancia)).toFixed(2);
}

function cerrarBoleto() {
    betSlip.style.display = 'none';
}
