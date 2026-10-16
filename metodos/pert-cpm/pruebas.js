"use strict";

const resumenPruebas = document.getElementById("resumen-pruebas");
const listaPruebas = document.getElementById("lista-pruebas");
const aplicacionPruebas = document.getElementById("aplicacion-pruebas");

function crearActividad(nombre, duracion, predecesoras = []) {
  return {
    nombre,
    descripcion: "",
    predecesoras,
    duracion,
    varianza: 0,
    desviacionEstandar: 0,
    tiempos: null
  };
}

function afirmar(condicion, mensaje) {
  if (!condicion) throw new Error(mensaje);
}

function afirmarCasiIgual(valor, esperado, mensaje) {
  const tolerancia = 1e-9 * Math.max(1, Math.abs(valor), Math.abs(esperado));
  afirmar(Math.abs(valor - esperado) <= tolerancia, mensaje + `: se obtuvo ${valor}`);
}

function registrarResultado(nombre, error = null) {
  const elemento = document.createElement("li");
  elemento.className = error ? "prueba-fallida" : "prueba-correcta";
  const titulo = document.createElement("strong");
  titulo.textContent = (error ? "No superada · " : "Correcta · ") + nombre;
  elemento.append(titulo);
  if (error) {
    const detalle = document.createElement("span");
    detalle.textContent = error.message;
    elemento.append(detalle);
  }
  listaPruebas.append(elemento);
}

