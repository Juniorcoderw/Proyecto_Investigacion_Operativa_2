"use strict";

const elementos = {
  tipo: document.getElementById("tipo"),
  casoEjemplo: document.getElementById("caso-ejemplo"),
  grupoPlazo: document.getElementById("grupo-plazo"),
  plazo: document.getElementById("plazo"),
  encabezados: document.getElementById("encabezados"),
  actividades: document.getElementById("actividades"),
  mensaje: document.getElementById("mensaje"),
  estadoGuardado: document.getElementById("estado-guardado"),
  estadoVacio: document.getElementById("estado-vacio"),
  salida: document.getElementById("salida"),
  resultados: document.getElementById("resultados"),
  interpretacion: document.getElementById("interpretacion"),
  desarrollo: document.getElementById("desarrollo"),
  rutasCriticas: document.getElementById("rutas-criticas"),
  red: document.getElementById("red"),
  gantt: document.getElementById("gantt"),
  escenarioGantt: document.getElementById("escenario-gantt"),
  duracionGantt: document.getElementById("duracion-gantt"),
  escalaRedTexto: document.getElementById("escala-red"),
  escalaGanttTexto: document.getElementById("escala-gantt"),
  archivoCsv: document.getElementById("archivo-csv"),
  dialogoCarga: document.getElementById("dialogo-carga"),
  dialogoTeoria: document.getElementById("dialogo-teoria"),
  dialogoActividad: document.getElementById("dialogo-actividad"),
  tituloDialogoActividad: document.getElementById("titulo-dialogo-actividad"),
  contenidoDialogoActividad: document.getElementById("contenido-dialogo-actividad"),
  ayudaCarga: document.getElementById("ayuda-carga"),
  datosPegados: document.getElementById("datos-pegados"),
  mensajeCarga: document.getElementById("mensaje-carga")
};

const claveGuardado = "proyecto-modelado-pert-cpm-v2";
const limiteRutasCriticas = 500;
let tipoAnterior = elementos.tipo.value;
let temporizadorGuardado = null;
let solucionActual = null;
let escalaRed = 1;
let modoVistaRed = "lectura";
let dimensionesRed = { ancho: 0, alto: 0 };
let svgRed = null;
let escalaGantt = 1;
let programaGantt = null;
let actividadSeleccionada = null;
let datosPendientes = false;
let temporizadorEnfoqueNodo = null;
let borradoresPorTipo = { cpm: null, pert: null };

const CASOS_PROYECTO = {
  "cpm-sistema": {
    tipo: "cpm",
    etiqueta: "01 · Sistema informático",
    actividades: [
      { nombre: "A", descripcion: "Análisis de requerimientos", predecesoras: "", duracion: 4 },
      { nombre: "B", descripcion: "Diseño del sistema", predecesoras: "A", duracion: 5 },
      { nombre: "C", descripcion: "Diseño de base de datos", predecesoras: "A", duracion: 3 },
      { nombre: "D", descripcion: "Programación", predecesoras: "B, C", duracion: 8 },
      { nombre: "E", descripcion: "Pruebas", predecesoras: "D", duracion: 4 },
      { nombre: "F", descripcion: "Implementación", predecesoras: "E", duracion: 2 }
    ]
  },
  "cpm-laboratorio": {
    tipo: "cpm",
    etiqueta: "02 · Laboratorio de cómputo",
    actividades: [
      { nombre: "A", descripcion: "Elaboración del proyecto", predecesoras: "", duracion: 3 },
      { nombre: "B", descripcion: "Adquisición de equipos", predecesoras: "A", duracion: 6 },
      { nombre: "C", descripcion: "Adecuación del ambiente", predecesoras: "A", duracion: 8 },
      { nombre: "D", descripcion: "Instalación eléctrica", predecesoras: "C", duracion: 5 },
      { nombre: "E", descripcion: "Instalación de red", predecesoras: "C, D", duracion: 4 },
      { nombre: "F", descripcion: "Instalación de computadoras", predecesoras: "B, E", duracion: 3 },
      { nombre: "G", descripcion: "Pruebas", predecesoras: "F", duracion: 2 }
    ]
  },
  "cpm-casa-problema-4": {
    tipo: "cpm",
    etiqueta: "Problema 4 · Construcción de una casa",
    unidad: "días",
    actividades: [
      { nombre: "A", descripcion: "Despejar terreno y hacer fundaciones", predecesoras: "", duracion: 6 },
      { nombre: "B", descripcion: "Levantar estructura", predecesoras: "A", duracion: 8 },
      { nombre: "C", descripcion: "Instalar plomería y electricidad", predecesoras: "A", duracion: 6 },
      { nombre: "D", descripcion: "Hacer el piso del sótano", predecesoras: "A", duracion: 4 },
      { nombre: "E", descripcion: "Instalar calefacción y ventilación", predecesoras: "C", duracion: 5 },
      { nombre: "F", descripcion: "Hacer las paredes", predecesoras: "B", duracion: 8 },
      { nombre: "G", descripcion: "Hacer los pisos", predecesoras: "D", duracion: 3 },
      { nombre: "H", descripcion: "Colocar el techo", predecesoras: "B", duracion: 5 },
      { nombre: "I", descripcion: "Frisar las paredes", predecesoras: "E, F, G", duracion: 7 },
      { nombre: "J", descripcion: "Completar carpintería", predecesoras: "E, F, G", duracion: 6 },
      { nombre: "K", descripcion: "Hacer caminerías y jardines", predecesoras: "D", duracion: 3 },
      { nombre: "L", descripcion: "Lijar y pulir los pisos", predecesoras: "I, H", duracion: 1 },
      { nombre: "M", descripcion: "Terminar la electricidad", predecesoras: "J", duracion: 1 },
      { nombre: "N", descripcion: "Pintar", predecesoras: "L, M", duracion: 5 }
    ]
  },
  "pert-problema-5": {
    tipo: "pert",
    etiqueta: "Problema 5 · Terminar antes de un mes",
    unidad: "días",
    plazo: 30,
    actividades: [
      { nombre: "A", descripcion: "", predecesoras: "", optimista: 2, probable: 5, pesimista: 14 },
      { nombre: "B", descripcion: "", predecesoras: "", optimista: 2, probable: 9, pesimista: 10 },
      { nombre: "C", descripcion: "", predecesoras: "", optimista: 3, probable: 5, pesimista: 7 },
      { nombre: "D", descripcion: "", predecesoras: "A", optimista: 1, probable: 4, pesimista: 7 },
      { nombre: "E", descripcion: "", predecesoras: "C", optimista: 2, probable: 3, pesimista: 4 },
      { nombre: "F", descripcion: "", predecesoras: "A", optimista: 1, probable: 3, pesimista: 5 },
      { nombre: "G", descripcion: "", predecesoras: "C", optimista: 10, probable: 11, pesimista: 12 },
      { nombre: "H", descripcion: "", predecesoras: "F", optimista: 2, probable: 3, pesimista: 10 },
      { nombre: "I", descripcion: "", predecesoras: "D, B, E", optimista: 5, probable: 6, pesimista: 13 },
      { nombre: "J", descripcion: "", predecesoras: "D, B, E", optimista: 5, probable: 8, pesimista: 17 },
      { nombre: "K", descripcion: "", predecesoras: "G, J", optimista: 4, probable: 7, pesimista: 16 },
      { nombre: "L", descripcion: "", predecesoras: "H, I", optimista: 6, probable: 8, pesimista: 16 },
      { nombre: "M", descripcion: "", predecesoras: "G, J", optimista: 1, probable: 3, pesimista: 5 },
      { nombre: "N", descripcion: "", predecesoras: "L, K", optimista: 4, probable: 7, pesimista: 10 },
      { nombre: "O", descripcion: "", predecesoras: "M", optimista: 1, probable: 3, pesimista: 7 }
    ]
  },
  "pert-software": {
    tipo: "pert",
    etiqueta: "06 · Software con incertidumbre",
    plazo: 30,
    actividades: [
      { nombre: "A", descripcion: "Análisis inicial", predecesoras: "", optimista: 2, probable: 4, pesimista: 6 },
      { nombre: "B", descripcion: "Diseño principal", predecesoras: "A", optimista: 3, probable: 5, pesimista: 9 },
      { nombre: "C", descripcion: "Diseño complementario", predecesoras: "A", optimista: 2, probable: 3, pesimista: 4 },
      { nombre: "D", descripcion: "Desarrollo", predecesoras: "B, C", optimista: 5, probable: 8, pesimista: 11 },
      { nombre: "E", descripcion: "Pruebas", predecesoras: "D", optimista: 2, probable: 4, pesimista: 6 },
      { nombre: "F", descripcion: "Entrega", predecesoras: "E", optimista: 1, probable: 2, pesimista: 3 }
    ]
  },
  "pert-transformacion": {
    tipo: "pert",
    etiqueta: "10 · Centro de transformación digital",
    plazo: 65,
    actividades: [
      { nombre: "A", descripcion: "Diagnóstico inicial", predecesoras: "", optimista: 4, probable: 6, pesimista: 10 },
      { nombre: "B", descripcion: "Diseño de solución", predecesoras: "A", optimista: 5, probable: 7, pesimista: 11 },
      { nombre: "C", descripcion: "Evaluación presupuestal", predecesoras: "A", optimista: 3, probable: 5, pesimista: 9 },
      { nombre: "D", descripcion: "Adquisición tecnológica", predecesoras: "B, C", optimista: 7, probable: 10, pesimista: 15 },
      { nombre: "E", descripcion: "Adecuación de infraestructura", predecesoras: "B", optimista: 6, probable: 8, pesimista: 12 },
      { nombre: "F", descripcion: "Instalación tecnológica", predecesoras: "D, E", optimista: 5, probable: 7, pesimista: 11 },
      { nombre: "G", descripcion: "Configuración de sistemas", predecesoras: "F", optimista: 4, probable: 6, pesimista: 10 },
      { nombre: "H", descripcion: "Integración de sistemas", predecesoras: "G", optimista: 5, probable: 8, pesimista: 13 },
      { nombre: "I", descripcion: "Capacitación", predecesoras: "H", optimista: 3, probable: 5, pesimista: 7 },
      { nombre: "J", descripcion: "Pruebas piloto", predecesoras: "H", optimista: 4, probable: 6, pesimista: 9 },
      { nombre: "K", descripcion: "Correcciones", predecesoras: "I, J", optimista: 3, probable: 5, pesimista: 8 },
      { nombre: "L", descripcion: "Puesta en producción", predecesoras: "K", optimista: 2, probable: 3, pesimista: 5 }
    ]
  }
};
let redFueArrastrada = false;
let omitirSiguienteClicNodo = false;

function crearElemento(etiqueta, clase = "", texto = "") {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== "") elemento.textContent = texto;
  return elemento;
}

function crearElementoSvg(etiqueta, atributos = {}) {
  const espacioSvg = "http://www.w3.org/2000/svg";
  const elemento = document.createElementNS(espacioSvg, etiqueta);
  Object.entries(atributos).forEach(([nombre, valor]) => elemento.setAttribute(nombre, String(valor)));
  return elemento;
}

function casiIguales(primerNumero, segundoNumero) {
  const escala = Math.max(1, Math.abs(primerNumero), Math.abs(segundoNumero));
  return Math.abs(primerNumero - segundoNumero) <= 1e-9 * escala;
}

function normalizarCero(numero) {
  return casiIguales(numero, 0) ? 0 : numero;
}

function formato(numero, maximoDecimales = 4) {
  const valorNormalizado = normalizarCero(numero);
  return Number(valorNormalizado.toFixed(maximoDecimales)).toLocaleString("es-PE", {
    maximumFractionDigits: maximoDecimales
  });
}

function convertirNumero(texto, descripcion) {
  const valorNormalizado = String(texto).trim().replace(",", ".");
  const numero = valorNormalizado === "" ? NaN : Number(valorNormalizado);
  if (!Number.isFinite(numero) || numero < 0) {
    throw new Error(descripcion + " debe ser un número no negativo.");
  }
  return numero;
}

function calcularEstimacionPert(optimista, probable, pesimista) {
  if (optimista > probable || probable > pesimista) {
    throw new Error("Debe cumplirse: optimista ≤ más probable ≤ pesimista.");
  }
  const duracion = (optimista + 4 * probable + pesimista) / 6;
  const desviacionEstandar = (pesimista - optimista) / 6;
  return {
    duracion,
    desviacionEstandar,
    varianza: desviacionEstandar ** 2
  };
}

function ocultarResultados(conservar = true) {
  if (conservar && solucionActual) {
    datosPendientes = true;
    document.getElementById("aviso-pendiente").hidden = false;
    document.getElementById("imprimir").disabled = true;
    return;
  }
  elementos.salida.hidden = true;
  elementos.estadoVacio.hidden = false;
  document.querySelectorAll(".flujo li").forEach((paso, indice) => {
    paso.classList.toggle("activo", indice === 0);
  });
  solucionActual = null;
  programaGantt = null;
  datosPendientes = false;
  document.getElementById("aviso-pendiente").hidden = true;
}

function mostrarError(error) {
  if (!solucionActual) {
    elementos.salida.hidden = true;
    elementos.estadoVacio.hidden = false;
  }
  elementos.mensaje.textContent = error instanceof Error ? error.message : String(error);
  document.querySelector(".espacio-trabajo").classList.remove("vista-ampliada");
  document.getElementById("ampliar-vista").textContent = "Ampliar vista ↗";
  document.getElementById("ampliar-vista").setAttribute("aria-expanded", "false");
  if (error.campo) {
    error.campo.setAttribute("aria-invalid", "true");
    error.campo.setAttribute("aria-describedby", "mensaje");
    error.campo.focus();
  } else elementos.mensaje.focus();
}

function errorEntrada(mensaje, campo) {
  const error = new Error(mensaje);
  error.campo = campo;
  return error;
}

function numeroEntrada(campo, descripcion) {
  try { return convertirNumero(campo.value, descripcion); }
  catch (error) { error.campo = campo; throw error; }
}

function crearEntrada(valor, clase, etiqueta, tipoEntrada = "text") {
  const entrada = document.createElement("input");
  entrada.type = tipoEntrada;
  entrada.value = valor ?? "";
  entrada.className = clase;
  entrada.setAttribute("aria-label", etiqueta);
  entrada.autocomplete = "off";
  const ejemplos = {
    nombre: "A",
    descripcion: "Actividad",
    predecesoras: "—",
    optimista: "2",
    probable: "4",
    pesimista: "6",
    tiempo: "4"
  };
  entrada.placeholder = ejemplos[clase] || "";
  if (tipoEntrada === "number") {
    entrada.min = "0";
    entrada.step = "any";
    entrada.inputMode = "decimal";
  }
  return entrada;
}

function crearCeldaConEntrada(valor, clase, etiqueta, tipoEntrada = "text", rotuloVisible = etiqueta) {
  const celda = document.createElement("td");
  celda.dataset.label = rotuloVisible;
  celda.append(crearEntrada(valor, clase, etiqueta, tipoEntrada));
  return celda;
}

function actualizarNumeracionFilas() {
  [...elementos.actividades.querySelectorAll("tr")].forEach((fila, indice) => {
    const celdaNumero = fila.querySelector(".numero-fila");
    if (celdaNumero) celdaNumero.textContent = String(indice + 1);
  });
}

