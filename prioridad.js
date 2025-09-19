class Proceso {
    constructor(nombre, tiempo, prioridad) {
        this.nombre = nombre;
        this.tiempo = tiempo;
        this.prioridad = prioridad;
        this.tiempoEspera = 0;
        this.tiempoRetorno = 0;
        this.tiempoFinal = 0;
    }
}

function planificacionPrioridad(procesos) {
    procesos.sort((a, b) => a.prioridad - b.prioridad);
    
    let tiempoActual = 0;
    let resultados = [];
    let diagramaGantt = [];
    
    for (let i = 0; i < procesos.length; i++) {
        let proceso = procesos[i];
        
        proceso.tiempoEspera = tiempoActual;
        
        proceso.tiempoFinal = tiempoActual + proceso.tiempo;
        
        proceso.tiempoRetorno = proceso.tiempoFinal;
        
        diagramaGantt.push({
            proceso: proceso.nombre,
            inicio: tiempoActual,
            fin: proceso.tiempoFinal,
            prioridad: proceso.prioridad
        });
        
        tiempoActual = proceso.tiempoFinal;
        
        resultados.push({...proceso});
    }
    
    const tiempoEsperaPromedio = procesos.reduce((sum, p) => sum + p.tiempoEspera, 0) / procesos.length;
    const tiempoRetornoPromedio = procesos.reduce((sum, p) => sum + p.tiempoRetorno, 0) / procesos.length;
    
    return {
        procesos: resultados,
        diagramaGantt,
        metricas: {
            tiempoEsperaPromedio: tiempoEsperaPromedio.toFixed(2),
            tiempoRetornoPromedio: tiempoRetornoPromedio.toFixed(2)
        }
    };
}

function mostrarResultados(resultados) {
    console.log("PROCESOS ORDENADOS POR PRIORIDAD:");
    console.log("Proceso\tTiempo\tPrioridad\tT. Espera");
    console.log("-----------------------------------------------------------");
    
    resultados.procesos.forEach(p => {
        console.log(`${p.nombre}\t${p.tiempo}\t${p.prioridad}\t\t${p.tiempoEspera}`);
    });
    
    console.log("\nMÉTRICAS:");
    console.log(`Tiempo promedio de espera: ${resultados.metricas.tiempoEsperaPromedio}`);
}

const procesos = [
    new Proceso("P1", 15, 3),
    new Proceso("P2", 5, 2),
    new Proceso("P3", 35, 2),
    new Proceso("P4", 14, 1),
    new Proceso("P5", 9, 1),
    new Proceso("P6", 22, 4),
    new Proceso("P7", 45, 2),
    new Proceso("P8", 10, 3),
    new Proceso("P9", 18, 1)
];

const resultados = planificacionPrioridad(procesos);

mostrarResultados(resultados);

function resolverPlanificacion(datos) {
    const procesos = datos.map(p => new Proceso(p.nombre, p.tiempo, p.prioridad));
    return planificacionPrioridad(procesos);
}