function ejecutarPruebas() {
  const calculadora = aplicacionPruebas.contentWindow;
  const pruebas = [
    {
      nombre: "ampliar datos conserva la misma tabla y las tres estimaciones editadas",
      ejecutar() {
        const doc = calculadora.document;
        calculadora.cargarEjemplo("pert-problema-5");
        const campo = doc.querySelector("#actividades .pesimista");
        const tabla = doc.querySelector(".tabla-entrada table");
        doc.getElementById("ampliar-datos").click();
        afirmar(doc.querySelector(".entrada-ampliada"), "Debe ampliarse la entrada");
        afirmar(doc.getElementById("ampliar-datos").getAttribute("aria-expanded") === "true", "Debe anunciar el estado ampliado");
        campo.value = "15";
        doc.getElementById("ampliar-datos").click();
        afirmar(doc.querySelector(".tabla-entrada table") === tabla && doc.querySelector("#actividades .pesimista") === campo, "No debe duplicarse ni reconstruirse la tabla");
        afirmar(campo.value === "15" && !doc.querySelector(".entrada-ampliada"), "Debe conservar la edición al volver");
        campo.value = "14";
      }
    },
    {
      nombre: "Escape respeta los diálogos y calcular vuelve al análisis con 34 días",
      ejecutar() {
        const doc = calculadora.document;
        calculadora.cargarEjemplo("pert-problema-5");
        calculadora.cambiarVistaDatos(true);
        doc.getElementById("abrir-carga").click();
        doc.dispatchEvent(new calculadora.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        afirmar(doc.querySelector(".entrada-ampliada"), "Un diálogo abierto no debe cerrar la vista ampliada");
        doc.getElementById("dialogo-carga").close();
        doc.dispatchEvent(new calculadora.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        afirmar(!doc.querySelector(".entrada-ampliada"), "Escape debe restaurar la vista normal");
        calculadora.cambiarVistaDatos(true);
        calculadora.resolverFormulario();
        afirmar(!doc.querySelector(".entrada-ampliada") && !doc.getElementById("salida").hidden, "Calcular debe mostrar los resultados");
        afirmar(doc.getElementById("duracion").textContent === "34", "No debe cambiar la duración PERT");
      }
    },
    {
      nombre: "campos PERT legibles en paneles estrechos",
      ejecutar() {
        const doc = calculadora.document;
        const muestra = doc.createElement("div");
        muestra.dataset.metodo = "pert";
        muestra.style.cssText = "position:fixed;left:-10000px;width:320px;visibility:hidden";
        const contenedor = doc.createElement("div");
        contenedor.className = "tabla-contenedor tabla-entrada";
        const tabla = doc.createElement("table");
        const encabezados = tabla.createTHead().insertRow();
        ["#", "Actividad", "Descripción", "Predecesoras", "Optimista (a)", "Más probable (m)", "Pesimista (b)", "Quitar"].forEach(texto => {
          const th = doc.createElement("th");
          th.textContent = texto;
          encabezados.append(th);
        });
        const fila = tabla.createTBody().insertRow();
        ["1", "J", "", "D,B,E", "5", "8", "17", "×"].forEach((valor, indice) => {
          const celda = fila.insertCell();
          if (indice >= 4 && indice <= 6) {
            const entrada = doc.createElement("input");
            entrada.type = "number";
            entrada.className = ["optimista", "probable", "pesimista"][indice - 4];
            entrada.value = valor;
            celda.append(entrada);
          } else celda.textContent = valor;
        });
        contenedor.append(tabla);
        muestra.append(contenedor);
        doc.body.append(muestra);
        try {
          fila.querySelectorAll("input").forEach(entrada => afirmar(entrada.getBoundingClientRect().width >= 90, "Cada estimación debe tener al menos 90 px para mostrar el número y sus controles"));
          afirmar(contenedor.clientWidth <= 320 && contenedor.scrollWidth > contenedor.clientWidth, "La tabla debe desplazarse dentro del panel, no comprimir las estimaciones");
        } finally { muestra.remove(); }
      }
    },
    {
      nombre: "Problema 5 · tres estimaciones: coincidencia con la tabla POM-QM",
      ejecutar() {
        const caso = calculadora.obtenerCasoProyecto("pert-problema-5");
        afirmar(caso.tipo === "pert" && caso.unidad === "días" && caso.plazo === 30 && caso.actividades.length === 15, "El caso debe tener 15 actividades PERT y plazo de 30 días");
        const datos = caso.actividades.map(a => ({
          ...crearActividad(a.nombre, 0, a.predecesoras.split(",").map(p => p.trim()).filter(Boolean)),
          ...calculadora.calcularEstimacionPert(a.optimista, a.probable, a.pesimista)
        }));
        const solucion = calculadora.resolverProyecto(datos);
        afirmarCasiIgual(solucion.duracionTotal, 34, "La duración esperada debe ser 34 días");
        afirmar(solucion.rutas.length === 1 && solucion.rutas[0].join("-") === "A-D-J-K-N", "La ruta crítica debe ser A-D-J-K-N");
        const varianza = solucion.rutas[0].reduce((suma, nombre) => suma + solucion.actividadesPorNombre.get(nombre).varianza, 0);
        afirmarCasiIgual(varianza, 14, "La varianza de la ruta debe ser 14");
        const resultados = {
          A: [0, 6, 0, 6], B: [0, 8, 2, 10], C: [0, 5, 2, 7], D: [6, 10, 6, 10], E: [5, 8, 7, 10],
          F: [6, 9, 11, 14], G: [5, 16, 8, 19], H: [9, 13, 14, 18], I: [10, 17, 11, 18],
          J: [10, 19, 10, 19], K: [19, 27, 19, 27], L: [17, 26, 18, 27],
          M: [19, 22, 83 / 3, 92 / 3], N: [27, 34, 27, 34], O: [22, 76 / 3, 92 / 3, 34]
        };
        Object.entries(resultados).forEach(([nombre, esperado]) => {
          const actividad = solucion.actividadesPorNombre.get(nombre);
          [actividad.inicioTemprano, actividad.finTemprano, actividad.inicioTardio, actividad.finTardio].forEach((valor, i) => afirmarCasiIgual(valor, esperado[i], "Tiempo " + i + " de " + nombre));
        });
      }
    },
    {
      nombre: "Problema 4 · construcción de una casa: datos y ruta crítica",
      ejecutar() {
        const caso = calculadora.obtenerCasoProyecto("cpm-casa-problema-4");
        afirmar(caso.unidad === "días" && caso.actividades.length === 14, "Deben conservarse las 14 actividades en días");
        const datos = caso.actividades.map(a => crearActividad(a.nombre, a.duracion, a.predecesoras.split(",").map(p => p.trim()).filter(Boolean)));
        const solucion = calculadora.resolverProyecto(datos);
        afirmarCasiIgual(solucion.duracionTotal, 35, "La construcción debe durar 35 días");
        afirmar(solucion.rutas.length === 1 && solucion.rutas[0].join("-") === "A-B-F-I-L-N", "La ruta crítica debe ser A-B-F-I-L-N");
        caso.actividades[0].duracion = 999;
        afirmar(calculadora.obtenerCasoProyecto("cpm-casa-problema-4").actividades[0].duracion === 6, "Cargar el caso debe entregar una copia independiente");
      }
    },
    {
      nombre: "disposición de redes: sin cuadros superpuestos ni conexiones que atraviesen actividades",
      ejecutar() {
        const caso = calculadora.obtenerCasoProyecto("cpm-casa-problema-4");
        const casa = caso.actividades.map(a => crearActividad(a.nombre, a.duracion, a.predecesoras.split(",").map(p => p.trim()).filter(Boolean)));
        const densa = [
          ["A", []], ["B", []], ["C", []], ["D", ["A"]], ["E", ["C"]],
          ["F", ["A"]], ["G", ["C"]], ["I", ["A"]], ["H", ["D", "E"]],
          ["J", ["F", "G", "H"]], ["K", ["F", "G", "H"]], ["L", ["F", "G", "H"]],
          ["M", ["F", "G", "H"]], ["N", ["I", "K"]], ["O", ["N", "L"]],
          ["P", ["I", "K"]], ["Q", ["J", "M", "O"]], ["R", ["N", "L"]]
        ].map(([nombre, predecesoras]) => crearActividad(nombre, 2, predecesoras));
        [casa, densa, [crearActividad("A", 0)]].forEach(datos => {
          const solucion = calculadora.resolverProyecto(datos);
          const red = calculadora.calcularDisposicionRed(solucion);
          const cuadros = [...solucion.orden.map(a => a.nombre), "__INICIO__", "__FIN__"].map(nombre => ({
            nombre, ...red.posiciones.get(nombre), ancho: nombre.startsWith("__") ? 104 : 252, alto: nombre.startsWith("__") ? 52 : 138
          }));
          cuadros.forEach((a, i) => {
            afirmar(a.x >= 0 && a.y >= 0 && a.x + a.ancho <= red.ancho && a.y + a.alto <= red.alto, "El cuadro " + a.nombre + " debe quedar dentro del lienzo");
            cuadros.slice(i + 1).forEach(b => afirmar(!(a.x < b.x + b.ancho && a.x + a.ancho > b.x && a.y < b.y + b.alto && a.y + a.alto > b.y), "Se superponen " + a.nombre + " y " + b.nombre));
          });
          const cantidadEsperada = datos.reduce((suma, a) => suma + a.predecesoras.length + Number(!a.predecesoras.length) + Number(!solucion.sucesoras.get(a.nombre).length), 0);
          afirmar(red.conexiones.length === cantidadEsperada, "No deben perderse precedencias ni conexiones de Inicio/Fin");
          red.conexiones.forEach(conexion => conexion.puntos.slice(1).forEach((b, indice) => {
            const a = conexion.puntos[indice];
            afirmar(Number.isFinite(a.x) && Number.isFinite(a.y), "Las coordenadas deben ser finitas");
            afirmar(a.x === b.x || a.y === b.y, "Cada tramo debe ser ortogonal");
            afirmar(b.x >= a.x, "Las conexiones deben avanzar hacia la derecha");
            cuadros.forEach(cuadro => {
              const cruza = a.y === b.y
                ? a.y > cuadro.y + .01 && a.y < cuadro.y + cuadro.alto - .01 && Math.max(a.x, b.x) > cuadro.x + .01 && Math.min(a.x, b.x) < cuadro.x + cuadro.ancho - .01
                : a.x > cuadro.x + .01 && a.x < cuadro.x + cuadro.ancho - .01 && Math.max(a.y, b.y) > cuadro.y + .01 && Math.min(a.y, b.y) < cuadro.y + cuadro.alto - .01;
              afirmar(!cruza, conexion.origen + " → " + conexion.destino + " atraviesa " + cuadro.nombre);
            });
          }));
          afirmarCasiIgual(solucion.duracionTotal, calculadora.resolverProyecto(datos).duracionTotal, "La disposición no debe modificar el cálculo");
        });
      }
    },
    {
      nombre: "precisión decimal en fórmulas con varias predecesoras",
      ejecutar() {
        const a = crearActividad("A", 7 / 3);
        const b = crearActividad("B", 14 / 3);
        const c = crearActividad("C", 1, ["A", "B"]);
        // El desarrollo también debe poder probarse si el usuario dejó activo PERT.
        [a, b, c].forEach(actividad => {
          actividad.tiempos = {
            optimista: actividad.duracion,
            probable: actividad.duracion,
            pesimista: actividad.duracion
          };
        });
        const solucion = calculadora.resolverProyecto([a, b, c]);
        calculadora.presentarDesarrollo(solucion, [], null);
        const texto = calculadora.document.getElementById("desarrollo").textContent;
        afirmar(texto.includes("2.3333") && texto.includes("4.6667"), "Las sustituciones deben conservar cuatro decimales sin depender del orden");
      }
    },
    {
      nombre: "criticidad recalculada al cambiar escenario PERT",
      ejecutar() {
        const b = crearActividad("B", 5, ["A"]);
        b.tiempos = { optimista: 1, probable: 5, pesimista: 9 };
        const c = crearActividad("C", 4, ["A"]);
        c.tiempos = { optimista: 4, probable: 4, pesimista: 4 };
        const solucion = calculadora.resolverProyecto([crearActividad("A", 1), b, c, crearActividad("D", 1, ["B", "C"])]);
        const escenario = calculadora.calcularEscenarioGantt(solucion, "optimista");
        afirmar(solucion.actividadesPorNombre.get("B").critica, "B es crítica en la programación base");
        afirmar(!escenario.solucion.actividadesPorNombre.get("B").critica, "B no debe conservar la criticidad en el escenario optimista");
        afirmar(escenario.solucion.actividadesPorNombre.get("C").critica, "C pasa a ser crítica en el escenario optimista");
        afirmarCasiIgual(escenario.duracionTotal, 6, "El escenario debe durar 6");
        afirmarCasiIgual(solucion.duracionTotal, 7, "La programación original no debe modificarse");
      }
    },
    {
      nombre: "actividades de duración cero",
      ejecutar() {
        const solucion = calculadora.resolverProyecto([crearActividad("A", 0), crearActividad("B", 0, ["A"])]);
        afirmarCasiIgual(solucion.duracionTotal, 0, "Los hitos no deben agregar tiempo");
        afirmar(solucion.rutas[0].join("-") === "A-B", "La ruta debe incluir los hitos");
      }
    },
    {
      nombre: "entrada decimal y rechazo de valores no finitos",
      ejecutar() {
        afirmarCasiIgual(calculadora.convertirNumero("2,5", "Duración"), 2.5, "Debe aceptar coma decimal");
        ["-1", "Infinity", "abc", ""].forEach(valor => {
          let rechazado = false;
          try { calculadora.convertirNumero(valor, "Duración"); } catch { rechazado = true; }
          afirmar(rechazado, "Debe rechazar " + valor);
        });
      }
    },
    {
      nombre: "estimación PERT y varianza",
      ejecutar() {
        const estimacion = calculadora.calcularEstimacionPert(2, 4, 6);
        afirmarCasiIgual(estimacion.duracion, 4, "La duración esperada debe ser 4");
        afirmarCasiIgual(estimacion.varianza, 4 / 9, "La varianza debe ser 4/9");
      }
    },
    {
      nombre: "recorridos temprano y tardío",
      ejecutar() {
        const actividades = [
          crearActividad("A", 4),
          crearActividad("B", 5, ["A"]),
          crearActividad("C", 3, ["A"]),
          crearActividad("D", 8, ["B", "C"]),
          crearActividad("E", 4, ["D"]),
          crearActividad("F", 2, ["E"])
        ];
        const solucion = calculadora.resolverProyecto(actividades);
        afirmarCasiIgual(solucion.duracionTotal, 23, "La duración total debe ser 23");
        afirmar(solucion.rutas.length === 1, "Debe existir una ruta crítica");
        afirmar(solucion.rutas[0].join("-") === "A-B-D-E-F", "La ruta crítica no coincide");
        afirmarCasiIgual(solucion.actividadesPorNombre.get("C").holgura, 2, "La holgura de C debe ser 2");
      }
    },
    {
      nombre: "práctica CPM del laboratorio de cómputo",
      ejecutar() {
        const actividades = [
          crearActividad("A", 3),
          crearActividad("B", 6, ["A"]),
          crearActividad("C", 8, ["A"]),
          crearActividad("D", 5, ["C"]),
          crearActividad("E", 4, ["C", "D"]),
          crearActividad("F", 3, ["B", "E"]),
          crearActividad("G", 2, ["F"])
        ];
        const solucion = calculadora.resolverProyecto(actividades);
        afirmarCasiIgual(solucion.duracionTotal, 25, "La duración total debe ser 25");
        afirmar(solucion.rutas[0].join("-") === "A-C-D-E-F-G", "La ruta crítica no coincide");
      }
    },
    {
      nombre: "práctica PERT de software con incertidumbre",
      ejecutar() {
        const estimaciones = [[2, 4, 6], [3, 5, 9], [2, 3, 4], [5, 8, 11], [2, 4, 6], [1, 2, 3]].map(valores => calculadora.calcularEstimacionPert(...valores));
        const actividades = [
          crearActividad("A", estimaciones[0].duracion),
          crearActividad("B", estimaciones[1].duracion, ["A"]),
          crearActividad("C", estimaciones[2].duracion, ["A"]),
          crearActividad("D", estimaciones[3].duracion, ["B", "C"]),
          crearActividad("E", estimaciones[4].duracion, ["D"]),
          crearActividad("F", estimaciones[5].duracion, ["E"])
        ];
        const solucion = calculadora.resolverProyecto(actividades);
        afirmarCasiIgual(solucion.duracionTotal, 70 / 3, "La duración esperada debe ser 23.3333");
        afirmar(solucion.rutas[0].join("-") === "A-B-D-E-F", "La ruta crítica PERT no coincide");
      }
    },
    {
      nombre: "detección de ciclos",
      ejecutar() {
        let detectado = false;
        try {
          calculadora.resolverProyecto([
            crearActividad("A", 1, ["B"]),
            crearActividad("B", 1, ["A"])
          ]);
        } catch (error) {
          detectado = /ciclo/i.test(error.message);
        }
        afirmar(detectado, "El ciclo debe producir un error comprensible");
      }
    },
    {
      nombre: "componentes independientes",
      ejecutar() {
        const solucion = calculadora.resolverProyecto([
          crearActividad("A", 3),
          crearActividad("B", 2, ["A"]),
          crearActividad("C", 4)
        ]);
        afirmarCasiIgual(solucion.duracionTotal, 5, "Debe usarse el final más tardío");
        afirmarCasiIgual(solucion.actividadesPorNombre.get("C").holgura, 1, "C debe tener una unidad de holgura");
      }
    },
    {
      nombre: "rutas críticas paralelas",
      ejecutar() {
        const solucion = calculadora.resolverProyecto([
          crearActividad("A", 2),
          crearActividad("B", 2),
          crearActividad("C", 3, ["A"]),
          crearActividad("D", 3, ["B"])
        ]);
        const rutas = solucion.rutas.map(ruta => ruta.join("-")).sort();
        afirmar(rutas.length === 2, "Deben detectarse dos rutas críticas");
        afirmar(rutas.join("|") === "A-C|B-D", "Las rutas paralelas no coinciden");
      }
    },
    {
      nombre: "probabilidad con varianza cero",
      ejecutar() {
        afirmar(calculadora.calcularProbabilidad(10, 10, 0).probabilidad === 1, "Cumplir el plazo exacto debe dar 100 %");
        afirmar(calculadora.calcularProbabilidad(9, 10, 0).probabilidad === 0, "Un plazo menor debe dar 0 %");
      }
    },
    {
      nombre: "enrutamiento ortogonal de conexiones",
      ejecutar() {
        const ruta = calculadora.crearRutaOrtogonal([
          { x: 0, y: 0 },
          { x: 20, y: 0 },
          { x: 20, y: 0 },
          { x: 20, y: 30 },
          { x: 50, y: 30 }
        ]);
        afirmar(ruta.startsWith("M 0 0"), "La ruta debe comenzar en el origen");
        afirmar(ruta.includes("Q"), "Los cambios de dirección deben tener esquinas redondeadas");
        afirmar(!ruta.includes("NaN"), "La ruta no debe contener coordenadas inválidas");
      }
    }
  ];

  let correctas = 0;
  pruebas.forEach(prueba => {
    try {
      prueba.ejecutar();
      correctas += 1;
      registrarResultado(prueba.nombre);
    } catch (error) {
      registrarResultado(prueba.nombre, error);
    }
  });

  const total = pruebas.length;
  const superadas = correctas === total;
  resumenPruebas.textContent = `${correctas} de ${total} pruebas superadas.`;
  resumenPruebas.classList.add(superadas ? "pruebas-superadas" : "pruebas-con-fallos");
  document.body.dataset.estado = superadas ? "correcto" : "fallido";
}

aplicacionPruebas.addEventListener("load", ejecutarPruebas, { once: true });