function crearBotonFila(texto, etiqueta, clase, accion) {
  const boton = crearElemento("button", "boton-fila " + clase, texto);
  boton.type = "button";
  boton.setAttribute("aria-label", etiqueta);
  boton.addEventListener("click", accion);
  return boton;
}

function agregarActividad(datos = {}, enfocar = false) {
  const fila = document.createElement("tr");
  const celdaNumero = crearElemento("td", "numero-fila");
  celdaNumero.dataset.label = "Fila";
  fila.append(
    celdaNumero,
    crearCeldaConEntrada(datos.nombre ?? "", "nombre", "Identificador de la actividad", "text", "Actividad"),
    crearCeldaConEntrada(datos.descripcion ?? "", "descripcion", "Descripción de la actividad", "text", "Descripción"),
    crearCeldaConEntrada(datos.predecesoras ?? "", "predecesoras", "Predecesoras de la actividad", "text", "Predecesoras")
  );

  if (elementos.tipo.value === "pert") {
    const tiempoBase = datos.duracion ?? "";
    fila.append(
      crearCeldaConEntrada(datos.optimista ?? tiempoBase, "optimista", "Tiempo optimista", "number", "Optimista (a)"),
      crearCeldaConEntrada(datos.probable ?? tiempoBase, "probable", "Tiempo más probable", "number", "Probable (m)"),
      crearCeldaConEntrada(datos.pesimista ?? tiempoBase, "pesimista", "Tiempo pesimista", "number", "Pesimista (b)")
    );
  } else {
    const duracion = datos.duracion ?? datos.probable ?? "";
    fila.append(crearCeldaConEntrada(duracion, "tiempo", "Duración de la actividad", "number", "Duración"));
  }

  const celdaAcciones = crearElemento("td", "celda-acciones");
  celdaAcciones.dataset.label = "Acciones";
  celdaAcciones.append(
    crearBotonFila("×", "Eliminar actividad", "eliminar", () => {
      fila.remove();
      actualizarNumeracionFilas();
      ocultarResultados();
      programarGuardado();
    })
  );
  fila.append(celdaAcciones);
  elementos.actividades.append(fila);
  actualizarNumeracionFilas();

  if (enfocar) fila.querySelector(".nombre").focus();
  return fila;
}

function actualizarEncabezados() {
  const titulos = elementos.tipo.value === "pert"
    ? ["#", "Actividad", "Descripción", "Predecesoras", "Optimista (a)", "Más probable (m)", "Pesimista (b)", "Quitar"]
    : ["#", "Actividad", "Descripción", "Predecesoras", "Duración", "Quitar"];

  const fila = document.createElement("tr");
  titulos.forEach(titulo => {
    const encabezado = document.createElement("th");
    encabezado.scope = "col";
    encabezado.textContent = titulo;
    fila.append(encabezado);
  });
  elementos.encabezados.replaceChildren(fila);
  elementos.grupoPlazo.hidden = elementos.tipo.value !== "pert";
  document.body.dataset.metodo = elementos.tipo.value;
}

function capturarFilasVisuales(tipoFormulario = elementos.tipo.value) {
  return [...elementos.actividades.querySelectorAll("tr")].map(fila => {
    const actividad = {
      nombre: fila.querySelector(".nombre")?.value ?? "",
      descripcion: fila.querySelector(".descripcion")?.value ?? "",
      predecesoras: fila.querySelector(".predecesoras")?.value ?? ""
    };
    if (tipoFormulario === "pert") {
      actividad.optimista = fila.querySelector(".optimista")?.value ?? "";
      actividad.probable = fila.querySelector(".probable")?.value ?? "";
      actividad.pesimista = fila.querySelector(".pesimista")?.value ?? "";
    } else {
      actividad.duracion = fila.querySelector(".tiempo")?.value ?? "";
    }
    return actividad;
  });
}

function cambiarTipoEstimacion() {
  const filasAnteriores = capturarFilasVisuales(tipoAnterior);
  const nuevoTipo = elementos.tipo.value;
  borradoresPorTipo[tipoAnterior] = filasAnteriores;
  elementos.actividades.replaceChildren();
  actualizarEncabezados();
  actualizarCasosProyecto();

  const borradorExistente = borradoresPorTipo[nuevoTipo];
  const filasNuevas = borradorExistente ?? filasAnteriores.map(actividad => {
    if (nuevoTipo === "pert" && tipoAnterior === "cpm") {
      const duracion = actividad.duracion;
      return {
        ...actividad,
        optimista: duracion,
        probable: duracion,
        pesimista: duracion
      };
    }
    if (nuevoTipo === "cpm" && tipoAnterior === "pert") {
      const valores = [actividad.optimista, actividad.probable, actividad.pesimista]
        .map(valor => Number(String(valor).trim().replace(",", ".")));
      const estimacionValida = valores.every(Number.isFinite) && valores[0] <= valores[1] && valores[1] <= valores[2];
      const duracion = estimacionValida
        ? calcularEstimacionPert(...valores).duracion
        : actividad.probable;
      return { ...actividad, duracion };
    }
    return actividad;
  });

  filasNuevas.forEach(actividad => agregarActividad(actividad));

  if (!filasNuevas.length) agregarActividad();
  borradoresPorTipo[nuevoTipo] = capturarFilasVisuales(nuevoTipo);
  tipoAnterior = nuevoTipo;
  ocultarResultados(false);
  elementos.mensaje.textContent = "";
  programarGuardado();
}

function leerDatos() {
  const filas = [...elementos.actividades.querySelectorAll("tr")];
  if (!filas.length) throw new Error("Agregue al menos una actividad.");

  const actividades = filas.map((fila, indice) => {
    const numeroFila = indice + 1;
    const nombre = fila.querySelector(".nombre").value.trim().toUpperCase();
    const descripcion = fila.querySelector(".descripcion").value.trim();
    const predecesoras = fila.querySelector(".predecesoras").value
      .split(",")
      .map(valor => valor.trim().toUpperCase())
      .filter(Boolean);

    if (!nombre) throw errorEntrada("Asigne un identificador a la actividad de la fila " + numeroFila + ".", fila.querySelector(".nombre"));
    if (nombre.includes(",")) throw new Error("El identificador " + nombre + " no puede contener comas.");
    if (new Set(predecesoras).size !== predecesoras.length) {
      throw errorEntrada("La actividad " + nombre + " tiene predecesoras repetidas.", fila.querySelector(".predecesoras"));
    }

    let duracion;
    let varianza = 0;
    let desviacionEstandar = 0;
    let tiempos = null;

    if (elementos.tipo.value === "pert") {
      const tiempoOptimista = numeroEntrada(
        fila.querySelector(".optimista"),
        "El tiempo optimista de " + nombre
      );
      const tiempoProbable = numeroEntrada(
        fila.querySelector(".probable"),
        "El tiempo más probable de " + nombre
      );
      const tiempoPesimista = numeroEntrada(
        fila.querySelector(".pesimista"),
        "El tiempo pesimista de " + nombre
      );

      tiempos = { optimista: tiempoOptimista, probable: tiempoProbable, pesimista: tiempoPesimista };
      let estimacion;
      try {
        estimacion = calcularEstimacionPert(tiempoOptimista, tiempoProbable, tiempoPesimista);
      } catch {
        throw errorEntrada("En " + nombre + " debe cumplirse: optimista ≤ más probable ≤ pesimista.", fila.querySelector(".optimista"));
      }
      ({ duracion, desviacionEstandar, varianza } = estimacion);
    } else {
      duracion = numeroEntrada(
        fila.querySelector(".tiempo"),
        "La duración de " + nombre
      );
    }

    return {
      nombre,
      descripcion,
      predecesoras,
      duracion,
      varianza,
      desviacionEstandar,
      tiempos
    };
  });
  const nombres = new Set(actividades.map(actividad => actividad.nombre));
  const vistos = new Set();
  actividades.forEach((actividad, indice) => {
    if (vistos.has(actividad.nombre)) throw errorEntrada("El identificador " + actividad.nombre + " está repetido.", filas[indice].querySelector(".nombre"));
    vistos.add(actividad.nombre);
    const incorrecta = actividad.predecesoras.find(nombre => !nombres.has(nombre) || nombre === actividad.nombre);
    if (incorrecta) throw errorEntrada(incorrecta === actividad.nombre ? "La actividad " + actividad.nombre + " no puede precederse a sí misma." : "No existe la predecesora " + incorrecta + " indicada en " + actividad.nombre + ".", filas[indice].querySelector(".predecesoras"));
  });
  return actividades;
}

function validarRelaciones(actividades) {
  const actividadesPorNombre = new Map(actividades.map(actividad => [actividad.nombre, actividad]));
  if (actividadesPorNombre.size !== actividades.length) {
    throw new Error("Cada actividad debe tener un identificador único.");
  }

  actividades.forEach(actividad => {
    actividad.predecesoras.forEach(nombrePredecesora => {
      if (!actividadesPorNombre.has(nombrePredecesora)) {
        throw new Error("No existe la predecesora " + nombrePredecesora + " indicada en " + actividad.nombre + ".");
      }
      if (nombrePredecesora === actividad.nombre) {
        throw new Error("La actividad " + actividad.nombre + " no puede precederse a sí misma.");
      }
    });
  });

  return actividadesPorNombre;
}

function ordenarTopologicamente(actividades, actividadesPorNombre, sucesoras) {
  const cantidadPredecesorasPendientes = new Map(
    actividades.map(actividad => [actividad.nombre, actividad.predecesoras.length])
  );
  const cola = actividades
    .filter(actividad => cantidadPredecesorasPendientes.get(actividad.nombre) === 0)
    .map(actividad => actividad.nombre);
  const orden = [];
  let posicionCola = 0;

  while (posicionCola < cola.length) {
    const nombre = cola[posicionCola];
    posicionCola += 1;
    orden.push(actividadesPorNombre.get(nombre));

    sucesoras.get(nombre).forEach(nombreSucesora => {
      const cantidadPendiente = cantidadPredecesorasPendientes.get(nombreSucesora) - 1;
      cantidadPredecesorasPendientes.set(nombreSucesora, cantidadPendiente);
      if (cantidadPendiente === 0) cola.push(nombreSucesora);
    });
  }

  if (orden.length !== actividades.length) {
    throw new Error("Las precedencias forman un ciclo. Revise las relaciones antes de calcular.");
  }
  return orden;
}

function claveConexion(origen, destino) {
  return JSON.stringify([origen, destino]);
}

function obtenerRutasCriticas(orden, actividadesPorNombre, sucesoras, duracionTotal) {
  const conexionesCriticas = new Set();
  orden.forEach(actividad => {
    sucesoras.get(actividad.nombre).forEach(nombreSucesora => {
      const actividadSucesora = actividadesPorNombre.get(nombreSucesora);
      if (
        actividad.critica &&
        actividadSucesora.critica &&
        casiIguales(actividad.finTemprano, actividadSucesora.inicioTemprano)
      ) {
        conexionesCriticas.add(claveConexion(actividad.nombre, nombreSucesora));
      }
    });
  });

  const nombresFinales = new Set(
    orden
      .filter(actividad =>
        sucesoras.get(actividad.nombre).length === 0 &&
        actividad.critica &&
        casiIguales(actividad.finTemprano, duracionTotal)
      )
      .map(actividad => actividad.nombre)
  );

  const actividadesIniciales = orden.filter(actividad =>
    actividad.predecesoras.length === 0 &&
    actividad.critica &&
    casiIguales(actividad.inicioTemprano, 0)
  );

  const rutas = [];
  let rutasTruncadas = false;

  function recorrer(nombreActual, rutaActual) {
    if (rutas.length >= limiteRutasCriticas) {
      rutasTruncadas = true;
      return;
    }
    if (nombresFinales.has(nombreActual)) {
      rutas.push([...rutaActual]);
      return;
    }

    sucesoras.get(nombreActual)
      .filter(nombreSucesora => conexionesCriticas.has(claveConexion(nombreActual, nombreSucesora)))
      .forEach(nombreSucesora => recorrer(nombreSucesora, [...rutaActual, nombreSucesora]));
  }

  actividadesIniciales.forEach(actividad => recorrer(actividad.nombre, [actividad.nombre]));
  return { rutas, rutasTruncadas, conexionesCriticas };
}

function resolverProyecto(datos) {
  const actividades = datos.map(actividad => ({
    ...actividad,
    predecesoras: [...actividad.predecesoras]
  }));
  const actividadesPorNombre = validarRelaciones(actividades);
  const sucesoras = new Map(actividades.map(actividad => [actividad.nombre, []]));

  actividades.forEach(actividad => {
    actividad.predecesoras.forEach(nombrePredecesora => {
      sucesoras.get(nombrePredecesora).push(actividad.nombre);
    });
  });

  const orden = ordenarTopologicamente(actividades, actividadesPorNombre, sucesoras);

  orden.forEach(actividad => {
    actividad.inicioTemprano = actividad.predecesoras.length
      ? Math.max(...actividad.predecesoras.map(nombre => actividadesPorNombre.get(nombre).finTemprano))
      : 0;
    actividad.finTemprano = actividad.inicioTemprano + actividad.duracion;
  });

  const duracionTotal = Math.max(...orden.map(actividad => actividad.finTemprano));

  [...orden].reverse().forEach(actividad => {
    const nombresSucesoras = sucesoras.get(actividad.nombre);
    actividad.finTardio = nombresSucesoras.length
      ? Math.min(...nombresSucesoras.map(nombre => actividadesPorNombre.get(nombre).inicioTardio))
      : duracionTotal;
    actividad.inicioTardio = actividad.finTardio - actividad.duracion;
    actividad.holgura = normalizarCero(actividad.inicioTardio - actividad.inicioTemprano);
    actividad.critica = casiIguales(actividad.holgura, 0);
  });

  const informacionRutas = obtenerRutasCriticas(
    orden,
    actividadesPorNombre,
    sucesoras,
    duracionTotal
  );

  return {
    actividades,
    actividadesPorNombre,
    orden,
    sucesoras,
    duracionTotal,
    ...informacionRutas
  };
}

function aproximarFuncionError(numero) {
  const signo = numero < 0 ? -1 : 1;
  const valor = Math.abs(numero);
  const factor = 1 / (1 + 0.3275911 * valor);
  const polinomio =
    (((((1.061405429 * factor - 1.453152027) * factor) + 1.421413741) * factor - 0.284496736) * factor + 0.254829592) * factor;
  return signo * (1 - polinomio * Math.exp(-valor * valor));
}

function distribucionNormalEstandar(valorZ) {
  return 0.5 * (1 + aproximarFuncionError(valorZ / Math.sqrt(2)));
}

function calcularProbabilidad(plazo, media, desviacionEstandar) {
  if (casiIguales(desviacionEstandar, 0)) {
    return {
      valorZ: plazo >= media ? Infinity : -Infinity,
      probabilidad: plazo >= media ? 1 : 0
    };
  }
  const valorZ = (plazo - media) / desviacionEstandar;
  return { valorZ, probabilidad: distribucionNormalEstandar(valorZ) };
}

function enriquecerRutas(solucion, plazoObjetivo) {
  return solucion.rutas.map(nombres => {
    const actividades = nombres.map(nombre => solucion.actividadesPorNombre.get(nombre));
    const varianza = actividades.reduce((acumulado, actividad) => acumulado + actividad.varianza, 0);
    const desviacionEstandar = Math.sqrt(varianza);
    const resultadoProbabilidad = plazoObjetivo === null
      ? null
      : calcularProbabilidad(plazoObjetivo, solucion.duracionTotal, desviacionEstandar);

    return {
      nombres,
      duracion: actividades.reduce((acumulado, actividad) => acumulado + actividad.duracion, 0),
      varianza,
      desviacionEstandar,
      resultadoProbabilidad
    };
  });
}

