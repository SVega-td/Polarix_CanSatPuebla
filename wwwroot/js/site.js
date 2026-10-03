// ============================================================
//  CONFIGURACIÓN
// ============================================================
const MAX_DATA_POINTS = 150;
const SCIENTIFIC_DECIMALS = 4;

// ============================================================
//  ESTADO
// ============================================================
let dataHistory = [];
let packetCount = 0;
let isConnected = false;

// ============================================================
//  REFERENCIAS A GRÁFICOS
// ============================================================
const ctxAlt = document.getElementById('altChart').getContext('2d');
const ctxTemp = document.getElementById('tempChart').getContext('2d');
const ctxSpeed = document.getElementById('speedChart').getContext('2d');
const ctxVib = document.getElementById('vibChart').getContext('2d');

// ============================================================
//  CREAR GRÁFICOS CON CHART.JS
// ============================================================
function createChart(ctx, label, color, borderColor, yLabel) {
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: label,
                data: [],
                borderColor: borderColor || color,
                backgroundColor: color + '33',
                fill: true,
                tension: 0.3,
                pointRadius: 0,
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#7a8ba3', font: { size: 11 } }
                }
            },
            scales: {
                x: {
                    grid: { color: '#1a253a' },
                    ticks: { color: '#5a6f8a', font: { size: 10 } },
                    title: { display: true, text: 'Tiempo (s)', color: '#7a8ba3' }
                },
                y: {
                    grid: { color: '#1a253a' },
                    ticks: { color: '#5a6f8a', font: { size: 10 } },
                    title: { display: true, text: yLabel || label, color: '#7a8ba3' }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

const altChart = createChart(ctxAlt, 'Altitud (m)', '#5bc0eb', '#5bc0eb', 'Altitud (m)');
const tempChart = createChart(ctxTemp, 'Temperatura (°C)', '#ff6b6b', '#ff6b6b', 'Temperatura (°C)');
const speedChart = createChart(ctxSpeed, 'Velocidad (m/s)', '#a29bfe', '#a29bfe', 'Velocidad (m/s)');
const vibChart = createChart(ctxVib, 'Vibración (m/s²)', '#ffb142', '#ffb142', 'Vibración (m/s²)');

// ============================================================
//  FUNCIONES AUXILIARES
// ============================================================
function toScientific(value) {
    if (value === undefined || value === null || isNaN(value)) return '--';
    return Number(value).toExponential(SCIENTIFIC_DECIMALS);
}

function formatTime(seconds) {
    if (seconds === undefined || seconds === null) return '--';
    return seconds.toFixed(2);
}

function formatGPS(lat, lon) {
    if (lat === undefined || lon === undefined || lat === null || lon === null) return '--';
    return lat.toFixed(6) + ', ' + lon.toFixed(6);
}

function getStatusIcon(value, threshold) {
    if (value === undefined || value === null) return '⏳';
    return value > threshold ? '🟢' : '🟡';
}

// ============================================================
//  ACTUALIZAR INTERFAZ
// ============================================================
function updateDashboard(data) {
    document.getElementById('tempValue').textContent = data.temp?.toFixed(2) ?? '--';
    document.getElementById('tempSci').textContent = toScientific(data.temp);

    document.getElementById('humValue').textContent = data.hum?.toFixed(2) ?? '--';
    document.getElementById('humSci').textContent = toScientific(data.hum);

    document.getElementById('presValue').textContent = data.pressure?.toFixed(2) ?? '--';
    document.getElementById('presSci').textContent = toScientific(data.pressure);

    document.getElementById('altValue').textContent = data.alt?.toFixed(2) ?? '--';
    document.getElementById('altSci').textContent = toScientific(data.alt);

    document.getElementById('speedValue').textContent = data.speed?.toFixed(2) ?? '--';
    document.getElementById('speedSci').textContent = toScientific(data.speed);

    document.getElementById('accelValue').textContent = data.accel?.toFixed(2) ?? '--';
    document.getElementById('accelSci').textContent = toScientific(data.accel);

    document.getElementById('vibValue').textContent = data.vib?.toFixed(2) ?? '--';
    document.getElementById('vibSci').textContent = toScientific(data.vib);

    document.getElementById('gpsValue').textContent = formatGPS(data.lat, data.lon);

    document.getElementById('packetCounter').innerHTML = `<strong>Paquetes:</strong> ${packetCount}`;
    document.getElementById('lastUpdate').innerHTML = `<strong>Última:</strong> ${new Date().toLocaleTimeString()}`;
}

function updateTable(data) {
    const tbody = document.getElementById('tableBody');
    const row = document.createElement('tr');

    const idx = dataHistory.length;
    const status = (data.alt > 50) ? '🟢 Descenso' : (data.alt > 10 ? '🟡 Apertura' : '🔴 Aterrizaje');

    row.innerHTML = `
        <td>${idx}</td>
        <td>${formatTime(data.time)}</td>
        <td>${data.alt?.toFixed(2) ?? '--'}</td>
        <td>${data.temp?.toFixed(2) ?? '--'}</td>
        <td>${data.hum?.toFixed(2) ?? '--'}</td>
        <td>${data.pressure?.toFixed(2) ?? '--'}</td>
        <td>${data.speed?.toFixed(2) ?? '--'}</td>
        <td>${data.accel?.toFixed(2) ?? '--'}</td>
        <td>${data.vib?.toFixed(2) ?? '--'}</td>
        <td style="font-size:11px;">${formatGPS(data.lat, data.lon)}</td>
        <td>${status}</td>
    `;

    tbody.prepend(row);

    while (tbody.children.length > MAX_DATA_POINTS) {
        tbody.removeChild(tbody.lastChild);
    }

    document.getElementById('rowCount').textContent = `${dataHistory.length} registros`;
}

function updateCharts(data) {
    const timeLabel = data.time ? data.time.toFixed(2) : "0.00";

    // Altitud
    altChart.data.labels.push(timeLabel);
    altChart.data.datasets[0].data.push(data.alt ?? 0);
    if (altChart.data.labels.length > MAX_DATA_POINTS) {
        altChart.data.labels.shift();
        altChart.data.datasets[0].data.shift();
    }
    altChart.update('none');

    // Temperatura
    tempChart.data.labels.push(timeLabel);
    tempChart.data.datasets[0].data.push(data.temp ?? 0);
    if (tempChart.data.labels.length > MAX_DATA_POINTS) {
        tempChart.data.labels.shift();
        tempChart.data.datasets[0].data.shift();
    }
    tempChart.update('none');

    // Velocidad
    speedChart.data.labels.push(timeLabel);
    speedChart.data.datasets[0].data.push(data.speed ?? 0);
    if (speedChart.data.labels.length > MAX_DATA_POINTS) {
        speedChart.data.labels.shift();
        speedChart.data.datasets[0].data.shift();
    }
    speedChart.update('none');

    // Vibración
    vibChart.data.labels.push(timeLabel);
    vibChart.data.datasets[0].data.push(data.vib ?? 0);
    if (vibChart.data.labels.length > MAX_DATA_POINTS) {
        vibChart.data.labels.shift();
        vibChart.data.datasets[0].data.shift();
    }
    vibChart.update('none');
}

// ============================================================
//  PROCESAR NUEVO DATO
// ============================================================
function processData(data) {
    packetCount++;

    if (!data.time) {
        data.time = dataHistory.length > 0 ?
            dataHistory[dataHistory.length - 1].time + 0.1 :
            0;
    }

    dataHistory.push(data);
    if (dataHistory.length > MAX_DATA_POINTS * 2) {
        dataHistory = dataHistory.slice(-MAX_DATA_POINTS);
    }

    updateDashboard(data);
    updateTable(data);
    updateCharts(data);

    if (!isConnected) {
        isConnected = true;
        document.getElementById('statusLed').className = 'led';
        document.getElementById('connectionStatus').textContent = '🟢 Conectado';
        document.getElementById('connectionStatus').style.color = '#00ff00';
    }
}

// ============================================================
//  CONEXIÓN CON SIGNALR (ACTIVA PARA EL BACKEND EN C#)
// ============================================================
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/telemetriaHub") // Debe coincidir con Program.cs
    .withAutomaticReconnect()
    .build();

// Escuchar el evento que envía el TelemetriaController.cs
connection.on("RecibirTelemetria", function (data) {
    console.log("Paquete recibido:", data);

    // Mapear el JSON recibido de C# a la estructura que usan tus funciones JS.
    // Soporta tanto nombres en español (si tu clase C# los tiene así) como en inglés.
    const datosMapeados = {
        time: data.tiempo ?? data.time,
        alt: data.altitud ?? data.alt,
        temp: data.temperatura ?? data.temp,
        hum: data.humedad ?? data.hum,
        pressure: data.presion ?? data.pressure,
        speed: data.velocidad ?? data.speed,
        accel: data.aceleracion ?? data.accel,
        vib: data.vibracion ?? data.vib,
        lat: data.latitud ?? data.lat,
        lon: data.longitud ?? data.lon
    };

    processData(datosMapeados);
});

async function startSignalR() {
    try {
        await connection.start();
        console.log(" Conectado al servidor de Telemetría ASPIRAL");
        isConnected = true;
        document.getElementById('statusLed').className = 'led';
        document.getElementById('connectionStatus').textContent = '🟢 Conectado';
        document.getElementById('connectionStatus').style.color = '#00ff00';
    } catch (err) {
        console.error(" Error conectando a SignalR: ", err);
        document.getElementById('statusLed').className = 'led disconnected';
        document.getElementById('connectionStatus').textContent = '🔴 Desconectado';
        document.getElementById('connectionStatus').style.color = 'red';
        setTimeout(startSignalR, 5000); // Reintentar en 5 segundos
    }
}

// Iniciar conexión al cargar el script
startSignalR();