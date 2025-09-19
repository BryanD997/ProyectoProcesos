class Proceso {
    constructor(nombre, tiempo, prioridad = null) {
        this.nombre = nombre;
        this.tiempo = tiempo;
        this.prioridad = prioridad;
        this.tiempoEspera = 0;
    }
}

let procesos = [];
let contador = 1;

function toggleQuantumInput() {
    const algorithm = document.getElementById("algorithm").value;
    document.getElementById("quantumInput").style.display = algorithm === "roundrobin" ? "block" : "none";
    document.getElementById("priorityGroup").style.display = algorithm === "priority" ? "block" : "none";
}

function addProcess() {
    const nombre = document.getElementById("processName").value || `P${contador++}`;
    const tiempo = parseInt(document.getElementById("burstTime").value);
    const prioridad = parseInt(document.getElementById("priority").value) || null;

    if (!tiempo || tiempo < 1) {
        alert("Ingresa un tiempo de ráfaga válido");
        return;
    }

    procesos.push(new Proceso(nombre, tiempo, prioridad));
    updateProcessList();

    document.getElementById("simulateBtn").disabled = procesos.length === 0;
    clearInputs();
}

function clearInputs() {
    document.getElementById("processName").value = "";
    document.getElementById("burstTime").value = "";
    document.getElementById("priority").value = "";
}

function updateProcessList() {
    const list = document.getElementById("processList");
    if (procesos.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:#666;font-style:italic;">No hay procesos agregados</p>';
        return;
    }
    list.innerHTML = procesos.map((p, i) => `
        <div>
            #${i+1} ${p.nombre} | Ráfaga: ${p.tiempo} ${p.prioridad ? "| Prioridad: " + p.prioridad : ""}
        </div>
    `).join("");
}

function simulate() {
    const algorithm = document.getElementById("algorithm").value;
    if (!algorithm) {
        alert("Selecciona un algoritmo");
        return;
    }
    if (procesos.length === 0) {
        alert("Agrega procesos primero");
        return;
    }

    let resultados;
    if (algorithm === "sjf") {
        resultados = planificacionSJF(procesos);
    } else {
        return;
    }

    mostrarResultados(resultados);
}

function planificacionSJF(lista) {
    const ordenados = [...lista].sort((a, b) => a.tiempo - b.tiempo);

    let tiempoActual = 0;
    let totalEspera = 0;

    ordenados.forEach(p => {
        p.tiempoEspera = tiempoActual;
        tiempoActual += p.tiempo;
        totalEspera += p.tiempoEspera;
    });

    return {
        procesos: ordenados,
        metricas: {
            tiempoEsperaPromedio: (totalEspera / ordenados.length).toFixed(2)
        }
    };
}

function mostrarResultados(resultados) {
    let tabla = `
        <table border="1" cellpadding="5" cellspacing="0">
            <tr>
                <th>Proceso</th>
                <th>Ráfaga</th>
                <th>T. Espera</th>
            </tr>
            ${resultados.procesos.map(p => `
                <tr>
                    <td>${p.nombre}</td>
                    <td>${p.tiempo}</td>
                    <td>${p.tiempoEspera}</td>
                </tr>
            `).join("")}
        </table>
        <p><b>Tiempo Promedio de Espera:</b> ${resultados.metricas.tiempoEsperaPromedio}</p>
    `;
    document.getElementById("resultsContent").innerHTML = tabla;
    document.getElementById("resultsSection").style.display = "block";
}