function presentarResumen(solucion, rutasDetalladas, plazoObjetivo) {
  const actividadesCriticas = solucion.orden.filter(actividad => actividad.critica);
  document.getElementById("duracion").textContent = formato(solucion.duracionTotal);
  document.getElementById("cantidad-rutas").textContent =
    formato(solucion.rutas.length, 0) + (solucion.rutasTruncadas ? "+" : "");
  document.getElementById("rotulo-rutas").textContent = solucion.rutas.length === 1 ? "ruta" : "rutas";
  document.getElementById("rutas-resumen").textContent = solucion.rutas.length
    ? solucion.rutas.slice(0, 2).map(ruta => ruta.join(" → ")).join(" · ") +
      (solucion.rutas.length > 2 || solucion.rutasTruncadas ? " · …" : "")
    : "No se encontró una secuencia crítica";
  document.getElementById("cantidad-criticas").textContent = formato(actividadesCriticas.length, 0);
  document.getElementById("unidad-resumen").textContent = unidadTiempo();

  const tarjetaPert = document.getElementById("tarjeta-pert");
  tarjetaPert.hidden = elementos.tipo.value !== "pert";
  if (elementos.tipo.value !== "pert") return;

  const rotuloPert = document.getElementById("rotulo-pert");
  const valorPert = document.getElementById("valor-pert");
  const detallePert = document.getElementById("detalle-pert");

  if (!rutasDetalladas.length) {
    rotuloPert.textContent = "Análisis PERT";
    valorPert.textContent = "—";
    detallePert.textContent = "Sin ruta crítica disponible";
    return;
  }

  if (plazoObjetivo === null) {
    rotuloPert.textContent = rutasDetalladas.length === 1
      ? "Desviación estándar"
      : "Desviación por ruta";
    if (rutasDetalladas.length === 1) {
      valorPert.textContent = formato(rutasDetalladas[0].desviacionEstandar);
      detallePert.textContent = "Varianza: " + formato(rutasDetalladas[0].varianza);
    } else {
      const desviaciones = rutasDetalladas.map(ruta => ruta.desviacionEstandar);
      valorPert.textContent =
        formato(Math.min(...desviaciones)) + "–" + formato(Math.max(...desviaciones));
      detallePert.textContent = "Ingrese un plazo para calcular probabilidades";
    }
    return;
  }

  rotuloPert.textContent = "Probabilidad de cumplir";
  if (rutasDetalladas.length === 1) {
    const resultado = rutasDetalladas[0].resultadoProbabilidad;
    valorPert.textContent = formato(resultado.probabilidad * 100, 2) + "%";
    detallePert.textContent =
      "Plazo " + formato(plazoObjetivo) + " · Z = " +
      (Number.isFinite(resultado.valorZ) ? formato(resultado.valorZ) : resultado.valorZ > 0 ? "+∞" : "−∞");
  } else {
    const probabilidades = rutasDetalladas.map(ruta => ruta.resultadoProbabilidad.probabilidad);
    valorPert.textContent = "≤ " + formato(Math.min(...probabilidades) * 100, 2) + "%";
    detallePert.textContent = "Cota superior; revise cada ruta crítica";
  }
}

function presentarTablaResultados(solucion) {
  elementos.resultados.replaceChildren();
  solucion.actividades.forEach(actividadOriginal => {
    const actividad = solucion.actividadesPorNombre.get(actividadOriginal.nombre);
    const fila = document.createElement("tr");
    if (actividad.critica) fila.className = "critica";

    const valores = [
      actividad.nombre,
      actividad.descripcion || "—",
      formato(actividad.duracion),
      formato(actividad.inicioTemprano),
      formato(actividad.finTemprano),
      formato(actividad.inicioTardio),
      formato(actividad.finTardio),
      formato(actividad.holgura)
    ];

    valores.forEach(valor => {
      const celda = document.createElement("td");
      celda.textContent = valor;
      fila.append(celda);
    });

    const celdaEstado = document.createElement("td");
    celdaEstado.append(crearElemento(
      "span",
      actividad.critica ? "insignia insignia-critica" : "insignia",
      actividad.critica ? "Crítica" : "Con holgura"
    ));
    fila.append(celdaEstado);
    elementos.resultados.append(fila);
  });
}

function presentarInterpretacion(solucion, rutasDetalladas, plazoObjetivo) {
  elementos.interpretacion.replaceChildren();
  const actividadesConHolgura = solucion.orden.filter(actividad => !actividad.critica);
  const mayorHolgura = actividadesConHolgura.reduce(
    (mayor, actividad) => !mayor || actividad.holgura > mayor.holgura ? actividad : mayor,
    null
  );

  const lecturas = [
    {
      numero: "01",
      titulo: "Duración mínima",
      texto: "Con las duraciones y precedencias ingresadas, el proyecto termina en " +
        formato(solucion.duracionTotal) + " unidades de tiempo."
    },
    {
      numero: "02",
      titulo: solucion.rutas.length === 1 ? "Ruta que gobierna el proyecto" : "Rutas que gobiernan el proyecto",
      texto: solucion.rutas.length === 1
        ? "La secuencia " + solucion.rutas[0].join(" → ") +
          " no admite retrasos: cualquier demora sin recuperación desplaza la fecha final."
        : "Existen " + formato(solucion.rutas.length, 0) +
          " rutas críticas. Deben vigilarse en paralelo porque cualquiera puede determinar la fecha final."
    },
    {
      numero: "03",
      titulo: "Margen de maniobra",
      texto: mayorHolgura
        ? "La mayor flexibilidad está en " + mayorHolgura.nombre + ", con una holgura total de " +
          formato(mayorHolgura.holgura) + " unidades de tiempo."
        : "Todas las actividades son críticas; el cronograma no contiene margen total disponible."
    }
  ];

  if (elementos.tipo.value === "pert") {
    let textoRiesgo = "Ingrese un plazo objetivo para estimar la probabilidad de cumplimiento.";
    if (plazoObjetivo !== null && rutasDetalladas.length === 1) {
      const probabilidad = rutasDetalladas[0].resultadoProbabilidad.probabilidad * 100;
      const nivel = probabilidad >= 90 ? "alta" : probabilidad >= 70 ? "moderada" : "baja";
      textoRiesgo = "La aproximación normal estima una probabilidad " + nivel + " de " +
        formato(probabilidad, 2) + "% para completar el proyecto antes de " +
        formato(plazoObjetivo) + ".";
    } else if (plazoObjetivo !== null && rutasDetalladas.length > 1) {
      const probabilidades = rutasDetalladas.map(ruta => ruta.resultadoProbabilidad.probabilidad);
      textoRiesgo = "Con varias rutas críticas, " +
        formato(Math.min(...probabilidades) * 100, 2) +
        "% es una cota superior, no la probabilidad exacta del proyecto. Revise cada ruta por separado.";
    }
    lecturas.push({ numero: "04", titulo: "Riesgo del plazo", texto: textoRiesgo });
  }

  lecturas.forEach(lectura => {
    const tarjeta = crearElemento("article", "tarjeta-interpretacion");
    tarjeta.append(
      crearElemento("span", "numero-interpretacion", lectura.numero),
      crearElemento("h4", "", lectura.titulo),
      crearElemento("p", "", lectura.texto)
    );
    elementos.interpretacion.append(tarjeta);
  });

}

function presentarRutas(solucion, rutasDetalladas, plazoObjetivo) {
  elementos.rutasCriticas.replaceChildren();

  if (!rutasDetalladas.length) {
    elementos.rutasCriticas.append(
      crearElemento("p", "nota-desarrollo", "No fue posible construir una ruta crítica completa.")
    );
    return;
  }

  rutasDetalladas.forEach((ruta, indice) => {
    const tarjeta = crearElemento("article", "ruta-critica");
    tarjeta.append(
      crearElemento("span", "numero-ruta", String(indice + 1)),
      crearElemento("div", "secuencia-ruta", ruta.nombres.join(" → "))
    );

    let detalle = "Duración " + formato(ruta.duracion);
    if (elementos.tipo.value === "pert") {
      detalle += " · σ " + formato(ruta.desviacionEstandar);
      if (plazoObjetivo !== null && ruta.resultadoProbabilidad) {
        detalle += " · P(T ≤ " + formato(plazoObjetivo) + ") " +
          formato(ruta.resultadoProbabilidad.probabilidad * 100, 2) + "%";
      }
    }
    tarjeta.append(crearElemento("div", "detalle-ruta", detalle));
    elementos.rutasCriticas.append(tarjeta);
  });

  if (solucion.rutasTruncadas) {
    elementos.rutasCriticas.append(
      crearElemento(
        "p",
        "nota-desarrollo",
        "Se muestran las primeras " + limiteRutasCriticas + " rutas críticas para mantener fluida la interfaz."
      )
    );
  }
}

function crearBloqueDesarrollo(numero, titulo, descripcion, abierto = false) {
  const bloque = crearElemento("details", "bloque-desarrollo");
  bloque.open = abierto;
  const encabezado = crearElemento("summary", "titulo-desarrollo");
  const texto = crearElemento("div");
  texto.append(
    crearElemento("h3", "", titulo),
    crearElemento("p", "", descripcion)
  );
  encabezado.append(
    crearElemento("b", "", String(numero)),
    texto,
    crearElemento("span", "estado-etapa", abierto ? "Ocultar" : "Ver cálculo")
  );
  const contenido = crearElemento("div", "contenido-desarrollo");
  bloque.addEventListener("toggle", () => {
    if (bloque.open) {
      elementos.desarrollo.querySelectorAll(".bloque-desarrollo[open]").forEach(otroBloque => {
        if (otroBloque !== bloque) otroBloque.open = false;
      });
    }
    encabezado.querySelector(".estado-etapa").textContent = bloque.open ? "Ocultar" : "Ver cálculo";
  });
  bloque.append(encabezado, contenido);
  elementos.desarrollo.append(bloque);
  return contenido;
}

function numeroLatex(numero, maximoDecimales = 4) {
  return formato(numero, maximoDecimales).replace(",", "{,}");
}

function crearOperacionNumerica(etiqueta, formulaLatex) {
  const operacion = crearElemento("div", "operacion-calculo");
  const formula = crearElemento("strong", "formula-fallback");
  formula.textContent = "\\(" + formulaLatex + "\\)";
  operacion.append(crearElemento("span", "", etiqueta), formula);
  return operacion;
}

function agregarTarjetaCalculo(contenedor, actividad, operaciones, resultado, estado = "") {
  const tarjeta = crearElemento("article", "tarjeta-calculo" + (actividad.critica ? " calculo-critico" : ""));
  tarjeta.dataset.actividad = actividad.nombre;
  const encabezado = crearElemento("header", "encabezado-calculo");
  const identidad = crearElemento("div", "identidad-calculo");
  identidad.append(
    crearElemento("b", "", actividad.nombre),
    crearElemento("span", "", actividad.descripcion || "Actividad del proyecto")
  );
  const verNodo = crearElemento("button", "ver-nodo", "Nodo");
  verNodo.type = "button";
  verNodo.dataset.actividad = actividad.nombre;
  verNodo.setAttribute("aria-label", "Ver la actividad " + actividad.nombre + " en la red");
  encabezado.append(identidad, verNodo);

  const cuerpo = crearElemento("div", "operaciones-calculo");
  operaciones.forEach(operacion => cuerpo.append(crearOperacionNumerica(operacion.etiqueta, operacion.formula)));

  const pie = crearElemento("footer", "resultado-calculo");
  pie.append(crearElemento("span", "", resultado));
  if (estado) pie.append(crearElemento("b", "", estado));
  tarjeta.append(encabezado, cuerpo, pie);
  contenedor.append(tarjeta);
}

function agregarTarjetaRuta(contenedor, ruta, indice, solucion, plazoObjetivo) {
  const tarjeta = crearElemento("article", "tarjeta-calculo tarjeta-ruta");
  const encabezado = crearElemento("header", "encabezado-calculo");
  const identidad = crearElemento("div", "identidad-calculo");
  identidad.append(
    crearElemento("b", "", "R" + (indice + 1)),
    crearElemento("span", "", ruta.nombres.join(" → "))
  );
  encabezado.append(identidad);

  const cuerpo = crearElemento("div", "operaciones-calculo");
  const varianzas = ruta.nombres.map(nombre => solucion.actividadesPorNombre.get(nombre).varianza);
  cuerpo.append(
    crearOperacionNumerica("Sumar las variaciones", varianzas.map(valor => numeroLatex(valor)).join("+") + "=" + numeroLatex(ruta.varianza)),
    crearOperacionNumerica("Obtener la desviación", "\\sqrt{" + numeroLatex(ruta.varianza) + "}=" + numeroLatex(ruta.desviacionEstandar))
  );
  if (plazoObjetivo !== null && ruta.resultadoProbabilidad) {
    const valorZ = ruta.resultadoProbabilidad.valorZ;
    const zLatex = Number.isFinite(valorZ) ? numeroLatex(valorZ) : valorZ > 0 ? "+\\infty" : "-\\infty";
    cuerpo.append(crearOperacionNumerica(
      "Comparar con el plazo",
      "\\frac{" + numeroLatex(plazoObjetivo) + "-" + numeroLatex(solucion.duracionTotal) + "}{" +
        numeroLatex(ruta.desviacionEstandar) + "}=" + zLatex
    ));
  }

  const probabilidad = plazoObjetivo !== null && ruta.resultadoProbabilidad
    ? "Probabilidad de cumplir: " + formato(ruta.resultadoProbabilidad.probabilidad * 100, 2) + "%"
    : "Desviación de la ruta: " + formato(ruta.desviacionEstandar);
  tarjeta.append(encabezado, cuerpo, crearElemento("footer", "resultado-calculo", probabilidad));
  contenedor.append(tarjeta);
}

function renderizarMatematicas(contenedores = [elementos.desarrollo]) {
  const motor = window.MathJax;
  if (!motor || typeof motor.typesetPromise !== "function") return;
  if (typeof motor.typesetClear === "function") motor.typesetClear(contenedores);
  motor.typesetPromise(contenedores).catch(() => {});
}

function crearResumenVisualNodo(actividad) {
  const nodo = crearElemento(
    "div",
    "nodo-teoria nodo-actividad-dialogo" + (actividad.critica ? "" : " nodo-con-holgura")
  );
  nodo.append(crearElemento(
    "strong",
    "",
    actividad.nombre + " · " + (actividad.descripcion || "Actividad del proyecto")
  ));
  [
    ["Inicio temprano", actividad.inicioTemprano],
    ["Duración", actividad.duracion],
    ["Fin temprano", actividad.finTemprano],
    ["Inicio tardío", actividad.inicioTardio],
    ["Holgura", actividad.holgura],
    ["Fin tardío", actividad.finTardio]
  ].forEach(([etiqueta, valor]) => {
    const celda = crearElemento("span");
    celda.append(crearElemento("small", "", etiqueta), crearElemento("b", "", formato(valor)));
    nodo.append(celda);
  });
  return nodo;
}

