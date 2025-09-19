class Proceso {
    constructor(nombre, tiempo, prioridad = null) {
        this.nombre = nombre;
        this.tiempo = tiempo;
        this.prioridad = prioridad;
        this.tiempoEspera = 0;
        this.tiempoFinal = 0;
    }
}

let listaProcesos = [];
let contador = 1;

function alternarEntradaQuantum() {
    const algoritmo = document.getElementById("algoritmo").value;
    document.getElementById("entradaQuantum").style.display = algoritmo === "roundrobin" ? "block" : "none";
    document.getElementById("grupoPrioridad").style.display = algoritmo === "prioridad" ? "block" : "none";
}

function agregarProceso() {
    const nombre = document.getElementById("nombreProceso").value || `P${contador++}`;
    const tiempo = parseInt(document.getElementById("tiempo").value);
    const prioridad = parseInt(document.getElementById("prioridad").value) || null;

    if (!tiempo || tiempo < 1) {
        alert("Ingresa un tiempo válido");
        return;
    }

    listaProcesos.push(new Proceso(nombre, tiempo, prioridad));
    actualizarListaProcesos();

    document.getElementById("btnSimular").disabled = listaProcesos.length === 0;
    document.getElementById("btnEliminar").disabled = listaProcesos.length === 0;
    limpiarEntradas();
}

function eliminarUltimoProceso() {
    if (listaProcesos.length > 0) {
        listaProcesos.pop();
        actualizarListaProcesos();
    }
            
    document.getElementById("btnSimular").disabled = listaProcesos.length === 0;
    document.getElementById("btnEliminar").disabled = listaProcesos.length === 0;
}

function limpiarEntradas() {
    document.getElementById("nombreProceso").value = "";
    document.getElementById("tiempo").value = "";
    document.getElementById("prioridad").value = "";
}

function actualizarListaProcesos() {
    const lista = document.getElementById("listaProcesos");
    if (listaProcesos.length === 0) {
        lista.innerHTML = '<p style="text-align:center;color:#666;font-style:italic;">No hay procesos agregados</p>';
        return;
    }
    lista.innerHTML = listaProcesos.map((p, i) => `
        <div>
            #${i+1} ${p.nombre} | Tiempo: ${p.tiempo} ${p.prioridad ? "| Prioridad: " + p.prioridad : ""}
        </div>
    `).join("");
}

function simular() {
    const algoritmo = document.getElementById("algoritmo").value;
    if (!algoritmo) {
        alert("Selecciona un algoritmo");
        return;
    }
    if (listaProcesos.length === 0) {
        alert("Agrega procesos primero");
        return;
    }

    let resultados;
    if (algoritmo === "fcfs") {
        resultados = planificacionFCFS(listaProcesos);
    } else if (algoritmo === "sjf")  {
        resultados = planificacionSJF(listaProcesos);
    } else if (algoritmo === "roundrobin"){
        resultados = planificacionRoundRobin(listaProcesos);
    } else if (algoritmo === "prioridad"){
        resultados = planificacionPrioridad(listaProcesos);
    }

    mostrarResultados(resultados);
}

