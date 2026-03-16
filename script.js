const contenedor = document.getElementById('contenedor-apuestas');

function filtrar(liga) {
    contenedor.innerHTML = `<h3>Mostrando eventos de: ${liga}</h3>`;
    // Aquí conectarás tu API Key más adelante
    const ejemploEvento = `
        <div class="card">
            <p>América vs Chivas</p>
            <p class="momio">Local: +120 | Empate: +250 | Visitante: -110</p>
            <button>Apostar</button>
        </div>
    `;
    contenedor.innerHTML += ejemploEvento;
}