function crearPasoProcedimiento(numero, titulo, descripcion, operaciones) {
  const paso = crearElemento("article", "paso-procedimiento-nodo");
  const encabezado = crearElemento("header");
  encabezado.append(
    crearElemento("b", "", String(numero)),
    crearElemento("div")
  );
  encabezado.lastElementChild.append(
    crearElemento("h3", "", titulo),
    crearElemento("p", "", descripcion)
  );
  const cuerpo = crearElemento("div", "operaciones-calculo");
  operaciones.forEach(operacion => cuerpo.append(
    crearOperacionNumerica(operacion.etiqueta, operacion.formula)
  ));
  paso.append(encabezado, cuerpo);
  return paso;
}

function abrirProcedimientoActividad(nombreActividad, solucionDetalle = solucionActual, escenario = "esperado") {
  if (!solucionDetalle) return;
  const actividad = solucionDetalle.actividadesPorNombre.get(nombreActividad);
  if (!actividad) return;
  seleccionarActividad(nombreActividad);

  elementos.tituloDialogoActividad.textContent =
    "Actividad " + actividad.nombre + (actividad.descripcion ? " · " + actividad.descripcion : "") + (escenario !== "esperado" ? " · " + nombreEscenario(escenario) : "");
  elementos.contenidoDialogoActividad.replaceChildren();

  const presentacion = crearElemento("section", "resumen-procedimiento-nodo");
  const estado = crearElemento(
    "p",
    actividad.critica ? "estado-nodo estado-critico" : "estado-nodo estado-con-holgura",
    actividad.critica ? "Actividad crítica · no admite retraso" : "Actividad con " + formato(actividad.holgura) + " de holgura"
  );
  presentacion.append(crearResumenVisualNodo(actividad), estado);
  elementos.contenidoDialogoActividad.append(presentacion);

  let numeroPaso = 1;
  if (elementos.tipo.value === "pert" && actividad.tiempos && escenario === "esperado") {
    elementos.contenidoDialogoActividad.append(crearPasoProcedimiento(
      numeroPaso,
      "Obtener la duración esperada",
      "Se pondera cuatro veces el tiempo más probable.",
      [
        {
          etiqueta: "Tiempo esperado",
          formula: "\\frac{" + numeroLatex(actividad.tiempos.optimista) + "+4\\times" +
            numeroLatex(actividad.tiempos.probable) + "+" + numeroLatex(actividad.tiempos.pesimista) +
            "}{6}=" + numeroLatex(actividad.duracion)
        },
        {
          etiqueta: "Variación estimada",
          formula: "\\left(\\frac{" + numeroLatex(actividad.tiempos.pesimista) + "-" +
            numeroLatex(actividad.tiempos.optimista) + "}{6}\\right)^2=" + numeroLatex(actividad.varianza)
        }
      ]
    ));
    numeroPaso += 1;
  }

  const finalesPredecesoras = actividad.predecesoras.map(nombre =>
    solucionDetalle.actividadesPorNombre.get(nombre).finTemprano
  );
  const formulaInicio = finalesPredecesoras.length > 1
    ? "\\text{Mayor de }\\{" + finalesPredecesoras.map(valor => numeroLatex(valor)).join(",\\;") + "\\}=" + numeroLatex(actividad.inicioTemprano)
    : numeroLatex(finalesPredecesoras[0] ?? 0);
  elementos.contenidoDialogoActividad.append(crearPasoProcedimiento(
    numeroPaso,
    "Recorrido hacia adelante",
    actividad.predecesoras.length
      ? "Toma el final más tardío de sus predecesoras y suma la duración."
      : "Como no tiene predecesoras, comienza con el proyecto.",
    [
      { etiqueta: "Inicio temprano", formula: formulaInicio },
      { etiqueta: "Fin temprano", formula: numeroLatex(actividad.inicioTemprano) + "+" + numeroLatex(actividad.duracion) + "=" + numeroLatex(actividad.finTemprano) }
    ]
  ));
  numeroPaso += 1;

  const nombresSucesoras = solucionDetalle.sucesoras.get(actividad.nombre);
  const iniciosSucesoras = nombresSucesoras.map(nombre =>
    solucionDetalle.actividadesPorNombre.get(nombre).inicioTardio
  );
  const formulaFin = iniciosSucesoras.length > 1
    ? "\\text{Menor de }\\{" + iniciosSucesoras.map(valor => numeroLatex(valor)).join(",\\;") + "\\}=" + numeroLatex(actividad.finTardio)
    : numeroLatex(iniciosSucesoras[0] ?? solucionDetalle.duracionTotal);
  elementos.contenidoDialogoActividad.append(
    crearPasoProcedimiento(
      numeroPaso,
      "Recorrido hacia atrás",
      nombresSucesoras.length
        ? "Toma el inicio más próximo de sus sucesoras y resta la duración."
        : "Como no tiene sucesoras, termina con el proyecto.",
      [
        { etiqueta: "Fin tardío", formula: formulaFin },
        { etiqueta: "Inicio tardío", formula: numeroLatex(actividad.finTardio) + "-" + numeroLatex(actividad.duracion) + "=" + numeroLatex(actividad.inicioTardio) }
      ]
    ),
    crearPasoProcedimiento(
      numeroPaso + 1,
      "Comprobar la holgura",
      "La diferencia entre ambos inicios indica cuánto puede retrasarse.",
      [{ etiqueta: "Holgura total", formula: numeroLatex(actividad.inicioTardio) + "-" + numeroLatex(actividad.inicioTemprano) + "=" + numeroLatex(actividad.holgura) }]
    )
  );

  elementos.dialogoActividad.showModal();
  renderizarMatematicas([elementos.contenidoDialogoActividad]);
}

function presentarDesarrollo(solucion, rutasDetalladas, plazoObjetivo) {
  elementos.desarrollo.replaceChildren();
  let numeroBloque = 1;

  if (elementos.tipo.value === "pert") {
    const contenidoPert = crearBloqueDesarrollo(
      numeroBloque,
      "Convertir las tres estimaciones",
      "Optimista, probable y pesimista se convierten en una duración esperada.",
      true
    );
    numeroBloque += 1;
    solucion.orden.forEach(actividad => {
      const tiempos = actividad.tiempos;
      agregarTarjetaCalculo(
        contenidoPert,
        actividad,
        [
          {
            etiqueta: "Duración esperada",
            formula: "\\frac{" + numeroLatex(tiempos.optimista) + "+4\\times" +
              numeroLatex(tiempos.probable) + "+" + numeroLatex(tiempos.pesimista) +
              "}{6}=" + numeroLatex(actividad.duracion)
          },
          {
            etiqueta: "Variación estimada",
            formula: "\\left(\\frac{" + numeroLatex(tiempos.pesimista) + "-" +
              numeroLatex(tiempos.optimista) + "}{6}\\right)^2=" + numeroLatex(actividad.varianza)
          }
        ],
        "Duración usada: " + formato(actividad.duracion)
      );
    });
  }

  const contenidoAdelante = crearBloqueDesarrollo(
    numeroBloque,
    "Avanzar por la red",
    "Elegir el final mayor de las predecesoras y sumar la duración.",
    elementos.tipo.value !== "pert"
  );
  numeroBloque += 1;
  solucion.orden.forEach(actividad => {
    const finalesPredecesoras = actividad.predecesoras.map(nombre =>
      solucion.actividadesPorNombre.get(nombre).finTemprano
    );
    const formulaInicio = finalesPredecesoras.length > 1
      ? "\\text{Mayor de }\\{" + finalesPredecesoras.map(valor => numeroLatex(valor)).join(",\\;") + "\\}=" + numeroLatex(actividad.inicioTemprano)
      : numeroLatex(finalesPredecesoras[0] ?? 0);
    agregarTarjetaCalculo(
      contenidoAdelante,
      actividad,
      [
        { etiqueta: actividad.predecesoras.length ? "Elegir cuándo puede empezar" : "Comienza con el proyecto", formula: formulaInicio },
        { etiqueta: "Sumar su duración", formula: numeroLatex(actividad.inicioTemprano) + "+" + numeroLatex(actividad.duracion) + "=" + numeroLatex(actividad.finTemprano) }
      ],
      "Empieza en " + formato(actividad.inicioTemprano) + " · Termina en " + formato(actividad.finTemprano)
    );
  });

  const contenidoAtras = crearBloqueDesarrollo(
    numeroBloque,
    "Retroceder desde el final",
    "Elegir el inicio menor de las sucesoras y restar la duración."
  );
  numeroBloque += 1;
  [...solucion.orden].reverse().forEach(actividad => {
    const nombresSucesoras = solucion.sucesoras.get(actividad.nombre);
    const iniciosSucesoras = nombresSucesoras.map(nombre =>
      solucion.actividadesPorNombre.get(nombre).inicioTardio
    );
    const formulaFin = iniciosSucesoras.length > 1
      ? "\\text{Menor de }\\{" + iniciosSucesoras.map(valor => numeroLatex(valor)).join(",\\;") + "\\}=" + numeroLatex(actividad.finTardio)
      : numeroLatex(iniciosSucesoras[0] ?? solucion.duracionTotal);
    agregarTarjetaCalculo(
      contenidoAtras,
      actividad,
      [
        { etiqueta: nombresSucesoras.length ? "Elegir cuándo debe terminar" : "Termina con el proyecto", formula: formulaFin },
        { etiqueta: "Restar su duración", formula: numeroLatex(actividad.finTardio) + "-" + numeroLatex(actividad.duracion) + "=" + numeroLatex(actividad.inicioTardio) }
      ],
      "Puede empezar hasta " + formato(actividad.inicioTardio) + " · Terminar hasta " + formato(actividad.finTardio)
    );
  });

  const contenidoHolguras = crearBloqueDesarrollo(
    numeroBloque,
    "Calcular el margen disponible",
    "Comparar el inicio tardío con el temprano; cero significa actividad crítica."
  );
  numeroBloque += 1;
  solucion.orden.forEach(actividad => {
    agregarTarjetaCalculo(
      contenidoHolguras,
      actividad,
      [{ etiqueta: "Restar ambos inicios", formula: numeroLatex(actividad.inicioTardio) + "-" + numeroLatex(actividad.inicioTemprano) + "=" + numeroLatex(actividad.holgura) }],
      actividad.critica ? "No admite retraso" : "Puede retrasarse " + formato(actividad.holgura),
      actividad.critica ? "Crítica" : "Con margen"
    );
  });

  if (elementos.tipo.value === "pert" && rutasDetalladas.length) {
    const contenidoProbabilidad = crearBloqueDesarrollo(
      numeroBloque,
      "Estimar el cumplimiento del plazo",
      "Sumar la incertidumbre de cada ruta crítica y compararla con el plazo objetivo."
    );
    rutasDetalladas.forEach((ruta, indice) => {
      agregarTarjetaRuta(contenidoProbabilidad, ruta, indice, solucion, plazoObjetivo);
    });

    if (rutasDetalladas.length > 1) {
      contenidoProbabilidad.append(
        crearElemento(
          "p",
          "nota-desarrollo",
          "Con varias rutas críticas, calcular cada ruta por separado no produce una probabilidad exacta del proyecto: las duraciones pueden estar correlacionadas por actividades compartidas. Se presenta la aproximación de cada ruta y una cota superior en el resumen."
        )
      );
    }
  }

  renderizarMatematicas();
}

function truncarTexto(texto, longitudMaxima) {
  return texto.length > longitudMaxima
    ? texto.slice(0, longitudMaxima - 1) + "…"
    : texto;
}

function agregarTextoSvg(grupo, texto, atributos) {
  const elementoTexto = crearElementoSvg("text", atributos);
  elementoTexto.textContent = texto;
  grupo.append(elementoTexto);
  return elementoTexto;
}

function dibujarNodoActividad(svg, actividad, posicion) {
  const anchoNodo = 252;
  const altoEncabezado = 42;
  const altoCelda = 48;
  const altoNodo = altoEncabezado + altoCelda * 2;
  const anchoCelda = anchoNodo / 3;
  const colorBorde = actividad.critica ? "#d85c43" : "#267d78";
  const colorEncabezado = actividad.critica
    ? "url(#degradado-nodo-critico)"
    : "url(#degradado-nodo-normal)";
  const colorFondo = actividad.critica ? "#fffaf6" : "#ffffff";
  const grupo = crearElementoSvg("g", {
    transform: "translate(" + posicion.x + " " + posicion.y + ")",
    "data-nodo-actividad": actividad.nombre,
    "data-x": posicion.x,
    "data-y": posicion.y,
    role: "button",
    tabindex: 0,
    "aria-label": "Abrir procedimiento de la actividad " + actividad.nombre
  });

  const tituloAccesible = crearElementoSvg("title");
  tituloAccesible.textContent =
    actividad.nombre + (actividad.descripcion ? " · " + actividad.descripcion : "") +
    ". Inicio temprano " + formato(actividad.inicioTemprano) +
    ", duración " + formato(actividad.duracion) +
    ", fin temprano " + formato(actividad.finTemprano) +
    ", inicio tardío " + formato(actividad.inicioTardio) +
    ", holgura " + formato(actividad.holgura) +
    ", fin tardío " + formato(actividad.finTardio) + ".";
  grupo.append(tituloAccesible);

  grupo.append(
    crearElementoSvg("rect", {
      width: anchoNodo,
      height: altoNodo,
      rx: 16,
      fill: colorFondo,
      stroke: colorBorde,
      "stroke-width": actividad.critica ? 2.8 : 2,
      filter: "url(#sombra-nodo)"
    }),
    crearElementoSvg("path", {
      d: "M 16 0 H " + (anchoNodo - 16) + " Q " + anchoNodo + " 0 " + anchoNodo +
        " 16 V " + altoEncabezado + " H 0 V 16 Q 0 0 16 0 Z",
      fill: colorEncabezado
    }),
    crearElementoSvg("rect", {
      x: anchoCelda,
      y: altoEncabezado,
      width: anchoCelda,
      height: altoCelda,
      fill: actividad.critica ? "#fff0e9" : "#fff7df"
    }),
    crearElementoSvg("rect", {
      x: anchoCelda,
      y: altoEncabezado + altoCelda,
      width: anchoCelda,
      height: altoCelda,
      fill: actividad.critica ? "#ffe6df" : "#eaf7f3"
    })
  );

  grupo.append(crearElementoSvg("rect", {
    x: 10,
    y: 8,
    width: 47,
    height: 26,
    rx: 8,
    fill: actividad.critica ? "rgba(89, 25, 17, .22)" : "rgba(255, 255, 255, .14)",
    stroke: "rgba(255, 255, 255, .28)"
  }));
  agregarTextoSvg(grupo, truncarTexto(actividad.nombre, 5), {
    x: 33.5,
    y: 26,
    "text-anchor": "middle",
    "font-size": 12,
    "font-weight": 800,
    fill: actividad.critica ? "#fff7ef" : "#f7d77e"
  });
  agregarTextoSvg(grupo, truncarTexto(actividad.descripcion || "Actividad del proyecto", 27), {
    x: 68,
    y: 26,
    "font-size": 11.5,
    "font-weight": 700,
    fill: "#ffffff"
  });

  grupo.append(
    crearElementoSvg("line", {
      x1: 0,
      y1: altoEncabezado + altoCelda,
      x2: anchoNodo,
      y2: altoEncabezado + altoCelda,
      stroke: colorBorde,
      "stroke-opacity": 0.24
    }),
    crearElementoSvg("line", {
      x1: anchoCelda,
      y1: altoEncabezado,
      x2: anchoCelda,
      y2: altoNodo,
      stroke: colorBorde,
      "stroke-opacity": 0.24
    }),
    crearElementoSvg("line", {
      x1: anchoCelda * 2,
      y1: altoEncabezado,
      x2: anchoCelda * 2,
      y2: altoNodo,
      stroke: colorBorde,
      "stroke-opacity": 0.24
    })
  );

  const celdas = [
    { etiqueta: "IT", valor: actividad.inicioTemprano, columna: 0, fila: 0 },
    { etiqueta: "Dur.", valor: actividad.duracion, columna: 1, fila: 0 },
    { etiqueta: "FT", valor: actividad.finTemprano, columna: 2, fila: 0 },
    { etiqueta: "ITa", valor: actividad.inicioTardio, columna: 0, fila: 1 },
    { etiqueta: "H", valor: actividad.holgura, columna: 1, fila: 1 },
    { etiqueta: "FTa", valor: actividad.finTardio, columna: 2, fila: 1 }
  ];

  celdas.forEach(celda => {
    const centroX = celda.columna * anchoCelda + anchoCelda / 2;
    const inicioY = altoEncabezado + celda.fila * altoCelda;
    agregarTextoSvg(grupo, celda.etiqueta, {
      x: centroX,
      y: inicioY + 16,
      "text-anchor": "middle",
      "font-size": 8,
      "font-weight": 800,
      "letter-spacing": 0.8,
      fill: "#7b827f"
    });
    agregarTextoSvg(grupo, formato(celda.valor), {
      x: centroX,
      y: inicioY + 38,
      "text-anchor": "middle",
      "font-size": 15,
      "font-weight": 800,
      fill: celda.etiqueta === "H"
        ? actividad.critica ? "#bd432f" : "#1f7468"
        : "#18354f"
    });
  });

  svg.append(grupo);
}

