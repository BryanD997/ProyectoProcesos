function roundRobin(processes, quantum) {
  let cola = processes.map(p => ({
    id: p.id,
    tiempoRestante: p.tiempo,
    ejecutado: 0,
    llegada: 0
  }));

  let tiempoActual = 0;
  let tabla = [];

  while (cola.length > 0) {
    let proceso = cola.shift();

    let tiempoEjecutado = Math.min(quantum, proceso.tiempoRestante);
    let tiempoEspera = tiempoActual - proceso.llegada - proceso.ejecutado;

    tabla.push({
      tiempoInicio: tiempoActual,
      proceso: proceso.id,
      ejecutado: tiempoEjecutado,
      restante: proceso.tiempoRestante - tiempoEjecutado,
      espera: tiempoEspera
    });

    tiempoActual += tiempoEjecutado;
    proceso.tiempoRestante -= tiempoEjecutado;
    proceso.ejecutado += tiempoEjecutado;

    if (proceso.tiempoRestante > 0) {
      cola.push(proceso);
    }
  }

  //eliminar las ejecuciones finales repetidas del mismo proceso
  let ultimoProceso = tabla[tabla.length - 1].proceso;
  let indexUltimo = tabla.length - 1;

  while (indexUltimo > 0 && tabla[indexUltimo - 1].proceso === ultimoProceso) {
    indexUltimo--;
  }

  let tablaValida = tabla.slice(0, indexUltimo + 1);

  let sumaTiemposInicio = tablaValida.reduce((acc, row) => acc + row.tiempoInicio, 0);
  let totalEjecuciones = tablaValida.length;
  let promedioEspera = sumaTiemposInicio / totalEjecuciones;

  return { tabla, tablaValida, sumaTiemposInicio, totalEjecuciones, promedioEspera };
}

// EJEMPLO DE USO:
let procesos = [
  { id: "P1", tiempo: 75 },
  { id: "P2", tiempo: 88 },
  { id: "P3", tiempo: 72 },
  { id: "P4", tiempo: 69 },
  { id: "P5", tiempo: 90 },
  { id: "P6", tiempo: 60 },
  { id: "P7", tiempo: 77 },
  { id: "P8", tiempo: 81 },
  { id: "P9", tiempo: 95 },
  { id: "P10", tiempo: 66 }
];

let quantum = 10;
let resultado = roundRobin(procesos, quantum);

console.table(resultado.tabla);
console.table(resultado.tablaValida);
console.log("Total ejecuciones:", resultado.totalEjecuciones);
console.log("Suma tiempos inicio:", resultado.sumaTiemposInicio);
console.log("Promedio de espera:", resultado.promedioEspera.toFixed(2));