function planificacionFCFS(procesos) {
    let tiempoActual = 0;
    let resultados = [];

    for (let i = 0; i < procesos.length; i++) {
        let p = procesos[i];

        p.tiempoEspera = tiempoActual;
        p.tiempoFinal = tiempoActual + p.tiempo;

        tiempoActual = p.tiempoFinal;
        resultados.push({ ...p });
    }

    const tiempoEsperaPromedio = procesos.reduce((suma, p) => suma + p.tiempoEspera, 0) / procesos.length;

    return {
        procesos: resultados,
        metricas: {
            tiempoEsperaPromedio: tiempoEsperaPromedio.toFixed(2)
        }
    };
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

function planificacionRoundRobin(lista) {
    const quantum = parseInt(document.getElementById("quantum").value);
    if (!quantum || quantum < 1) {
        alert("Ingresa un quantum válido");
        return;
    }

    let cola = lista.map(p => ({
        id: p.nombre,
        tiempoRestante: p.tiempo,
        ejecutado: 0,
        llegada: 0
    }));

    let tiempoActual = 0;
    let tabla = [];

    while (cola.length > 0) {
        let proceso = cola.shift();

        let tiempoEjecutado = Math.min(quantum, proceso.tiempoRestante);
        let tiempoEspera = tiempoActual - proceso.ejecutado;

        tabla.push({
            tiempoInicio: tiempoActual,
            proceso: proceso.id,
            ejecutado: tiempoEjecutado,
            restante: proceso.tiempoRestante - tiempoEjecutado, //ti-tt
            espera: tiempoEspera
        });

        tiempoActual += tiempoEjecutado;
        proceso.tiempoRestante -= tiempoEjecutado;
        proceso.ejecutado += tiempoEjecutado;

        if (proceso.tiempoRestante > 0) {
            cola.push(proceso);
        }
    }

    let ultimoProceso = tabla[tabla.length - 1].proceso;
    let indiceUltimo = tabla.length - 1;

    while (indiceUltimo > 0 && tabla[indiceUltimo - 1].proceso === ultimoProceso) {
        indiceUltimo--;
    }

    let tablaValida = tabla.slice(0, indiceUltimo + 1);

    let sumaTiemposInicio = tablaValida.reduce((acc, fila) => acc + fila.tiempoInicio, 0);
    let totalEjecuciones = tablaValida.length;
    let promedioEspera = sumaTiemposInicio / totalEjecuciones;

    return {
        tabla,
        tablaValida,
        metricas: {
            tiempoEsperaPromedio: promedioEspera.toFixed(2)
        }
    };
}

function planificacionPrioridad(procesos) {
    procesos.sort((a, b) => a.prioridad - b.prioridad);
    
    let tiempoActual = 0;
    let resultados = [];
    
    for (let i = 0; i < procesos.length; i++) {
        let proceso = procesos[i];
        
        proceso.tiempoEspera = tiempoActual;
        proceso.tiempoFinal = tiempoActual + proceso.tiempo;
        proceso.tiempoRetorno = proceso.tiempoFinal;
        
        tiempoActual = proceso.tiempoFinal;
        
        resultados.push({...proceso});
    }
    
    const tiempoEsperaPromedio = procesos.reduce((suma, p) => suma + p.tiempoEspera, 0) / procesos.length;
    const tiempoRetornoPromedio = procesos.reduce((suma, p) => suma + p.tiempoRetorno, 0) / procesos.length;
    
    return {
        procesos: resultados,
        metricas: {
            tiempoEsperaPromedio: tiempoEsperaPromedio.toFixed(2),
            tiempoRetornoPromedio: tiempoRetornoPromedio.toFixed(2)
        }
    };
}

function mostrarResultados(resultados) {
    const esRoundRobin = document.getElementById("algoritmo").value === "roundrobin";

    let html = `<h3>Resultados (${document.getElementById("algoritmo").selectedOptions[0].text})</h3>`;

    if (esRoundRobin && resultados.tabla && resultados.tablaValida) {
        html += `<h4>Tabla de ejecución</h4>`;
        html += `<table border="1" cellpadding="5" cellspacing="0">
            <tr>
                <th>Tiempo Inicio</th>
                <th>Proceso</th>
                <th>Ejecutado</th>
                <th>Restante</th>
                <th>Espera</th>
            </tr>
            ${resultados.tablaValida.map(fila => `
                <tr>
                    <td>${fila.tiempoInicio}</td>
                    <td>${fila.proceso}</td>
                    <td>${fila.ejecutado}</td>
                    <td>${fila.restante}</td>
                    <td>${fila.espera}</td>
                </tr>
            `).join("")}
        </table>`;

        html += `<p><b>Total ejecuciones válidas:</b> ${resultados.tablaValida.length}</p>`;
    } else {
        html += `<table border="1" cellpadding="5" cellspacing="0">
            <tr>
                <th>Proceso</th>
                <th>Tiempo</th>
                <th>T. Espera</th>
            </tr>
            ${resultados.procesos.map(p => `
                <tr>
                    <td>${p.nombre}</td>
                    <td>${p.tiempo}</td>
                    <td>${p.tiempoEspera}</td>
                </tr>
            `).join("")}
        </table>`;
    }

    html += `<p><b>Tiempo Promedio de Espera:</b> ${resultados.metricas.tiempoEsperaPromedio}</p>`;

    document.getElementById("contenidoResultados").innerHTML = html;
    document.getElementById("seccionResultados").style.display = "block";
}