function dibujarNodoVirtual(svg, texto, posicion) {
  const ancho = 104;
  const alto = 52;
  const grupo = crearElementoSvg("g", {
    transform: "translate(" + posicion.x + " " + posicion.y + ")"
  });
  const esInicio = texto === "Inicio";
  grupo.append(
    crearElementoSvg("rect", {
      width: ancho,
      height: alto,
      rx: 16,
      fill: esInicio ? "url(#degradado-nodo-normal)" : "url(#degradado-nodo-final)",
      stroke: esInicio ? "#d6ad4b" : "#b9882e",
      "stroke-width": 2,
      filter: "url(#sombra-nodo)"
    })
  );
  agregarTextoSvg(grupo, texto, {
    x: ancho / 2,
    y: 33,
    "text-anchor": "middle",
    "font-size": 13,
    "font-weight": 850,
    fill: esInicio ? "#ffffff" : "#17354f"
  });
  svg.append(grupo);
}

// Capas con pasos de conexión invisibles: las aristas largas atraviesan espacios
// reservados, no los cuadros de actividades ni un carril exterior de toda la red.
function calcularDisposicionRed(solucion) {
  const anchoActividad = 252;
  const altoActividad = 138;
  const anchoVirtual = 104;
  const margen = 42;
  const niveles = new Map();
  solucion.orden.forEach(actividad => niveles.set(actividad.nombre,
    actividad.predecesoras.length
      ? 1 + Math.max(...actividad.predecesoras.map(nombre => niveles.get(nombre)))
      : 1
  ));
  const ultimoNivel = Math.max(...niveles.values()) + 1;
  niveles.set("__INICIO__", 0);
  niveles.set("__FIN__", ultimoNivel);
  const capas = Array.from({ length: ultimoNivel + 1 }, () => []);
  const vertices = new Map();
  function agregarVertice(id, nivel, auxiliar = false) {
    const virtual = id === "__INICIO__" || id === "__FIN__";
    const vertice = { id, nivel, auxiliar, alto: auxiliar ? 10 : virtual ? 52 : altoActividad,
      ancho: virtual ? anchoVirtual : anchoActividad, anteriores: [], siguientes: [], centro: 0 };
    vertices.set(id, vertice);
    capas[nivel].push(vertice);
    return vertice;
  }
  agregarVertice("__INICIO__", 0);
  solucion.orden.forEach(actividad => agregarVertice(actividad.nombre, niveles.get(actividad.nombre)));
  agregarVertice("__FIN__", ultimoNivel);
  const conexiones = [];
  function agregarConexion(origen, destino, critica) {
    const conexion = { origen, destino, critica, pasos: [vertices.get(origen)] };
    for (let nivel = niveles.get(origen) + 1; nivel < niveles.get(destino); nivel += 1) {
      conexion.pasos.push(agregarVertice(Symbol("paso-conexion"), nivel, true));
    }
    conexion.pasos.push(vertices.get(destino));
    conexion.pasos.forEach((vertice, indice, pasos) => {
      if (!indice) return;
      const anterior = pasos[indice - 1];
      anterior.siguientes.push({ vertice, conexion });
      vertice.anteriores.push({ vertice: anterior, conexion });
    });
    conexiones.push(conexion);
  }
  solucion.orden.forEach(actividad => {
    if (!actividad.predecesoras.length) agregarConexion("__INICIO__", actividad.nombre,
      actividad.critica && casiIguales(actividad.inicioTemprano, 0));
    actividad.predecesoras.forEach(origen => agregarConexion(origen, actividad.nombre,
      solucion.conexionesCriticas.has(claveConexion(origen, actividad.nombre))));
    if (!solucion.sucesoras.get(actividad.nombre).length) agregarConexion(actividad.nombre, "__FIN__",
      actividad.critica && casiIguales(actividad.finTemprano, solucion.duracionTotal));
  });

  // Barridos baricéntricos, incluyendo los pasos de aristas que saltan niveles.
  // Se conserva el orden con menos cruces encontrado para evitar oscilaciones.
  function indicesActuales() {
    return new Map(capas.flatMap(capa => capa.map((vertice, indice) => [vertice.id, indice])));
  }
  function contarCruces() {
    const indices = indicesActuales();
    let cruces = 0;
    capas.slice(0, -1).forEach(capa => {
      const segmentos = capa.flatMap(vertice => vertice.siguientes.map(enlace => ({
        a: indices.get(vertice.id), b: indices.get(enlace.vertice.id)
      })));
      segmentos.forEach((segmento, i) => {
        for (let j = i + 1; j < segmentos.length; j += 1) {
          if ((segmento.a - segmentos[j].a) * (segmento.b - segmentos[j].b) < 0) cruces += 1;
        }
      });
    });
    return cruces;
  }
  let mejorOrden = capas.map(capa => [...capa]);
  let menosCruces = contarCruces();
  for (let pasada = 0; pasada < 12; pasada += 1) {
    const adelante = pasada % 2 === 0;
    for (let i = 1; i < capas.length; i += 1) {
      const nivel = adelante ? i : ultimoNivel - i;
      const indices = indicesActuales();
      const centros = new Map(capas[nivel].map(vertice => {
        const vecinos = adelante ? vertice.anteriores : vertice.siguientes;
        const suma = vecinos.reduce((total, enlace) => total + indices.get(enlace.vertice.id), 0);
        return [vertice.id, vecinos.length ? suma / vecinos.length : indices.get(vertice.id)];
      }));
      capas[nivel].sort((a, b) => centros.get(a.id) - centros.get(b.id) || indices.get(a.id) - indices.get(b.id));
    }
    const cruces = contarCruces();
    if (cruces <= menosCruces) {
      menosCruces = cruces;
      mejorOrden = capas.map(capa => [...capa]);
    }
  }
  capas.forEach((capa, nivel) => capa.splice(0, capa.length, ...mejorOrden[nivel]));

  function separacion(a, b) {
    return (a.alto + b.alto) / 2 + (a.auxiliar && b.auxiliar ? 18 : 38);
  }
  const alturas = capas.map(capa => {
    let altura = 0;
    capa.forEach((vertice, indice) => {
      vertice.centro = indice ? capa[indice - 1].centro + separacion(capa[indice - 1], vertice) : vertice.alto / 2;
      altura = vertice.centro + vertice.alto / 2;
    });
    return altura;
  });
  const alturaInicial = Math.max(...alturas);
  capas.forEach((capa, nivel) => capa.forEach(vertice => { vertice.centro += (alturaInicial - alturas[nivel]) / 2; }));

  // Proyección isotónica: aproxima las ramas relacionadas sin permitir solapes.
  function alinearCapa(capa, adelante) {
    const desplazamientos = [];
    const bloques = [];
    capa.forEach((vertice, indice) => {
      desplazamientos[indice] = indice ? desplazamientos[indice - 1] + separacion(capa[indice - 1], vertice) : 0;
      const vecinos = adelante ? vertice.anteriores : vertice.siguientes;
      const peso = vecinos.reduce((total, enlace) => total + (enlace.conexion.critica ? 3 : 1), 0);
      const centroVecinos = peso ? vecinos.reduce((total, enlace) => total + enlace.vertice.centro * (enlace.conexion.critica ? 3 : 1), 0) / peso : vertice.centro;
      const objetivo = (centroVecinos * .8 + vertice.centro * .2) - desplazamientos[indice];
      bloques.push({ inicio: indice, fin: indice, suma: objetivo, peso: 1 });
      while (bloques.length > 1) {
        const b = bloques[bloques.length - 1];
        const a = bloques[bloques.length - 2];
        if (a.suma / a.peso <= b.suma / b.peso) break;
        a.fin = b.fin;
        a.suma += b.suma;
        a.peso += b.peso;
        bloques.pop();
      }
    });
    bloques.forEach(bloque => {
      for (let i = bloque.inicio; i <= bloque.fin; i += 1) capa[i].centro = bloque.suma / bloque.peso + desplazamientos[i];
    });
  }
  for (let pasada = 0; pasada < 16; pasada += 1) {
    const adelante = pasada % 2 === 0;
    for (let i = 0; i <= ultimoNivel; i += 1) alinearCapa(capas[adelante ? i : ultimoNivel - i], adelante);
  }
  const minimoY = Math.min(...[...vertices.values()].map(vertice => vertice.centro - vertice.alto / 2));
  const posiciones = new Map();
  vertices.forEach(vertice => {
    const x = vertice.nivel === 0 ? margen
      : vertice.nivel === ultimoNivel ? margen + anchoVirtual + 70 + (ultimoNivel - 2) * 346 + anchoActividad + 70
        : margen + anchoVirtual + 70 + (vertice.nivel - 1) * 346;
    vertice.x = x;
    vertice.centro += margen - minimoY;
    posiciones.set(vertice.id, { x, y: vertice.centro - vertice.alto / 2 });
  });
  const entrantes = new Map([...vertices.keys()].map(id => [id, []]));
  const salientes = new Map([...vertices.keys()].map(id => [id, []]));
  conexiones.forEach(conexion => {
    salientes.get(conexion.origen).push(conexion);
    entrantes.get(conexion.destino).push(conexion);
  });
  salientes.forEach(lista => {
    lista.sort((a, b) => a.pasos[1].centro - b.pasos[1].centro);
    lista.forEach((conexion, indice) => { conexion.salidaY = posiciones.get(conexion.origen).y + posicionAnclaje(indice, lista.length, vertices.get(conexion.origen).alto); });
  });
  entrantes.forEach(lista => {
    lista.sort((a, b) => a.pasos[a.pasos.length - 2].centro - b.pasos[b.pasos.length - 2].centro);
    lista.forEach((conexion, indice) => { conexion.entradaY = posiciones.get(conexion.destino).y + posicionAnclaje(indice, lista.length, vertices.get(conexion.destino).alto); });
  });
  const segmentosPorNivel = Array.from({ length: ultimoNivel }, () => []);
  conexiones.forEach(conexion => {
    conexion.segmentos = conexion.pasos.slice(0, -1).map((origen, indice) => {
      const destino = conexion.pasos[indice + 1];
      const segmento = { origen, destino, y1: indice === 0 ? conexion.salidaY : origen.centro,
        y2: indice === conexion.pasos.length - 2 ? conexion.entradaY : destino.centro };
      segmentosPorNivel[origen.nivel].push(segmento);
      return segmento;
    });
  });
  segmentosPorNivel.forEach(segmentos => {
    const carriles = [];
    segmentos.sort((a, b) => Math.abs(b.y2 - b.y1) - Math.abs(a.y2 - a.y1));
    segmentos.forEach(segmento => {
      const inicio = Math.min(segmento.y1, segmento.y2) - 8;
      const fin = Math.max(segmento.y1, segmento.y2) + 8;
      let indice = carriles.findIndex(intervalos => intervalos.every(intervalo => fin < intervalo.inicio || inicio > intervalo.fin));
      if (indice === -1) { indice = carriles.length; carriles.push([]); }
      carriles[indice].push({ inicio, fin });
      segmento.carril = indice;
    });
    segmentos.forEach(segmento => {
      const x1 = segmento.origen.x + segmento.origen.ancho;
      const x2 = segmento.destino.x;
      segmento.x = x1 + 16 + (x2 - x1 - 32) * (segmento.carril + 1) / (carriles.length + 1);
    });
  });
  conexiones.forEach(conexion => {
    conexion.puntos = [];
    conexion.segmentos.forEach(segmento => conexion.puntos.push(
      { x: segmento.origen.x + segmento.origen.ancho, y: segmento.y1 },
      { x: segmento.x, y: segmento.y1 },
      { x: segmento.x, y: segmento.y2 },
      { x: segmento.destino.x, y: segmento.y2 }
    ));
  });
  return { posiciones, conexiones, ancho: vertices.get("__FIN__").x + anchoVirtual + margen,
    alto: Math.max(350, ...[...vertices.values()].map(vertice => vertice.centro + vertice.alto / 2 + margen)) };
}

function crearRutaOrtogonal(puntos, radio = 12) {
  const puntosUnicos = puntos.filter((punto, indice) =>
    indice === 0 || punto.x !== puntos[indice - 1].x || punto.y !== puntos[indice - 1].y
  );
  if (puntosUnicos.length < 2) return "";
  let ruta = "M " + puntosUnicos[0].x + " " + puntosUnicos[0].y;

  for (let indice = 1; indice < puntosUnicos.length - 1; indice += 1) {
    const anterior = puntosUnicos[indice - 1];
    const actual = puntosUnicos[indice];
    const siguiente = puntosUnicos[indice + 1];
    const distanciaEntrada = Math.hypot(actual.x - anterior.x, actual.y - anterior.y);
    const distanciaSalida = Math.hypot(siguiente.x - actual.x, siguiente.y - actual.y);
    const radioReal = Math.min(radio, distanciaEntrada / 2, distanciaSalida / 2);
    const antes = {
      x: actual.x - ((actual.x - anterior.x) / distanciaEntrada) * radioReal,
      y: actual.y - ((actual.y - anterior.y) / distanciaEntrada) * radioReal
    };
    const despues = {
      x: actual.x + ((siguiente.x - actual.x) / distanciaSalida) * radioReal,
      y: actual.y + ((siguiente.y - actual.y) / distanciaSalida) * radioReal
    };
    ruta += " L " + antes.x + " " + antes.y +
      " Q " + actual.x + " " + actual.y + " " + despues.x + " " + despues.y;
  }

  const ultimo = puntosUnicos[puntosUnicos.length - 1];
  return ruta + " L " + ultimo.x + " " + ultimo.y;
}

function posicionAnclaje(indice, cantidad, altoNodo) {
  if (cantidad <= 1) return altoNodo / 2;
  const margen = Math.min(34, altoNodo * 0.24);
  return margen + indice * ((altoNodo - margen * 2) / (cantidad - 1));
}

