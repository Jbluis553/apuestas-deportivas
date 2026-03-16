const apiKey = '0d4e929879538d830372fe8b4467441a'; 
const contenedor = document.getElementById('contenedor-apuestas');
const betSlip = document.getElementById('bet-slip');

let momioSeleccionado = 0;

async function filtrar(sportKey) {
    contenedor.innerHTML = "<p>Cargando momios reales (usando puente de seguridad)...</p>";
    
    // Usamos un proxy para evitar el error de bloqueo del navegador
    const proxy = 'https://api.allorigins.win/get?url=';
    const apiUrl = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?apiKey=${apiKey}&regions=us&markets=h2h&oddsFormat=american`;
    
    try {
        const respuesta = await fetch(proxy + encodeURIComponent(apiUrl));
        const data = await respuesta.json();
        
        // El proxy devuelve la info dentro de data.contents
        const eventos = JSON.parse(data.contents);

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
        console.error(error);
        contenedor.innerHTML = "<p>Error de conexión. Intenta de nuevo en un momento.</p>";
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
        alert("¡Apuesta confirmada! Suerte.");
        cerrarBoleto();
    } else {
        alert("Por favor ingresa un monto.");
    }
}

function cerrarBoleto() {
    betSlip.style.display = 'none';
}