function dibujarRed(solucion) {
  elementos.red.replaceChildren();
  svgRed = null;

  const { posiciones, conexiones, ancho, alto } = calcularDisposicionRed(solucion);

  const svg = crearElementoSvg("svg", {
    viewBox: "0 0 " + ancho + " " + alto,
    role: "group",
    "aria-label": "Diagrama de actividades en nodos con tiempos tempranos, tardíos y holguras"
  });
  const definiciones = crearElementoSvg("defs");
  const filtro = crearElementoSvg("filter", {
    id: "sombra-nodo",
    x: "-20%",
    y: "-20%",
    width: "140%",
    height: "150%"
  });
  filtro.append(
    crearElementoSvg("feDropShadow", {
      dx: 0,
      dy: 5,
      stdDeviation: 6,
      "flood-color": "#25375c",
      "flood-opacity": 0.13
    })
  );

  [
    { id: "degradado-nodo-normal", inicio: "#173f66", fin: "#0b273f" },
    { id: "degradado-nodo-critico", inicio: "#b94432", fin: "#e27050" },
    { id: "degradado-nodo-final", inicio: "#f3d782", fin: "#d6ad4b" }
  ].forEach(configuracion => {
    const degradado = crearElementoSvg("linearGradient", {
      id: configuracion.id,
      x1: "0%",
      y1: "0%",
      x2: "100%",
      y2: "100%"
    });
    degradado.append(
      crearElementoSvg("stop", { offset: "0%", "stop-color": configuracion.inicio }),
      crearElementoSvg("stop", { offset: "100%", "stop-color": configuracion.fin })
    );
    definiciones.append(degradado);
  });

  [
    { id: "flecha-normal", color: "#4f8885" },
    { id: "flecha-critica", color: "#d85c43" }
  ].forEach(configuracion => {
    const marcador = crearElementoSvg("marker", {
      id: configuracion.id,
      viewBox: "0 0 10 10",
      refX: 9,
      refY: 5,
      markerWidth: 7,
      markerHeight: 7,
      orient: "auto-start-reverse"
    });
    marcador.append(
      crearElementoSvg("path", {
        d: "M 0 0 L 10 5 L 0 10 z",
        fill: configuracion.color
      })
    );
    definiciones.append(marcador);
  });
  definiciones.append(filtro);
  svg.append(definiciones);

  const grupoConexiones = crearElementoSvg("g", { class: "conexiones-red" });
  conexiones.sort((a, b) => Number(a.critica) - Number(b.critica)).forEach(conexion => {
    const color = conexion.critica ? "#d85c43" : "#4f8885";
    const ruta = crearRutaOrtogonal(conexion.puntos, 10);
    grupoConexiones.append(
      crearElementoSvg("path", {
        d: ruta,
        fill: "none",
        stroke: "#f7fafb",
        "stroke-width": conexion.critica ? 7.4 : 5.6,
        "stroke-linecap": "round",
        "stroke-linejoin": "round"
      }),
      crearElementoSvg("path", {
        d: ruta,
        fill: "none",
        stroke: color,
        "stroke-width": conexion.critica ? 3.2 : 2.1,
        "stroke-opacity": conexion.critica ? 1 : 0.88,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "marker-end": "url(#" + (conexion.critica ? "flecha-critica" : "flecha-normal") + ")",
        "data-conexion-origen": conexion.origen,
        "data-conexion-destino": conexion.destino,
        "data-enrutamiento": conexion.pasos.length > 2 ? "por-niveles" : "directo"
      })
    );
  });
  svg.append(grupoConexiones);

  dibujarNodoVirtual(svg, "Inicio", posiciones.get("__INICIO__"));
  solucion.orden.forEach(actividad => dibujarNodoActividad(svg, actividad, posiciones.get(actividad.nombre)));
  dibujarNodoVirtual(svg, "Fin", posiciones.get("__FIN__"));

  elementos.red.append(svg);
  svgRed = svg;
  dimensionesRed = { ancho, alto };
  restablecerEscalaRed();
}

function obtenerDuracionEscenario(actividad, escenario) {
  if (escenario === "esperado" || !actividad.tiempos) {
    return actividad.duracion;
  }
  return actividad.tiempos[escenario];
}

function calcularEscenarioGantt(solucion, escenario) {
  const datos = solucion.orden.map(actividad => ({
    ...actividad, duracion: obtenerDuracionEscenario(actividad, escenario)
  }));
  const recalculada = resolverProyecto(datos);
  return {
    actividades: recalculada.orden.map(actividad => ({
      actividad, inicio: actividad.inicioTemprano,
      duracion: actividad.duracion, fin: actividad.finTemprano
    })),
    duracionTotal: recalculada.duracionTotal,
    solucion: recalculada
  };
}

function calcularPasoEscala(valorMaximo) {
  if (valorMaximo <= 10) return 1;
  const pasoAproximado = valorMaximo / 10;
  const magnitud = 10 ** Math.floor(Math.log10(pasoAproximado));
  const normalizado = pasoAproximado / magnitud;
  return (normalizado <= 1 ? 1 : normalizado <= 2 ? 2 : normalizado <= 5 ? 5 : 10) * magnitud;
}

function dibujarGantt(solucion, escenario = "esperado", ajustar = true) {
  const desplazamiento = { left: elementos.gantt.scrollLeft, top: elementos.gantt.scrollTop };
  elementos.gantt.replaceChildren();
  programaGantt = calcularEscenarioGantt(solucion, escenario);
  const programa = programaGantt;
  const soloCriticas = document.getElementById("solo-criticas").checked;
  const visibles = programa.actividades.filter(dato => !soloCriticas || dato.actividad.critica);
  const anchoEtiquetas = window.innerWidth < 560 ? 142 : 208;
  const anchoDisponible = Math.max(320, elementos.gantt.clientWidth - anchoEtiquetas - 2);
  if (ajustar) escalaGantt = 1;
  const anchoTiempo = Math.round(anchoDisponible * escalaGantt);
  const altoFila = 62;
  const altoCabecera = 48;
  const limite = Math.max(1, programa.duracionTotal);
  const escala = anchoTiempo / limite;
  const paso = calcularPasoEscala(limite * Math.max(.5, 700 / anchoTiempo));
  const lienzo = crearElemento("div", "gantt-lienzo");
  lienzo.style.width = anchoEtiquetas + anchoTiempo + "px";
  lienzo.style.setProperty("--etiqueta-gantt", anchoEtiquetas + "px");
  lienzo.style.setProperty("--paso-gantt", paso / limite * 100 + "%");
  const cabecera = crearElemento("div", "gantt-cabecera");
  cabecera.append(crearElemento("div", "gantt-esquina", "Actividad"));
  const regla = crearElemento("div", "gantt-regla");
  regla.setAttribute("aria-label", "Escala en " + unidadTiempo());
  const tiempos = [];
  for (let tiempo = 0; tiempo < limite; tiempo += paso) tiempos.push(tiempo);
  tiempos.push(limite);
  tiempos.forEach((tiempo, indice) => {
    const marca = crearElemento("span", "gantt-marca", formato(tiempo, 2));
    marca.style.left = tiempo / limite * 100 + "%";
    if (indice === 0) marca.classList.add("marca-inicial");
    if (indice === tiempos.length - 1) marca.classList.add("marca-final");
    if (indice === tiempos.length - 2 && limite - tiempo < paso * .4) marca.hidden = true;
    regla.append(marca);
  });
  regla.append(crearElemento("small", "gantt-unidad", unidadTiempo()));
  cabecera.append(regla);
  lienzo.append(cabecera);
  const indices = new Map();
  visibles.forEach((dato, indice) => {
    const actividad = dato.actividad;
    indices.set(actividad.nombre, indice);
    const fila = crearElemento("div", "gantt-fila" + (actividad.critica ? " gantt-fila-critica" : ""));
    fila.dataset.actividad = actividad.nombre;
    const nombre = crearElemento("button", "gantt-identidad");
    nombre.type = "button";
    nombre.append(crearElemento("b", "", actividad.nombre), crearElemento("span", "", actividad.descripcion || "Actividad " + actividad.nombre));
    nombre.title = actividad.nombre + (actividad.descripcion ? " · " + actividad.descripcion : "");
    nombre.setAttribute("aria-label", "Ver procedimiento de " + actividad.nombre);
    const pista = crearElemento("div", "gantt-pista");
    if (document.getElementById("mostrar-holgura").checked && actividad.holgura > 0) {
      const margen = crearElemento("span", "gantt-margen");
      margen.style.left = dato.fin / limite * 100 + "%";
      margen.style.width = actividad.holgura / limite * 100 + "%";
      margen.title = "Holgura: " + formato(actividad.holgura) + " " + unidadTiempo();
      pista.append(margen);
    }
    const barra = crearElemento("button", "gantt-barra" + (actividad.critica ? " es-critica" : ""));
    barra.type = "button";
    barra.dataset.actividad = actividad.nombre;
    barra.style.left = dato.inicio / limite * 100 + "%";
    barra.style.width = dato.duracion / limite * 100 + "%";
    if (dato.duracion === 0) barra.classList.add("es-hito");
    const descripcion = actividad.nombre + ": inicio " + formato(dato.inicio) + ", duración " + formato(dato.duracion) +
      ", fin " + formato(dato.fin) + ", holgura " + formato(actividad.holgura) + " " + unidadTiempo();
    barra.title = descripcion;
    barra.setAttribute("aria-label", descripcion + ". Abrir procedimiento.");
    if (dato.duracion * escala > 62) barra.textContent = formato(dato.duracion);
    const etiqueta = crearElemento("span", "gantt-extremos", formato(dato.inicio) + " – " + formato(dato.fin));
    etiqueta.style.left = dato.inicio / limite * 100 + "%";
    pista.append(etiqueta, barra);
    [nombre, barra].forEach(boton => boton.addEventListener("click", () => {
      seleccionarActividad(actividad.nombre);
      abrirProcedimientoActividad(actividad.nombre, programa.solucion, escenario);
    }));
    barra.addEventListener("focus", () => seleccionarActividad(actividad.nombre));
    fila.append(nombre, pista);
    lienzo.append(fila);
  });
  if (document.getElementById("mostrar-dependencias").checked) {
    const conexiones = crearElementoSvg("svg", {
      width: anchoTiempo, height: visibles.length * altoFila, viewBox: "0 0 " + anchoTiempo + " " + visibles.length * altoFila, preserveAspectRatio: "none", class: "gantt-conexiones", "aria-hidden": "true"
    });
    conexiones.style.left = anchoEtiquetas + "px";
    conexiones.style.top = altoCabecera + "px";
    const defs = crearElementoSvg("defs");
    const flecha = crearElementoSvg("marker", { id: "flecha-gantt", markerWidth: 6, markerHeight: 6, refX: 5, refY: 3, orient: "auto" });
    flecha.append(crearElementoSvg("path", { d: "M0 0 L6 3 L0 6 Z", fill: "#668298" }));
    defs.append(flecha);
    conexiones.append(defs);
    visibles.forEach(dato => {
      dato.actividad.predecesoras.forEach(nombre => {
        if (!indices.has(nombre)) return;
        const origen = programa.solucion.actividadesPorNombre.get(nombre);
        const x1 = origen.finTemprano * escala;
        const x2 = dato.inicio * escala;
        const y1 = indices.get(nombre) * altoFila + 24;
        const y2 = indices.get(dato.actividad.nombre) * altoFila + 24;
        const carril = Math.min(anchoTiempo - 6, x1 + 10);
        conexiones.append(crearElementoSvg("path", {
          d: crearRutaOrtogonal([{ x: x1, y: y1 }, { x: carril, y: y1 }, { x: carril, y: y2 - 19 }, { x: x2, y: y2 - 19 }, { x: x2, y: y2 - 15 }], 4),
          fill: "none", stroke: "#668298", "stroke-width": 1.3, "stroke-opacity": .65, "marker-end": "url(#flecha-gantt)"
        }));
      });
    });
    lienzo.append(conexiones);
  }
  elementos.gantt.append(lienzo);
  elementos.duracionGantt.textContent = formato(programa.duracionTotal) + " " + unidadTiempo();
  elementos.escalaGanttTexto.textContent = Math.round(escalaGantt * 100) + "%";
  document.getElementById("detalle-escenario-gantt").textContent = escenario === "esperado" ? "" : "Criticidad recalculada para este escenario";
  elementos.duracionGantt.closest("strong").hidden = escenario === "esperado";
  if (!ajustar) elementos.gantt.scrollTo(desplazamiento);
  actualizarSeleccionVisual();
}

function nombreEscenario(escenario) {
  return { esperado: "base", optimista: "optimista", probable: "más probable", pesimista: "pesimista" }[escenario] || "base";
}

function unidadTiempo() {
  return document.getElementById("unidad-tiempo").value;
}

function seleccionarActividad(nombre) {
  actividadSeleccionada = nombre;
  actualizarSeleccionVisual();
}

function actualizarSeleccionVisual() {
  elementos.red.querySelectorAll("[data-nodo-actividad]").forEach(nodo => {
    nodo.classList.toggle("nodo-seleccionado", nodo.dataset.nodoActividad === actividadSeleccionada);
  });
  elementos.gantt.querySelectorAll(".gantt-fila").forEach(fila => {
    fila.classList.toggle("actividad-seleccionada", fila.dataset.actividad === actividadSeleccionada);
  });
  elementos.desarrollo.querySelectorAll(".tarjeta-calculo").forEach(tarjeta => {
    tarjeta.classList.toggle("calculo-seleccionado", tarjeta.querySelector(".ver-nodo")?.dataset.actividad === actividadSeleccionada);
  });
  const actividad = programaGantt?.solucion.actividadesPorNombre.get(actividadSeleccionada);
  document.getElementById("seleccion-gantt").textContent = actividad
    ? actividad.nombre + " · Inicio " + formato(actividad.inicioTemprano) + " · Fin " + formato(actividad.finTemprano) + " · Duración " + formato(actividad.duracion) + " · Holgura " + formato(actividad.holgura) + " " + unidadTiempo()
    : "Seleccione una actividad para ver su inicio, fin y margen.";
}

function aplicarEscalaRed() {
  if (!svgRed) return;
  svgRed.setAttribute("width", dimensionesRed.ancho * escalaRed);
  svgRed.setAttribute("height", dimensionesRed.alto * escalaRed);
  elementos.escalaRedTexto.textContent = Math.round(escalaRed * 100) + "%";
}

function cambiarEscalaRed(cambio) {
  modoVistaRed = "manual";
  escalaRed = Math.min(1.8, Math.max(0.4, escalaRed + cambio));
  aplicarEscalaRed();
}

function ajustarEscalaRed() {
  if (!svgRed) return;
  if (modoVistaRed === "manual") { aplicarEscalaRed(); return; }
  const anchoDisponible = Math.max(280, elementos.red.clientWidth - 18);
  const altoDisponible = Math.max(280, parseFloat(getComputedStyle(elementos.red).maxHeight) - 18 || elementos.red.clientHeight - 18);
  escalaRed = modoVistaRed === "completa"
    ? Math.min(1, anchoDisponible / dimensionesRed.ancho, altoDisponible / dimensionesRed.alto)
    : Math.min(1, Math.max(0.62, anchoDisponible / dimensionesRed.ancho));
  aplicarEscalaRed();
  elementos.red.scrollTo({ left: 0, top: 0, behavior: "smooth" });
}

function restablecerEscalaRed() {
  modoVistaRed = "lectura";
  ajustarEscalaRed();
}

function aplicarEscalaGantt() {
  if (solucionActual && programaGantt) dibujarGantt(solucionActual, elementos.escenarioGantt.value, false);
}

function cambiarEscalaGantt(cambio) {
  escalaGantt = Math.min(4, Math.max(.75, escalaGantt + cambio));
  aplicarEscalaGantt();
}

function restablecerEscalaGantt() {
  if (!solucionActual || !programaGantt || document.getElementById("panel-gantt").hidden) return;
  dibujarGantt(solucionActual, elementos.escenarioGantt.value);
  elementos.gantt.scrollTo({ left: 0, top: 0, behavior: "instant" });
}

function enfocarActividadEnRed(nombreActividad) {
  if (!svgRed) return;
  seleccionarActividad(nombreActividad);
  activarPestana("panel-red");
  requestAnimationFrame(() => {
    const nodo = [...svgRed.querySelectorAll("[data-nodo-actividad]")]
      .find(elemento => elemento.dataset.nodoActividad === nombreActividad);
    if (!nodo) return;

    svgRed.querySelectorAll(".nodo-enfocado").forEach(elemento => elemento.classList.remove("nodo-enfocado"));
    escalaRed = Math.max(escalaRed, .72);
    modoVistaRed = "manual";
    aplicarEscalaRed();
    nodo.classList.add("nodo-enfocado");

    const x = Number(nodo.dataset.x);
    const y = Number(nodo.dataset.y);
    elementos.red.scrollTo({
      left: Math.max(0, (x + 126) * escalaRed - elementos.red.clientWidth / 2),
      top: Math.max(0, (y + 69) * escalaRed - elementos.red.clientHeight / 2),
      behavior: "smooth"
    });

    clearTimeout(temporizadorEnfoqueNodo);
    temporizadorEnfoqueNodo = setTimeout(() => nodo.classList.remove("nodo-enfocado"), 2400);
  });
}

function activarPestana(idPanel) {
  document.querySelectorAll(".pestana").forEach(boton => {
    const seleccionada = boton.dataset.panel === idPanel;
    boton.classList.toggle("activo", seleccionada);
    boton.setAttribute("aria-selected", String(seleccionada));
    boton.tabIndex = seleccionada ? 0 : -1;
  });
  document.querySelectorAll(".panel-pestana").forEach(panel => {
    const seleccionado = panel.id === idPanel;
    panel.hidden = !seleccionado;
    panel.classList.toggle("activo", seleccionado);
  });
  const indiceFlujo = ["panel-red", "panel-gantt"].includes(idPanel) ? 1 : 2;
  document.querySelectorAll(".flujo li").forEach((paso, indice) => {
    paso.classList.toggle("activo", indice === indiceFlujo);
  });
  if (idPanel === "panel-red" && svgRed) requestAnimationFrame(ajustarEscalaRed);
  if (idPanel === "panel-gantt" && programaGantt) requestAnimationFrame(restablecerEscalaGantt);
}

function presentarResultados(solucion, plazoObjetivo) {
  const rutasDetalladas = enriquecerRutas(solucion, plazoObjetivo);
  solucionActual = solucion;
  datosPendientes = false;
  document.getElementById("aviso-pendiente").hidden = true;
  document.getElementById("imprimir").disabled = false;
  document.getElementById("lista-actividades").replaceChildren(...solucion.orden.map(actividad => {
    const opcion = document.createElement("option");
    opcion.value = actividad.nombre;
    opcion.label = actividad.descripcion;
    return opcion;
  }));
  elementos.estadoVacio.hidden = true;
  elementos.salida.hidden = false;
  activarPestana("panel-red");
  presentarResumen(solucion, rutasDetalladas, plazoObjetivo);
  presentarTablaResultados(solucion);
  presentarInterpretacion(solucion, rutasDetalladas, plazoObjetivo);
  presentarRutas(solucion, rutasDetalladas, plazoObjetivo);
  presentarDesarrollo(solucion, rutasDetalladas, plazoObjetivo);
  dibujarRed(solucion);
  elementos.escenarioGantt.value = "esperado";
  elementos.escenarioGantt.disabled = elementos.tipo.value !== "pert";
  elementos.escenarioGantt.closest("label").hidden = elementos.tipo.value !== "pert";
  dibujarGantt(solucion, "esperado");
}

function resolverFormulario() {
  try {
    elementos.mensaje.textContent = "";
    elementos.actividades.querySelectorAll('[aria-invalid="true"]').forEach(campo => {
      campo.removeAttribute("aria-invalid"); campo.removeAttribute("aria-describedby");
    });
    elementos.plazo.removeAttribute("aria-invalid");
    elementos.plazo.removeAttribute("aria-describedby");
    const datos = leerDatos();
    const plazoObjetivo = elementos.tipo.value === "pert" && elementos.plazo.value.trim() !== ""
      ? numeroEntrada(elementos.plazo, "El plazo objetivo")
      : null;
    const solucion = resolverProyecto(datos);
    presentarResultados(solucion, plazoObjetivo);
    guardarEstado();
  } catch (error) {
    mostrarError(error);
  }
}

function guardarEstado() {
  try {
    const actividadesActuales = capturarFilasVisuales();
    borradoresPorTipo[elementos.tipo.value] = actividadesActuales;
    const estado = {
      version: 3,
      tipo: elementos.tipo.value,
      plazo: elementos.plazo.value,
      unidad: unidadTiempo(),
      actividades: actividadesActuales,
      borradoresPorTipo
    };
    localStorage.setItem(claveGuardado, JSON.stringify(estado));
    elementos.estadoGuardado.textContent = "Cambios guardados en este navegador.";
    elementos.estadoGuardado.classList.remove("guardando");
  } catch {
    elementos.estadoGuardado.textContent = "No fue posible guardar automáticamente.";
    elementos.estadoGuardado.classList.remove("guardando");
  }
}

function programarGuardado() {
  elementos.estadoGuardado.textContent = "Guardando cambios…";
  elementos.estadoGuardado.classList.add("guardando");
  clearTimeout(temporizadorGuardado);
  temporizadorGuardado = setTimeout(guardarEstado, 450);
}

function restaurarEstado() {
  try {
    const textoGuardado = localStorage.getItem(claveGuardado);
    if (!textoGuardado) return false;
    const estado = JSON.parse(textoGuardado);
    if (!estado || !Array.isArray(estado.actividades)) return false;

    elementos.tipo.value = estado.tipo === "pert" ? "pert" : "cpm";
    tipoAnterior = elementos.tipo.value;
    const borradoresGuardados = estado.borradoresPorTipo ?? {};
    borradoresPorTipo = {
      cpm: Array.isArray(borradoresGuardados.cpm) ? borradoresGuardados.cpm : null,
      pert: Array.isArray(borradoresGuardados.pert) ? borradoresGuardados.pert : null
    };
    borradoresPorTipo[tipoAnterior] = estado.actividades;
    elementos.plazo.value = estado.plazo ?? "";
    if (["unidades", "días", "semanas", "meses"].includes(estado.unidad)) document.getElementById("unidad-tiempo").value = estado.unidad;
    document.getElementById("unidad-plazo").textContent = unidadTiempo();
    actualizarEncabezados();
    elementos.actividades.replaceChildren();
    estado.actividades.forEach(actividad => agregarActividad(actividad));
    if (!estado.actividades.length) agregarActividad();
    return true;
  } catch {
    return false;
  }
}

function actualizarCasosProyecto() {
  const seleccionAnterior = elementos.casoEjemplo.value;
  const casos = Object.entries(CASOS_PROYECTO).filter(([, caso]) => caso.tipo === elementos.tipo.value);
  elementos.casoEjemplo.replaceChildren(...casos.map(([clave, caso]) => {
    const opcion = document.createElement("option");
    opcion.value = clave;
    opcion.textContent = caso.etiqueta;
    return opcion;
  }));
  if (casos.some(([clave]) => clave === seleccionAnterior)) elementos.casoEjemplo.value = seleccionAnterior;
}

function obtenerCasoProyecto(clave = elementos.casoEjemplo.value) {
  const caso = CASOS_PROYECTO[clave];
  if (!caso) return null;
  return JSON.parse(JSON.stringify(caso));
}

function cargarEjemplo(clave = elementos.casoEjemplo.value) {
  const caso = obtenerCasoProyecto(clave)
    ?? obtenerCasoProyecto(elementos.tipo.value === "pert" ? "pert-software" : "cpm-sistema");
  if (!caso) return;
  if (elementos.tipo.value !== caso.tipo) {
    elementos.tipo.value = caso.tipo;
    tipoAnterior = caso.tipo;
    actualizarEncabezados();
    actualizarCasosProyecto();
    elementos.casoEjemplo.value = clave;
  }
  elementos.actividades.replaceChildren();
  elementos.mensaje.textContent = "";
  elementos.plazo.value = caso.tipo === "pert" ? String(caso.plazo ?? "") : "";
  if (caso.unidad) {
    document.getElementById("unidad-tiempo").value = caso.unidad;
    document.getElementById("unidad-plazo").textContent = unidadTiempo();
  }
  caso.actividades.forEach(actividad => agregarActividad(actividad));
  borradoresPorTipo[caso.tipo] = capturarFilasVisuales(caso.tipo);

  ocultarResultados(false);
  programarGuardado();
}

function limpiarFormulario() {
  if (!window.confirm("¿Desea eliminar todas las actividades ingresadas?")) return;
  elementos.actividades.replaceChildren();
  elementos.plazo.value = "";
  agregarActividad({}, true);
  elementos.mensaje.textContent = "";
  ocultarResultados(false);
  guardarEstado();
}

function configurarDialogoCarga() {
  const esPert = elementos.tipo.value === "pert";
  elementos.ayudaCarga.textContent = esPert
    ? "Copie las celdas desde Excel y péguelas aquí en este orden: Actividad, Descripción, Predecesoras, Optimista, Más probable y Pesimista. También se aceptan CSV, punto y coma o |."
    : "Copie las celdas desde Excel y péguelas aquí en este orden: Actividad, Descripción, Predecesoras y Duración. También se aceptan CSV, punto y coma o |.";
  elementos.datosPegados.placeholder = esPert
    ? "A\tAnálisis inicial\t-\t2\t4\t6\nB\tDiseño\tA\t3\t5\t9"
    : "A\tAnálisis de requerimientos\t-\t4\nB\tDiseño del sistema\tA\t5";
  elementos.mensajeCarga.textContent = "";
  elementos.dialogoCarga.showModal();
  elementos.datosPegados.focus();
}

function detectarSeparador(linea) {
  const candidatos = ["\t", ";", "|", ","];
  let mejorSeparador = null;
  let mayorCantidad = 0;
  candidatos.forEach(separador => {
    let cantidad = 0;
    let dentroDeComillas = false;
    for (let indice = 0; indice < linea.length; indice += 1) {
      if (linea[indice] === '"') dentroDeComillas = !dentroDeComillas;
      if (!dentroDeComillas && linea[indice] === separador) cantidad += 1;
    }
    if (cantidad > mayorCantidad) {
      mayorCantidad = cantidad;
      mejorSeparador = separador;
    }
  });
  return mejorSeparador;
}

function separarColumnas(linea, separador) {
  const columnas = [];
  let valor = "";
  let dentroDeComillas = false;

  for (let indice = 0; indice < linea.length; indice += 1) {
    const caracter = linea[indice];
    if (caracter === '"') {
      if (dentroDeComillas && linea[indice + 1] === '"') {
        valor += '"';
        indice += 1;
      } else {
        dentroDeComillas = !dentroDeComillas;
      }
    } else if (caracter === separador && !dentroDeComillas) {
      columnas.push(valor.trim());
      valor = "";
    } else {
      valor += caracter;
    }
  }
  columnas.push(valor.trim());
  return columnas;
}

function convertirTextoEnActividades(texto) {
  const lineas = texto
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map(linea => linea.trim())
    .filter(Boolean);
  if (!lineas.length) throw new Error("No se encontraron filas de datos.");

  const separador = detectarSeparador(lineas[0]);
  if (!separador) {
    throw new Error("No se detectaron columnas. Copie un rango de Excel o use CSV/TSV.");
  }

  const cantidadEsperada = elementos.tipo.value === "pert" ? 6 : 4;
  return lineas.map((linea, indice) => {
    const columnas = separarColumnas(linea, separador);
    const primeraColumna = columnas[0].toLowerCase();
    if (indice === 0 && (primeraColumna.includes("actividad") || primeraColumna === "id")) return null;
    if (columnas.length < cantidadEsperada) {
      throw new Error("La fila " + (indice + 1) + " tiene " + columnas.length +
        " columnas; se esperaban " + cantidadEsperada + ".");
    }

    const predecesoras = ["-", "—", "ninguna"].includes(columnas[2].toLowerCase())
      ? ""
      : columnas[2];
    if (elementos.tipo.value === "pert") {
      return {
        nombre: columnas[0],
        descripcion: columnas[1],
        predecesoras,
        optimista: columnas[3].replace(",", "."),
        probable: columnas[4].replace(",", "."),
        pesimista: columnas[5].replace(",", ".")
      };
    }
    return {
      nombre: columnas[0],
      descripcion: columnas[1],
      predecesoras,
      duracion: columnas[3].replace(",", ".")
    };
  }).filter(Boolean);
}

function aplicarActividadesImportadas(filasImportadas) {
    if (!filasImportadas.length) throw new Error("No se encontraron filas de actividades.");
    elementos.actividades.replaceChildren();
    filasImportadas.forEach(actividad => agregarActividad(actividad));
    ocultarResultados();
    programarGuardado();
}

function importarDatosPegados() {
  try {
    aplicarActividadesImportadas(convertirTextoEnActividades(elementos.datosPegados.value));
    elementos.dialogoCarga.close();
    elementos.datosPegados.value = "";
  } catch (error) {
    elementos.mensajeCarga.textContent = error.message;
  }
}

function importarArchivoCsv(evento) {
  const archivo = evento.target.files[0];
  if (!archivo) return;
  const lector = new FileReader();
  lector.addEventListener("load", () => {
    try {
      aplicarActividadesImportadas(convertirTextoEnActividades(String(lector.result)));
      elementos.mensaje.textContent = "Se importaron " +
        elementos.actividades.querySelectorAll("tr").length + " actividades desde " + archivo.name + ".";
    } catch (error) {
      elementos.mensaje.textContent = error.message;
    } finally {
      elementos.archivoCsv.value = "";
    }
  });
  lector.addEventListener("error", () => {
    elementos.mensaje.textContent = "No fue posible leer el archivo seleccionado.";
    elementos.archivoCsv.value = "";
  });
  lector.readAsText(archivo, "UTF-8");
}

function valorCsv(valor) {
  const texto = String(valor ?? "");
  return '"' + texto.replace(/"/g, '""') + '"';
}

function exportarCsv() {
  const esPert = elementos.tipo.value === "pert";
  const encabezados = esPert
    ? ["Actividad", "Descripción", "Predecesoras", "Optimista", "Más probable", "Pesimista"]
    : ["Actividad", "Descripción", "Predecesoras", "Duración"];
  const filas = capturarFilasVisuales().map(actividad => esPert
    ? [actividad.nombre, actividad.descripcion, actividad.predecesoras, actividad.optimista, actividad.probable, actividad.pesimista]
    : [actividad.nombre, actividad.descripcion, actividad.predecesoras, actividad.duracion]
  );
  const contenido = [encabezados, ...filas]
    .map(fila => fila.map(valorCsv).join(";"))
    .join("\r\n");
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(new Blob(["\uFEFF" + contenido], { type: "text/csv;charset=utf-8" }));
  enlace.download = "proyecto-" + elementos.tipo.value + ".csv";
  enlace.click();
  URL.revokeObjectURL(enlace.href);
}

function limpiarRelacionesRed() {
  if (!svgRed) return;
  svgRed.classList.remove("red-en-contexto");
  svgRed.querySelectorAll(".nodo-activo-relacion, .nodo-vecino-relacion, .conexion-relacionada")
    .forEach(elemento => elemento.classList.remove("nodo-activo-relacion", "nodo-vecino-relacion", "conexion-relacionada"));
}

function resaltarRelacionesRed(nombreActividad) {
  if (!svgRed) return;
  limpiarRelacionesRed();
  const vecinos = new Set();
  svgRed.querySelectorAll("path[data-conexion-origen]").forEach(conexion => {
    const origen = conexion.dataset.conexionOrigen;
    const destino = conexion.dataset.conexionDestino;
    if (origen !== nombreActividad && destino !== nombreActividad) return;
    conexion.classList.add("conexion-relacionada");
    if (!origen.startsWith("__")) vecinos.add(origen);
    if (!destino.startsWith("__")) vecinos.add(destino);
  });

  svgRed.classList.add("red-en-contexto");
  svgRed.querySelectorAll("[data-nodo-actividad]").forEach(nodo => {
    const nombre = nodo.dataset.nodoActividad;
    nodo.classList.toggle("nodo-activo-relacion", nombre === nombreActividad);
    nodo.classList.toggle("nodo-vecino-relacion", nombre !== nombreActividad && vecinos.has(nombre));
  });
}

function activarArrastreRed() {
  let arrastrando = false;
  let nodoPresionado = null;
  let origenX = 0;
  let origenY = 0;
  let desplazamientoX = 0;
  let desplazamientoY = 0;

  elementos.red.addEventListener("pointerdown", evento => {
    arrastrando = true;
    redFueArrastrada = false;
    nodoPresionado = evento.target.closest("[data-nodo-actividad]")?.dataset.nodoActividad ?? null;
    origenX = evento.clientX;
    origenY = evento.clientY;
    desplazamientoX = elementos.red.scrollLeft;
    desplazamientoY = elementos.red.scrollTop;
    elementos.red.classList.add("arrastrando");
    elementos.red.setPointerCapture(evento.pointerId);
  });

  elementos.red.addEventListener("pointermove", evento => {
    if (!arrastrando) return;
    if (Math.hypot(evento.clientX - origenX, evento.clientY - origenY) > 6) {
      redFueArrastrada = true;
    }
    elementos.red.scrollLeft = desplazamientoX - (evento.clientX - origenX);
    elementos.red.scrollTop = desplazamientoY - (evento.clientY - origenY);
  });

  function terminarArrastre(evento, permitirApertura) {
    if (!arrastrando) return;
    const huboNodoPresionado = Boolean(nodoPresionado);
    const actividadParaAbrir = permitirApertura && !redFueArrastrada ? nodoPresionado : null;
    arrastrando = false;
    nodoPresionado = null;
    elementos.red.classList.remove("arrastrando");
    if (elementos.red.hasPointerCapture(evento.pointerId)) {
      elementos.red.releasePointerCapture(evento.pointerId);
    }
    if (huboNodoPresionado) {
      omitirSiguienteClicNodo = true;
      setTimeout(() => { omitirSiguienteClicNodo = false; }, 0);
    }
    if (actividadParaAbrir) abrirProcedimientoActividad(actividadParaAbrir);
  }

  elementos.red.addEventListener("pointerup", evento => terminarArrastre(evento, true));
  elementos.red.addEventListener("pointercancel", evento => terminarArrastre(evento, false));
}

elementos.actividades.addEventListener("input", () => {
  elementos.mensaje.textContent = "";
  elementos.actividades.querySelectorAll('[aria-invalid="true"]').forEach(campo => campo.removeAttribute("aria-invalid"));
  ocultarResultados();
  programarGuardado();
});

elementos.actividades.addEventListener("keydown", evento => {
  if (evento.key !== "Enter" || !(evento.target instanceof HTMLInputElement)) return;
  evento.preventDefault();
  const filaActual = evento.target.closest("tr");
  let filaDestino = evento.shiftKey ? filaActual.previousElementSibling : filaActual.nextElementSibling;
  if (!filaDestino && !evento.shiftKey) filaDestino = agregarActividad();
  const entradaDestino = filaDestino?.querySelector("." + evento.target.className);
  if (entradaDestino) {
    entradaDestino.focus();
    entradaDestino.select();
  }
  programarGuardado();
});

elementos.plazo.addEventListener("input", () => {
  ocultarResultados();
  programarGuardado();
});

elementos.tipo.addEventListener("change", cambiarTipoEstimacion);
document.getElementById("agregar").addEventListener("click", () => {
  agregarActividad({}, true);
  ocultarResultados();
  programarGuardado();
});
document.getElementById("ejemplo").addEventListener("click", () => cargarEjemplo());
document.getElementById("limpiar").addEventListener("click", limpiarFormulario);
document.getElementById("resolver").addEventListener("click", resolverFormulario);
document.getElementById("recalcular").addEventListener("click", resolverFormulario);
document.getElementById("unidad-tiempo").addEventListener("change", () => {
  document.getElementById("unidad-plazo").textContent = unidadTiempo();
  document.getElementById("unidad-resumen").textContent = unidadTiempo();
  if (solucionActual) dibujarGantt(solucionActual, elementos.escenarioGantt.value);
  programarGuardado();
});
document.getElementById("ampliar-vista").addEventListener("click", evento => {
  const ampliada = document.querySelector(".espacio-trabajo").classList.toggle("vista-ampliada");
  evento.currentTarget.textContent = ampliada ? "Mostrar datos ↙" : "Ampliar vista ↗";
  evento.currentTarget.setAttribute("aria-expanded", String(ampliada));
  requestAnimationFrame(() => { ajustarEscalaRed(); restablecerEscalaGantt(); });
});
["mostrar-holgura", "mostrar-dependencias", "solo-criticas"].forEach(id => {
  document.getElementById(id).addEventListener("change", aplicarEscalaGantt);
});
document.getElementById("busqueda-actividad").addEventListener("submit", evento => {
  evento.preventDefault();
  if (!solucionActual) return;
  const consulta = document.getElementById("buscar-actividad").value.trim().toUpperCase();
  const actividad = solucionActual.actividadesPorNombre.get(consulta) || solucionActual.orden.find(dato => consulta && dato.descripcion.toUpperCase().includes(consulta));
  document.getElementById("estado-busqueda").textContent = actividad ? "Actividad " + actividad.nombre : "No se encontró esa actividad.";
  if (!actividad) return;
  seleccionarActividad(actividad.nombre);
  if (!document.getElementById("panel-gantt").hidden) {
    const fila = [...elementos.gantt.querySelectorAll(".gantt-fila")].find(nodo => nodo.dataset.actividad === actividad.nombre);
    if (!fila) {
      document.getElementById("solo-criticas").checked = false;
      aplicarEscalaGantt();
    }
    const barra = [...elementos.gantt.querySelectorAll(".gantt-barra")].find(nodo => nodo.dataset.actividad === actividad.nombre);
    barra?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
    barra?.focus({ preventScroll: true });
  } else enfocarActividadEnRed(actividad.nombre);
});
document.getElementById("abrir-carga").addEventListener("click", configurarDialogoCarga);
document.getElementById("importar-datos").addEventListener("click", importarDatosPegados);
document.getElementById("importar-csv").addEventListener("click", () => elementos.archivoCsv.click());
document.getElementById("exportar-csv").addEventListener("click", exportarCsv);
elementos.archivoCsv.addEventListener("change", importarArchivoCsv);
elementos.escenarioGantt.addEventListener("change", () => {
  if (solucionActual) dibujarGantt(solucionActual, elementos.escenarioGantt.value);
});
document.getElementById("imprimir").addEventListener("click", () => { if (!datosPendientes) window.print(); });
document.getElementById("acercar-red").addEventListener("click", () => cambiarEscalaRed(0.12));
document.getElementById("alejar-red").addEventListener("click", () => cambiarEscalaRed(-0.12));
document.getElementById("restablecer-red").addEventListener("click", restablecerEscalaRed);
document.getElementById("encajar-red").addEventListener("click", () => {
  modoVistaRed = "completa";
  ajustarEscalaRed();
});
document.getElementById("acercar-gantt").addEventListener("click", () => cambiarEscalaGantt(0.12));
document.getElementById("alejar-gantt").addEventListener("click", () => cambiarEscalaGantt(-0.12));
document.getElementById("restablecer-gantt").addEventListener("click", restablecerEscalaGantt);
function abrirTeoria() {
  elementos.dialogoTeoria.showModal();
  renderizarMatematicas([elementos.dialogoTeoria]);
}

document.getElementById("abrir-teoria")?.addEventListener("click", abrirTeoria);
document.getElementById("abrir-teoria-red")?.addEventListener("click", abrirTeoria);
document.getElementById("teoria-flotante").addEventListener("click", abrirTeoria);
elementos.dialogoTeoria.querySelectorAll("details").forEach(detalle => {
  detalle.addEventListener("toggle", () => {
    if (detalle.open) renderizarMatematicas([detalle]);
  });
});

const relacionesNodoTeoria = {
  "b-it": {
    celdas: ["a-ft", "b-it"],
    recorridos: ["adelante"]
  },
  "b-d": {
    celdas: ["b-it", "b-d", "b-ft", "b-ita", "b-fta"],
    recorridos: ["adelante", "atras"]
  },
  "b-ft": {
    celdas: ["b-it", "b-d", "b-ft", "c-it"],
    recorridos: ["adelante"]
  },
  "b-ita": {
    celdas: ["b-ita", "b-d", "b-fta"],
    recorridos: ["atras"]
  },
  "b-h": {
    celdas: ["b-it", "b-ita", "b-h"],
    recorridos: ["adelante", "atras"]
  },
  "b-fta": {
    celdas: ["b-fta", "c-ita"],
    recorridos: ["atras"]
  }
};

const cadenaNodosTeoria = elementos.dialogoTeoria.querySelector(".cadena-nodos-teoria");
const nodoTeoriaInteractivo = elementos.dialogoTeoria.querySelector(".nodo-formulacion");
const celdasNodoTeoria = [...cadenaNodosTeoria.querySelectorAll("[data-celda]")];
const celdasNodoInteractivo = [...nodoTeoriaInteractivo.querySelectorAll(".celda-formula")];
const tarjetasRecorridoNodo = [...elementos.dialogoTeoria.querySelectorAll("[data-recorrido]")];

function mostrarRelacionNodoTeoria(nombreCelda) {
  const relacion = relacionesNodoTeoria[nombreCelda];
  if (!relacion) return;
  cadenaNodosTeoria.classList.add("interactuando");
  celdasNodoTeoria.forEach(celda => {
    celda.classList.toggle("activa", celda.dataset.celda === nombreCelda);
    celda.classList.toggle("relacionada", celda.dataset.celda !== nombreCelda && relacion.celdas.includes(celda.dataset.celda));
  });
  tarjetasRecorridoNodo.forEach(tarjeta => {
    tarjeta.classList.toggle("activo", relacion.recorridos.includes(tarjeta.dataset.recorrido));
  });
}

function restablecerNodoTeoria() {
  cadenaNodosTeoria.classList.remove("interactuando");
  celdasNodoTeoria.forEach(celda => celda.classList.remove("activa", "relacionada"));
  tarjetasRecorridoNodo.forEach(tarjeta => tarjeta.classList.remove("activo"));
}

celdasNodoInteractivo.forEach(celda => {
  celda.addEventListener("mouseenter", () => mostrarRelacionNodoTeoria(celda.dataset.celda));
  celda.addEventListener("mouseleave", () => {
    if (document.activeElement !== celda) restablecerNodoTeoria();
  });
  celda.addEventListener("focus", () => mostrarRelacionNodoTeoria(celda.dataset.celda));
  celda.addEventListener("blur", restablecerNodoTeoria);
});
elementos.red.addEventListener("click", evento => {
  const nodo = evento.target.closest("[data-nodo-actividad]");
  if (!nodo || omitirSiguienteClicNodo) return;
  abrirProcedimientoActividad(nodo.dataset.nodoActividad);
});
elementos.red.addEventListener("keydown", evento => {
  if (!["Enter", " "].includes(evento.key)) return;
  const nodo = evento.target.closest("[data-nodo-actividad]");
  if (!nodo) return;
  evento.preventDefault();
  abrirProcedimientoActividad(nodo.dataset.nodoActividad);
});
elementos.red.addEventListener("pointerover", evento => {
  const nodo = evento.target.closest("[data-nodo-actividad]");
  if (!nodo) return;
  const nodoAnterior = evento.relatedTarget instanceof Element
    ? evento.relatedTarget.closest("[data-nodo-actividad]")
    : null;
  if (nodoAnterior === nodo) return;
  resaltarRelacionesRed(nodo.dataset.nodoActividad);
});
elementos.red.addEventListener("pointerout", evento => {
  const nodo = evento.target.closest("[data-nodo-actividad]");
  if (!nodo) return;
  const nodoSiguiente = evento.relatedTarget instanceof Element
    ? evento.relatedTarget.closest("[data-nodo-actividad]")
    : null;
  if (nodoSiguiente === nodo) return;
  limpiarRelacionesRed();
});
elementos.red.addEventListener("focusin", evento => {
  const nodo = evento.target.closest("[data-nodo-actividad]");
  if (nodo) resaltarRelacionesRed(nodo.dataset.nodoActividad);
});
elementos.red.addEventListener("focusout", evento => {
  if (!evento.relatedTarget?.closest?.("[data-nodo-actividad]")) limpiarRelacionesRed();
});
elementos.desarrollo.addEventListener("click", evento => {
  const boton = evento.target.closest(".ver-nodo");
  if (boton) enfocarActividadEnRed(boton.dataset.actividad);
});
const pestanas = [...document.querySelectorAll(".pestana")];
pestanas.forEach((boton, indice) => {
  boton.addEventListener("click", () => activarPestana(boton.dataset.panel));
  boton.addEventListener("keydown", evento => {
    let indiceDestino;
    if (evento.key === "ArrowRight") indiceDestino = (indice + 1) % pestanas.length;
    else if (evento.key === "ArrowLeft") indiceDestino = (indice - 1 + pestanas.length) % pestanas.length;
    else if (evento.key === "Home") indiceDestino = 0;
    else if (evento.key === "End") indiceDestino = pestanas.length - 1;
    else return;

    evento.preventDefault();
    const pestanaDestino = pestanas[indiceDestino];
    activarPestana(pestanaDestino.dataset.panel);
    pestanaDestino.focus();
  });
});
window.addEventListener("resize", () => {
  if (!solucionActual) return;
  ajustarEscalaRed();
  restablecerEscalaGantt();
});

activarArrastreRed();
// El menú lateral se gestiona en assets/navegacion.js.
actualizarEncabezados();
const estadoRestaurado = restaurarEstado();
actualizarCasosProyecto();
if (!estadoRestaurado) cargarEjemplo();
