"use strict";

const CLAVE_ARBOL = "teoria-decisiones-arbol-v1";
const elementosArbol = {
  caso: document.getElementById("caso-arbol"),
  problema: document.getElementById("problema-arbol"),
  objetivo: document.getElementById("objetivo-arbol"),
  nombreNodo: document.getElementById("nombre-nodo"),
  tipoNodo: document.getElementById("tipo-nodo"),
  tituloNodo: document.getElementById("titulo-nodo-seleccionado"),
  identificadorNodo: document.getElementById("identificador-nodo"),
  ayudaTipo: document.getElementById("ayuda-tipo"),
  herramientasRamas: document.getElementById("herramientas-ramas"),
  copiarTodasRamas: document.getElementById("copiar-todas-ramas"),
  copiarRamas: document.getElementById("copiar-ramas"),
  pegarRamas: document.getElementById("pegar-ramas"),
  estadoPortapapeles: document.getElementById("estado-portapapeles"),
  listaRamas: document.getElementById("lista-ramas"),
  agregarRama: document.getElementById("agregar-rama"),
  eliminarNodo: document.getElementById("eliminar-nodo"),
  mensaje: document.getElementById("mensaje-arbol"),
  lienzo: document.getElementById("lienzo-arbol"),
  visor: document.getElementById("visor-arbol"),
  zoom: document.getElementById("zoom-arbol"),
  resultado: document.getElementById("resultado-arbol"),
  primeraDecision: document.getElementById("primera-decision"),
  valor: document.getElementById("valor-arbol"),
  detalleValor: document.getElementById("detalle-valor-arbol"),
  nodosEvaluados: document.getElementById("nodos-evaluados"),
  recomendacion: document.getElementById("recomendacion-arbol"),
  desarrollo: document.getElementById("desarrollo-arbol"),
  dialogo: document.getElementById("dialogo-arbol")
};

let arbol = null;
let nodoSeleccionado = "n1";
let contadorNodos = 1;
let calculoActual = null;
let nivelZoom = 1;
let temporizadorArbol = null;
let portapapelesRamas = null;

function numeroArbol(valor) {
  if (valor == null || String(valor).trim() === "") return NaN;
  const convertido = Number(String(valor ?? "").trim().replace(",", "."));
  return Number.isFinite(convertido) ? convertido : NaN;
}

function formatearArbol(valor, decimales = 2) {
  if (!Number.isFinite(valor)) return "—";
  return new Intl.NumberFormat("es-PE", { maximumFractionDigits: decimales }).format(valor);
}

function escaparArbol(texto) {
  return String(texto ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function nuevoId() {
  contadorNodos += 1;
  return `n${contadorNodos}`;
}

function crearArbolVacio() {
  contadorNodos = 1;
  return {
    problema: "",
    objetivo: "maximizar",
    raiz: "n1",
    nodos: [{ id: "n1", tipo: "decision", nombre: "Decisión inicial", ramas: [] }]
  };
}

function crearEjemploArbol(clave = "rifa") {
  if (window.CASOS_GUIA_DECISION?.[clave]) {
    const ejemplo = crearArbolDesdeMatriz(window.CASOS_GUIA_DECISION[clave], clave);
    contadorNodos = ejemplo.nodos.length;
    return ejemplo;
  }
  const casos = {
    rifa: {
      problema: "Decisión sobre una rifa",
      objetivo: "maximizar",
      raiz: "n1",
      nodos: [
        { id: "n1", tipo: "decision", nombre: "Participar en la rifa", ramas: [
          { nombre: "Comprar número", valor: 0, probabilidad: null, destino: "n2" },
          { nombre: "No comprar", valor: 0, probabilidad: null, destino: "n3" }
        ] },
        { id: "n2", tipo: "azar", nombre: "Resultado de la rifa", ramas: [
          { nombre: "Ganar", valor: 4900, probabilidad: .01, destino: "n4" },
          { nombre: "Perder", valor: -100, probabilidad: .99, destino: "n5" }
        ] },
        { id: "n3", tipo: "terminal", nombre: "No participa", ramas: [] },
        { id: "n4", tipo: "terminal", nombre: "Premio neto", ramas: [] },
        { id: "n5", tipo: "terminal", nombre: "Costo del número", ramas: [] }
      ]
    },
    vacaciones: {
      problema: "Vacaciones en el extranjero",
      objetivo: "minimizar",
      raiz: "n1",
      nodos: [
        { id: "n1", tipo: "decision", nombre: "Destino de vacaciones", ramas: [
          { nombre: "México", valor: 0, probabilidad: null, destino: "n2" },
          { nombre: "Panamá", valor: 0, probabilidad: null, destino: "n3" },
          { nombre: "Venezuela", valor: 0, probabilidad: null, destino: "n4" }
        ] },
        { id: "n2", tipo: "azar", nombre: "Dólar en México", ramas: [
          { nombre: "Alto", valor: 0, probabilidad: .70, destino: "n5" },
          { nombre: "Bajo", valor: 0, probabilidad: .30, destino: "n6" }
        ] },
        { id: "n3", tipo: "azar", nombre: "Dólar en Panamá", ramas: [
          { nombre: "Alto", valor: 0, probabilidad: .70, destino: "n7" },
          { nombre: "Bajo", valor: 0, probabilidad: .30, destino: "n8" }
        ] },
        { id: "n4", tipo: "azar", nombre: "Dólar en Venezuela", ramas: [
          { nombre: "Alto", valor: 0, probabilidad: .70, destino: "n9" },
          { nombre: "Bajo", valor: 0, probabilidad: .30, destino: "n10" }
        ] },
        { id: "n5", tipo: "azar", nombre: "Clima en México · dólar alto", ramas: [
          { nombre: "Soleado", valor: 722.5, probabilidad: .60, destino: "n11" },
          { nombre: "Lluvioso", valor: 925, probabilidad: .40, destino: "n12" }
        ] },
        { id: "n6", tipo: "azar", nombre: "Clima en México · dólar bajo", ramas: [
          { nombre: "Soleado", valor: 425, probabilidad: .60, destino: "n13" },
          { nombre: "Lluvioso", valor: 575, probabilidad: .40, destino: "n14" }
        ] },
        { id: "n7", tipo: "azar", nombre: "Clima en Panamá · dólar alto", ramas: [
          { nombre: "Soleado", valor: 765, probabilidad: .80, destino: "n15" },
          { nombre: "Lluvioso", valor: 975, probabilidad: .20, destino: "n16" }
        ] },
        { id: "n8", tipo: "azar", nombre: "Clima en Panamá · dólar bajo", ramas: [
          { nombre: "Soleado", valor: 340, probabilidad: .80, destino: "n17" },
          { nombre: "Lluvioso", valor: 475, probabilidad: .20, destino: "n18" }
        ] },
        { id: "n9", tipo: "azar", nombre: "Clima en Venezuela · dólar alto", ramas: [
          { nombre: "Soleado", valor: 637.5, probabilidad: .40, destino: "n19" },
          { nombre: "Lluvioso", valor: 825, probabilidad: .60, destino: "n20" }
        ] },
        { id: "n10", tipo: "azar", nombre: "Clima en Venezuela · dólar bajo", ramas: [
          { nombre: "Soleado", valor: 382.5, probabilidad: .40, destino: "n21" },
          { nombre: "Lluvioso", valor: 525, probabilidad: .60, destino: "n22" }
        ] },
        ...Array.from({ length: 12 }, (_, indice) => ({ id: `n${indice + 11}`, tipo: "terminal", nombre: `Resultado ${indice + 1}`, ramas: [] }))
      ]
    }
  };
  const caso = casos[clave] || casos.rifa;
  contadorNodos = Math.max(...caso.nodos.map(nodo => Number(nodo.id.replace(/\D/g, "")) || 0));
  return { ...JSON.parse(JSON.stringify(caso)), caso: casos[clave] ? clave : "rifa" };
}

function buscarNodo(id, datos = arbol) {
  return datos.nodos.find(nodo => nodo.id === id);
}

function normalizarProbabilidadesNodo(valores) {
  const numeros = valores.map(numeroArbol);
  if (numeros.some(valor => !Number.isFinite(valor) || valor < 0)) return null;
  const suma = numeros.reduce((total, valor) => total + valor, 0);
  if (Math.abs(suma - 1) < 1e-8) return numeros;
  if (Math.abs(suma - 100) < 1e-8) return numeros.map(valor => valor / 100);
  return null;
}

function calcularArbol(datos) {
  const valores = {};
  const decisiones = {};
  const detalles = {};
  const pasos = [];
  const visitando = new Set();
  const visitados = new Set();

  function evaluar(id) {
    const nodo = buscarNodo(id, datos);
    if (!nodo) throw new Error(`Falta el nodo ${id}.`);
    if (visitando.has(id)) throw new Error("El árbol contiene un ciclo.");
    if (visitados.has(id)) return valores[id];
    visitando.add(id);
    if (nodo.tipo === "terminal") {
      valores[id] = 0;
      detalles[id] = [];
    } else {
      if (!Array.isArray(nodo.ramas) || nodo.ramas.length < 2) throw new Error(`El nodo “${nodo.nombre}” necesita al menos dos ramas.`);
      const totales = nodo.ramas.map(rama => {
        const valorRama = numeroArbol(rama.valor);
        if (!Number.isFinite(valorRama)) throw new Error(`Revise el valor de una rama en “${nodo.nombre}”.`);
        return valorRama + evaluar(rama.destino);
      });
      detalles[id] = totales;
      if (nodo.tipo === "azar") {
        const probabilidades = normalizarProbabilidadesNodo(nodo.ramas.map(rama => rama.probabilidad));
        if (!probabilidades) throw new Error(`Las probabilidades de “${nodo.nombre}” deben sumar 1 o 100 %.`);
        valores[id] = totales.reduce((suma, total, indice) => suma + total * probabilidades[indice], 0);
        pasos.push({ tipo: "azar", nodo, totales, probabilidades, valor: valores[id] });
      } else {
        const objetivo = datos.objetivo === "minimizar" ? Math.min(...totales) : Math.max(...totales);
        const indice = totales.findIndex(total => Math.abs(total - objetivo) < 1e-9);
        valores[id] = objetivo;
        decisiones[id] = indice;
        pasos.push({ tipo: "decision", nodo, totales, indice, valor: objetivo });
      }
    }
    visitando.delete(id);
    visitados.add(id);
    return valores[id];
  }

  const valor = evaluar(datos.raiz);
  const raiz = buscarNodo(datos.raiz, datos);
  const indiceInicial = raiz?.tipo === "decision" ? decisiones[datos.raiz] : null;
  return { valor, valores, decisiones, detalles, pasos, nodosEvaluados: visitados.size, indiceInicial };
}

function nodosDescendientes(id, datos = arbol) {
  const encontrados = new Set();
  function recorrer(actual) {
    const nodo = buscarNodo(actual, datos);
    nodo?.ramas.forEach(rama => {
      if (!encontrados.has(rama.destino)) {
        encontrados.add(rama.destino);
        recorrer(rama.destino);
      }
    });
  }
  recorrer(id);
  return encontrados;
}

function eliminarDescendientes(id) {
  const ids = nodosDescendientes(id);
  arbol.nodos = arbol.nodos.filter(nodo => !ids.has(nodo.id));
  const nodo = buscarNodo(id);
  if (nodo) nodo.ramas = [];
}

function padreDe(id) {
  for (const nodo of arbol.nodos) {
    const indice = nodo.ramas.findIndex(rama => rama.destino === id);
    if (indice >= 0) return { nodo, indice };
  }
  return null;
}

function serializarNodoParaCopia(id, datos = arbol, visitados = new Set()) {
  if (visitados.has(id)) throw new Error("No se puede copiar una estructura con ciclos.");
  const nodo = buscarNodo(id, datos);
  if (!nodo) throw new Error(`No se encontró el nodo ${id}.`);
  const rutaVisitada = new Set(visitados);
  rutaVisitada.add(id);
  return {
    tipo: nodo.tipo,
    nombre: nodo.nombre,
    ramas: nodo.ramas.map(rama => ({
      nombre: rama.nombre,
      valor: rama.valor,
      probabilidad: rama.probabilidad,
      hijo: serializarNodoParaCopia(rama.destino, datos, rutaVisitada)
    }))
  };
}

function crearCopiaDeRamas(datos, idNodo, indices, modo = "conjunto") {
  const nodo = buscarNodo(idNodo, datos);
  if (!nodo || nodo.tipo === "terminal") throw new Error("Seleccione un nodo con ramas para copiar.");
  const indicesValidos = [...new Set(indices)].filter(indice => Number.isInteger(indice) && nodo.ramas[indice]);
  if (!indicesValidos.length) throw new Error("Seleccione al menos una rama.");
  return {
    tipoNodo: nodo.tipo,
    modo,
    ramas: indicesValidos.map(indice => {
      const rama = nodo.ramas[indice];
      return {
        nombre: rama.nombre,
        valor: rama.valor,
        probabilidad: rama.probabilidad,
        hijo: serializarNodoParaCopia(rama.destino, datos)
      };
    })
  };
}

function siguienteIdEn(datos) {
  do { contadorNodos += 1; } while (datos.nodos.some(nodo => nodo.id === `n${contadorNodos}`));
  return `n${contadorNodos}`;
}

function materializarNodoCopiado(datos, copiaNodo) {
  const id = siguienteIdEn(datos);
  const nodoNuevo = { id, tipo: copiaNodo.tipo, nombre: copiaNodo.nombre, ramas: [] };
  datos.nodos.push(nodoNuevo);
  nodoNuevo.ramas = copiaNodo.ramas.map(rama => ({
    nombre: rama.nombre,
    valor: rama.valor,
    probabilidad: rama.probabilidad,
    destino: materializarNodoCopiado(datos, rama.hijo)
  }));
  return id;
}

function idsDeSubarbol(datos, id) {
  const ids = new Set([id]);
  const nodo = buscarNodo(id, datos);
  nodo?.ramas.forEach(rama => idsDeSubarbol(datos, rama.destino).forEach(actual => ids.add(actual)));
  return ids;
}

function pegarCopiaDeRamas(datos, idNodo, copia) {
  const nodo = buscarNodo(idNodo, datos);
  if (!nodo || nodo.tipo === "terminal") throw new Error("Seleccione un nodo de decisión o incertidumbre para pegar.");
  if (!copia?.ramas?.length) throw new Error("Primero copie una o más ramas.");
  if (nodo.tipo !== copia.tipoNodo) throw new Error("Solo puede pegar entre nodos del mismo tipo.");

  if (copia.modo === "estructura" || copia.modo === "conjunto") {
    const idsEliminar = new Set();
    nodo.ramas.forEach(rama => idsDeSubarbol(datos, rama.destino).forEach(id => idsEliminar.add(id)));
    datos.nodos = datos.nodos.filter(actual => !idsEliminar.has(actual.id));
    nodo.ramas = [];
  }

  const nuevasRamas = copia.ramas.map(rama => ({
    nombre: rama.nombre,
    valor: rama.valor,
    probabilidad: rama.probabilidad,
    destino: materializarNodoCopiado(datos, rama.hijo)
  }));
  nodo.ramas.push(...nuevasRamas);
  return nuevasRamas.map(rama => rama.destino);
}

function asegurarRamas(nodo) {
  if (nodo.tipo === "terminal" || nodo.ramas.length) return;
  for (let indice = 0; indice < 2; indice += 1) {
    const id = nuevoId();
    arbol.nodos.push({ id, tipo: "terminal", nombre: `Resultado ${indice + 1}`, ramas: [] });
    nodo.ramas.push({ nombre: `Rama ${indice + 1}`, valor: 0, probabilidad: nodo.tipo === "azar" ? .5 : null, destino: id });
  }
}

function renderizarEditor() {
  const nodo = buscarNodo(nodoSeleccionado) || buscarNodo(arbol.raiz);
  nodoSeleccionado = nodo.id;
  elementosArbol.tituloNodo.textContent = nodo.nombre;
  elementosArbol.identificadorNodo.textContent = nodo.id.toUpperCase();
  elementosArbol.nombreNodo.value = nodo.nombre;
  elementosArbol.tipoNodo.value = nodo.tipo;
  elementosArbol.ayudaTipo.textContent = nodo.tipo === "decision" ? "Compare las ramas y conserve la mejor." : nodo.tipo === "azar" ? "La suma de probabilidades debe ser 1 o 100 %." : "Este nodo cierra una secuencia; no tiene ramas.";
  elementosArbol.listaRamas.innerHTML = nodo.ramas.map((rama, indice) => `<article class="rama-editor" data-rama="${indice}"><div class="cabecera-rama"><label class="seleccion-rama"><input class="seleccionar-rama" type="checkbox" aria-label="Seleccionar rama ${indice + 1}"><strong>Rama ${indice + 1}</strong></label><div class="acciones-rama"><button class="copiar-rama" type="button" aria-label="Copiar rama ${indice + 1}">Copiar</button><button class="eliminar eliminar-rama" type="button" aria-label="Eliminar rama" ${nodo.ramas.length <= 2 ? "disabled" : ""}>×</button></div></div><label>Nombre<input data-campo="nombre" type="text" maxlength="45" value="${escaparArbol(rama.nombre)}"></label><div class="campos-rama"><label>Valor inmediato<input data-campo="valor" type="number" step="any" value="${rama.valor}"></label>${nodo.tipo === "azar" ? `<label>Probabilidad<input data-campo="probabilidad" type="number" min="0" step="any" value="${rama.probabilidad ?? 0}"></label>` : ""}</div><button class="abrir-hijo" type="button" data-destino="${rama.destino}">Editar nodo siguiente <span>→</span></button></article>`).join("");
  elementosArbol.listaRamas.hidden = nodo.tipo === "terminal";
  elementosArbol.herramientasRamas.hidden = nodo.tipo === "terminal";
  elementosArbol.agregarRama.hidden = nodo.tipo === "terminal";
  elementosArbol.eliminarNodo.disabled = nodo.id === arbol.raiz;
  actualizarEstadoPortapapeles();
}

function actualizarEstadoPortapapeles() {
  const nodo = buscarNodo(nodoSeleccionado);
  const seleccionadas = elementosArbol.listaRamas.querySelectorAll(".seleccionar-rama:checked").length;
  elementosArbol.copiarTodasRamas.disabled = !nodo || nodo.tipo === "terminal" || nodo.ramas.length === 0;
  elementosArbol.copiarRamas.disabled = !nodo || nodo.tipo === "terminal" || seleccionadas === 0;
  const compatible = Boolean(portapapelesRamas && nodo && nodo.tipo !== "terminal" && portapapelesRamas.tipoNodo === nodo.tipo);
  elementosArbol.pegarRamas.disabled = !compatible;
  elementosArbol.pegarRamas.textContent = !portapapelesRamas
    ? "Pegar en este nodo"
    : portapapelesRamas.modo === "estructura" || portapapelesRamas.modo === "conjunto"
      ? "Pegar estructura"
      : "Agregar ramas";
  if (!portapapelesRamas) {
    elementosArbol.estadoPortapapeles.textContent = seleccionadas ? `${seleccionadas} rama${seleccionadas === 1 ? "" : "s"} seleccionada${seleccionadas === 1 ? "" : "s"}.` : "Copie toda la estructura o marque ramas específicas.";
  } else if (!compatible) {
    elementosArbol.estadoPortapapeles.textContent = `Copia disponible: ${portapapelesRamas.ramas.length} rama${portapapelesRamas.ramas.length === 1 ? "" : "s"}. Seleccione un nodo compatible.`;
  } else {
    const accion = portapapelesRamas.modo === "estructura" || portapapelesRamas.modo === "conjunto" ? "reemplazará las ramas actuales" : "se agregará al nodo";
    elementosArbol.estadoPortapapeles.textContent = `Copia lista: ${portapapelesRamas.ramas.length} rama${portapapelesRamas.ramas.length === 1 ? "" : "s"}; al pegar ${accion}.`;
  }
}

function copiarTodasLasRamas() {
  const nodo = buscarNodo(nodoSeleccionado);
  if (!nodo?.ramas.length) return;
  portapapelesRamas = crearCopiaDeRamas(arbol, nodoSeleccionado, nodo.ramas.map((_, indice) => indice), "estructura");
  renderizarEditor();
}

function copiarRamaIndividual(indice) {
  portapapelesRamas = crearCopiaDeRamas(arbol, nodoSeleccionado, [indice], "individual");
  actualizarEstadoPortapapeles();
}

function copiarRamasSeleccionadas() {
  const indices = [...elementosArbol.listaRamas.querySelectorAll(".seleccionar-rama:checked")]
    .map(entrada => Number(entrada.closest("[data-rama]").dataset.rama));
  if (!indices.length) return;
  portapapelesRamas = crearCopiaDeRamas(arbol, nodoSeleccionado, indices, "seleccion");
  renderizarEditor();
}

function pegarRamasCopiadas() {
  try {
    pegarCopiaDeRamas(arbol, nodoSeleccionado, portapapelesRamas);
    elementosArbol.mensaje.textContent = "";
    actualizarTodo();
  } catch (error) {
    elementosArbol.mensaje.textContent = error.message;
    actualizarEstadoPortapapeles();
  }
}

function calcularPosiciones(datos = arbol) {
  const posiciones = {};
  let profundidadMaxima = 0;
  const alturas = new Map();
  const midiendo = new Set();
  const altoMinimo = 90;
  const separacionHijos = 18;

  function medir(id) {
    if (midiendo.has(id)) throw new Error("El árbol contiene un ciclo.");
    midiendo.add(id);
    const nodo = buscarNodo(id, datos);
    const hijos = nodo?.ramas.map(rama => rama.destino) || [];
    const alto = hijos.length
      ? Math.max(altoMinimo, hijos.reduce((suma, hijo) => suma + medir(hijo), 0) + separacionHijos * (hijos.length - 1))
      : altoMinimo;
    alturas.set(id, alto);
    midiendo.delete(id);
    return alto;
  }

  function ubicar(id, profundidad, inicioY) {
    const nodo = buscarNodo(id, datos);
    const hijos = nodo?.ramas.map(rama => rama.destino) || [];
    profundidadMaxima = Math.max(profundidadMaxima, profundidad);
    const alto = alturas.get(id) || altoMinimo;
    if (hijos.length) {
      let cursorY = inicioY;
      hijos.forEach(hijo => {
        ubicar(hijo, profundidad + 1, cursorY);
        cursorY += (alturas.get(hijo) || altoMinimo) + separacionHijos;
      });
    }
    const y = hijos.length
      ? (posiciones[hijos[0]].y + posiciones[hijos[hijos.length - 1]].y) / 2
      : inicioY + alto / 2;
    posiciones[id] = { x: 62 + profundidad * 380, y };
    return posiciones[id];
  }

  const altoArbol = medir(datos.raiz);
  ubicar(datos.raiz, 0, 76);
  return {
    posiciones,
    ancho: Math.max(700, 310 + profundidadMaxima * 380),
    alto: Math.max(330, altoArbol + 152)
  };
}

function crearRutaConexion(inicioX, inicioY, finX, finY) {
  if (Math.abs(inicioY - finY) < 1) return `M ${inicioX} ${inicioY} H ${finX}`;
  const canalX = inicioX + Math.max(62, (finX - inicioX) * .38);
  const radio = Math.min(14, Math.abs(finY - inicioY) / 2, Math.abs(finX - inicioX) / 5);
  const direccion = finY > inicioY ? 1 : -1;
  return `M ${inicioX} ${inicioY} H ${canalX - radio} Q ${canalX} ${inicioY} ${canalX} ${inicioY + direccion * radio} V ${finY - direccion * radio} Q ${canalX} ${finY} ${canalX + radio} ${finY} H ${finX}`;
}

function recortarTexto(texto, limite) {
  const limpio = String(texto ?? "").trim();
  return limpio.length > limite ? `${limpio.slice(0, limite - 1)}…` : limpio;
}

function lineasNombreNodo(nombre) {
  const palabras = String(nombre ?? "").trim().split(/\s+/).filter(Boolean);
  if (!palabras.length) return ["Sin nombre"];
  const lineas = [""];
  palabras.forEach(palabra => {
    const candidata = `${lineas[lineas.length - 1]} ${palabra}`.trim();
    if (candidata.length <= 22 || lineas.length === 2) lineas[lineas.length - 1] = candidata;
    else lineas.push(palabra);
  });
  return lineas.slice(0, 2).map((linea, indice) => indice === 1 ? recortarTexto(linea, 22) : linea);
}

function ramasDeEstrategia() {
  const activas = new Set();
  if (!calculoActual) return activas;
  function recorrer(id) {
    const nodo = buscarNodo(id);
    if (!nodo || nodo.tipo === "terminal") return;
    if (nodo.tipo === "decision") {
      const indice = calculoActual.decisiones[id];
      if (indice == null) return;
      activas.add(`${id}:${indice}`);
      recorrer(nodo.ramas[indice].destino);
    } else {
      nodo.ramas.forEach((rama, indice) => { activas.add(`${id}:${indice}`); recorrer(rama.destino); });
    }
  }
  recorrer(arbol.raiz);
  return activas;
}

function renderizarDiagrama() {
  const { posiciones, ancho, alto } = calcularPosiciones();
  const activas = ramasDeEstrategia();
  const conexiones = [];
  arbol.nodos.forEach(nodo => nodo.ramas.forEach((rama, indice) => {
    const origen = posiciones[nodo.id];
    const destino = posiciones[rama.destino];
    if (!origen || !destino) return;
    const esOptima = activas.has(`${nodo.id}:${indice}`);
    const clase = esOptima ? "conexion-arbol optima" : "conexion-arbol";
    const marcador = esOptima ? "flecha-arbol-optima" : "flecha-arbol";
    const inicioX = origen.x + 189;
    const finX = destino.x - 29;
    const etiquetaX = finX - 78;
    const etiquetaY = destino.y - 61;
    const nodoDestino = buscarNodo(rama.destino);
    const detalles = [];
    if (nodo.tipo === "azar") detalles.push(`p = ${formatearArbol(numeroArbol(rama.probabilidad), 3)}`);
    if (nodoDestino?.tipo !== "terminal" && Math.abs(numeroArbol(rama.valor)) > 1e-12) detalles.push(`valor = ${formatearArbol(numeroArbol(rama.valor))}`);
    const detalle = detalles.join(" · ");
    const altoEtiqueta = detalle ? 42 : 30;
    const inicioEtiquetaY = etiquetaY - altoEtiqueta / 2;
    conexiones.push(`<g class="rama-diagrama${esOptima ? " optima" : ""}"><path class="${clase}" d="${crearRutaConexion(inicioX, origen.y, finX, destino.y)}" marker-end="url(#${marcador})"/><rect class="fondo-etiqueta-rama" x="${etiquetaX - 71}" y="${inicioEtiquetaY}" width="142" height="${altoEtiqueta}" rx="7"/><text class="etiqueta-rama" x="${etiquetaX}" y="${detalle ? etiquetaY - 4 : etiquetaY + 4}" text-anchor="middle">${escaparArbol(recortarTexto(rama.nombre, 24))}</text>${detalle ? `<text class="valor-rama" x="${etiquetaX}" y="${etiquetaY + 10}" text-anchor="middle">${escaparArbol(detalle)}</text>` : ""}</g>`);
  }));
  const nodosEstrategia = new Set([arbol.raiz]);
  activas.forEach(clave => {
    const [id, indiceTexto] = clave.split(":");
    const rama = buscarNodo(id)?.ramas[Number(indiceTexto)];
    if (rama) nodosEstrategia.add(rama.destino);
  });
  const nodos = arbol.nodos.map(nodo => {
    const posicion = posiciones[nodo.id];
    if (!posicion) return "";
    const valor = calculoActual?.valores[nodo.id];
    const seleccionado = nodo.id === nodoSeleccionado ? " seleccionado" : "";
    const enEstrategia = calculoActual && nodosEstrategia.has(nodo.id) ? " en-estrategia" : "";
    const figura = nodo.tipo === "decision" ? `<rect class="simbolo decision" x="-17" y="-17" width="34" height="34" rx="5"/>` : nodo.tipo === "azar" ? `<circle class="simbolo azar" r="17"/>` : `<polygon class="simbolo terminal" points="0,-18 18,0 0,18 -18,0"/>`;
    const lineas = lineasNombreNodo(nodo.nombre);
    const padre = nodo.tipo === "terminal" ? padreDe(nodo.id) : null;
    const resultadoTerminal = padre ? numeroArbol(padre.nodo.ramas[padre.indice].valor) : NaN;
    const textoValor = Number.isFinite(valor)
      ? nodo.tipo === "azar" ? `VME ${formatearArbol(valor)}` : nodo.tipo === "decision" ? `VME óptimo ${formatearArbol(valor)}` : `Valor final ${formatearArbol(resultadoTerminal)}`
      : nodo.tipo === "terminal" && Number.isFinite(resultadoTerminal) ? `Valor final ${formatearArbol(resultadoTerminal)}` : nodo.tipo === "terminal" ? "Resultado final" : "Sin evaluar";
    const nombreSvg = lineas.map((linea, indice) => `<tspan x="30" y="${lineas.length === 1 ? -5 : -13 + indice * 14}">${escaparArbol(linea)}</tspan>`).join("");
    return `<g class="nodo-arbol${seleccionado}${enEstrategia}" data-nodo="${nodo.id}" transform="translate(${posicion.x} ${posicion.y})" tabindex="0" role="button" aria-label="Editar ${escaparArbol(nodo.nombre)}"><rect class="tarjeta-nodo" x="-29" y="-39" width="218" height="78" rx="12"/>${figura}<text class="id-nodo" x="0" y="4" text-anchor="middle">${nodo.id.replace("n", "")}</text><text class="nombre-nodo">${nombreSvg}</text><text class="valor-nodo" x="30" y="25">${escaparArbol(textoValor)}</text></g>`;
  }).join("");
  elementosArbol.lienzo.dataset.ancho = ancho;
  elementosArbol.lienzo.dataset.alto = alto;
  elementosArbol.lienzo.innerHTML = `<svg viewBox="0 0 ${ancho} ${alto}" aria-label="Árbol de decisión"><defs><marker id="flecha-arbol" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#9a8d94"/></marker><marker id="flecha-arbol-optima" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#e3b447"/></marker></defs>${conexiones.join("")}${nodos}</svg>`;
  aplicarZoom();
}

function aplicarZoom() {
  const ancho = Number(elementosArbol.lienzo.dataset.ancho || 800);
  const alto = Number(elementosArbol.lienzo.dataset.alto || 400);
  const svg = elementosArbol.lienzo.querySelector("svg");
  if (svg) {
    svg.style.width = `${ancho * nivelZoom}px`;
    svg.style.height = `${alto * nivelZoom}px`;
  }
  elementosArbol.zoom.value = `${Math.round(nivelZoom * 100)} %`;
}

function ajustarZoom() {
  const ancho = Number(elementosArbol.lienzo.dataset.ancho || 800);
  const disponible = Math.max(320, elementosArbol.visor.clientWidth - 24);
  nivelZoom = Math.min(1.3, Math.max(.45, disponible / ancho));
  aplicarZoom();
}

function guardarArbol() {
  arbol.problema = elementosArbol.problema.value.trim();
  arbol.objetivo = elementosArbol.objetivo.value;
  try { localStorage.setItem(CLAVE_ARBOL, JSON.stringify(arbol)); } catch { /* El cálculo no depende del guardado. */ }
}

function restaurarArbol() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_ARBOL));
    if (!guardado?.raiz || !Array.isArray(guardado.nodos) || !guardado.nodos.length) return false;
    arbol = guardado;
    calcularPosiciones(arbol); // Rechazar estructuras cíclicas antes de dibujarlas.
    contadorNodos = Math.max(...arbol.nodos.map(nodo => Number(nodo.id.replace(/\D/g, "")) || 0));
    return true;
  } catch {
    return false;
  }
}

function cargarInterfaz() {
  mostrarEnunciadoGuia("caso-arbol-guia", arbol.caso);
  const casoReconocido = arbol.caso || ({
    "Lanzamiento de un producto": "lanzamiento",
    "Reparar o reemplazar un equipo": "mantenimiento",
    "Estudio previo al lanzamiento": "estudio"
  })[arbol.problema];
  if (casoReconocido) elementosArbol.caso.value = casoReconocido;
  elementosArbol.problema.value = arbol.problema || "";
  elementosArbol.objetivo.value = arbol.objetivo || "maximizar";
  nodoSeleccionado = arbol.raiz;
  calculoActual = null;
  elementosArbol.resultado.hidden = true;
  renderizarEditor();
  renderizarDiagrama();
}

function seleccionarNodo(id) {
  if (!buscarNodo(id)) return;
  nodoSeleccionado = id;
  renderizarEditor();
  renderizarDiagrama();
}

function cambiarTipoNodo() {
  const nodo = buscarNodo(nodoSeleccionado);
  const nuevoTipo = elementosArbol.tipoNodo.value;
  if (nodo.tipo === nuevoTipo) return;
  if (nuevoTipo === "terminal") eliminarDescendientes(nodo.id);
  nodo.tipo = nuevoTipo;
  if (nuevoTipo !== "terminal") {
    asegurarRamas(nodo);
    if (nuevoTipo === "azar") nodo.ramas.forEach(rama => { rama.probabilidad = 1 / nodo.ramas.length; });
    else nodo.ramas.forEach(rama => { rama.probabilidad = null; });
  }
  actualizarTodo();
}

function agregarRama() {
  const nodo = buscarNodo(nodoSeleccionado);
  if (!nodo || nodo.tipo === "terminal") return;
  const id = nuevoId();
  arbol.nodos.push({ id, tipo: "terminal", nombre: `Resultado ${arbol.nodos.length + 1}`, ramas: [] });
  nodo.ramas.push({ nombre: `Rama ${nodo.ramas.length + 1}`, valor: 0, probabilidad: nodo.tipo === "azar" ? 0 : null, destino: id });
  if (nodo.tipo === "azar") nodo.ramas.forEach(rama => { rama.probabilidad = 1 / nodo.ramas.length; });
  actualizarTodo();
}

function eliminarRama(indice) {
  const nodo = buscarNodo(nodoSeleccionado);
  if (!nodo || nodo.ramas.length <= 2) return;
  const rama = nodo.ramas[indice];
  const ids = nodosDescendientes(rama.destino);
  ids.add(rama.destino);
  arbol.nodos = arbol.nodos.filter(actual => !ids.has(actual.id));
  nodo.ramas.splice(indice, 1);
  if (nodo.tipo === "azar") nodo.ramas.forEach(actual => { actual.probabilidad = 1 / nodo.ramas.length; });
  actualizarTodo();
}

function eliminarNodoSeleccionado() {
  if (nodoSeleccionado === arbol.raiz) return;
  const padre = padreDe(nodoSeleccionado);
  if (!padre) return;
  const ids = nodosDescendientes(nodoSeleccionado);
  ids.add(nodoSeleccionado);
  arbol.nodos = arbol.nodos.filter(nodo => !ids.has(nodo.id));
  padre.nodo.ramas.splice(padre.indice, 1);
  nodoSeleccionado = padre.nodo.id;
  actualizarTodo();
}

function actualizarRama(evento) {
  const entrada = evento.target.closest("input[data-campo]");
  if (!entrada) return;
  const nodo = buscarNodo(nodoSeleccionado);
  const indice = Number(entrada.closest("[data-rama]").dataset.rama);
  nodo.ramas[indice][entrada.dataset.campo] = entrada.value;
  actualizarPosterior();
}

function actualizarPosterior() {
  calculoActual = null;
  calculoActual = null;
  elementosArbol.resultado.hidden = true;
  guardarArbol();
  renderizarDiagrama();
  clearTimeout(temporizadorArbol);
  temporizadorArbol = setTimeout(() => resolverArbol(false), 220);
}

function actualizarTodo() {
  calculoActual = null;
  elementosArbol.resultado.hidden = true;
  guardarArbol();
  renderizarEditor();
  renderizarDiagrama();
  clearTimeout(temporizadorArbol);
  temporizadorArbol = setTimeout(() => resolverArbol(false), 80);
}

function mostrarDesarrolloArbol(resultado) {
  elementosArbol.desarrollo.innerHTML = resultado.pasos.map((paso, indice) => {
    let formula;
    let texto;
    if (paso.tipo === "azar") {
      formula = paso.totales.map((total, posicion) => `(${formatearArbol(paso.probabilidades[posicion], 4)})(${formatearArbol(total, 4)})`).join("+");
      formula = `V=${formula}=${formatearArbol(paso.valor, 4)}`;
      texto = "Pondere cada rama por su probabilidad y sume.";
    } else {
      const operacion = arbol.objetivo === "minimizar" ? "menor" : "mayor";
      formula = `V=\\operatorname{${operacion}}\\{${paso.totales.map(total => formatearArbol(total, 4)).join(",") }\\}=${formatearArbol(paso.valor, 4)}`;
      texto = `Compare las ramas y conserve el valor ${operacion}.`;
    }
    return `<article class="paso-calculo"><span class="numero-paso">${String(indice + 1).padStart(2, "0")}</span><div><h3>${escaparArbol(paso.nodo.nombre)}</h3><p>${texto}</p></div><div class="formula">\\(${formula}\\)</div></article>`;
  }).join("");
  renderizarLatexArbol([elementosArbol.desarrollo]);
}

function resolverArbol(mostrar = true) {
  arbol.problema = elementosArbol.problema.value.trim() || "Árbol de decisión";
  arbol.objetivo = elementosArbol.objetivo.value;
  try {
    calculoActual = calcularArbol(arbol);
    elementosArbol.mensaje.textContent = "";
    const raiz = buscarNodo(arbol.raiz);
    const ramaInicial = raiz.tipo === "decision" ? raiz.ramas[calculoActual.indiceInicial] : null;
    elementosArbol.primeraDecision.textContent = ramaInicial?.nombre || "Evaluar el evento inicial";
    elementosArbol.valor.textContent = formatearArbol(calculoActual.valor);
    elementosArbol.detalleValor.textContent = arbol.objetivo === "minimizar" ? "costo esperado mínimo" : "beneficio esperado máximo";
    elementosArbol.nodosEvaluados.textContent = calculoActual.nodosEvaluados;
    elementosArbol.recomendacion.innerHTML = ramaInicial ? `<p>Desde <strong>${escaparArbol(raiz.nombre)}</strong>, elija <strong>${escaparArbol(ramaInicial.nombre)}</strong>. El valor calculado del árbol es <strong>${formatearArbol(calculoActual.valor)}</strong>.</p>` : `<p>El nodo inicial es de azar. Su valor esperado es <strong>${formatearArbol(calculoActual.valor)}</strong>.</p>`;
    elementosArbol.resultado.hidden = false;
    mostrarDesarrolloArbol(calculoActual);
    guardarArbol();
    renderizarDiagrama();
    document.querySelectorAll(".flujo li").forEach(elemento => elemento.classList.toggle("activo", elemento.dataset.paso === "estrategia"));
    if (mostrar) elementosArbol.resultado.scrollIntoView({ behavior: "smooth", block: "start" });
    return true;
  } catch (error) {
    calculoActual = null;
    elementosArbol.resultado.hidden = true;
    elementosArbol.mensaje.textContent = error.message;
    renderizarDiagrama();
    return false;
  }
}

function renderizarLatexArbol(contenedores) {
  if (!window.MathJax?.typesetPromise) return;
  window.MathJax.typesetClear?.(contenedores);
  window.MathJax.typesetPromise(contenedores).catch(() => {});
}

document.getElementById("formulario-arbol").addEventListener("submit", evento => evento.preventDefault());
elementosArbol.problema.addEventListener("input", () => { guardarArbol(); });
elementosArbol.objetivo.addEventListener("change", actualizarPosterior);
elementosArbol.nombreNodo.addEventListener("input", () => { const nodo = buscarNodo(nodoSeleccionado); nodo.nombre = elementosArbol.nombreNodo.value; elementosArbol.tituloNodo.textContent = nodo.nombre || "Sin nombre"; actualizarPosterior(); });
elementosArbol.tipoNodo.addEventListener("change", cambiarTipoNodo);
elementosArbol.listaRamas.addEventListener("input", actualizarRama);
elementosArbol.listaRamas.addEventListener("change", evento => {
  if (evento.target.matches(".seleccionar-rama")) actualizarEstadoPortapapeles();
});
elementosArbol.listaRamas.addEventListener("click", evento => {
  const abrir = evento.target.closest(".abrir-hijo");
  if (abrir) seleccionarNodo(abrir.dataset.destino);
  const copiar = evento.target.closest(".copiar-rama");
  if (copiar) copiarRamaIndividual(Number(copiar.closest("[data-rama]").dataset.rama));
  const eliminar = evento.target.closest(".eliminar-rama");
  if (eliminar) eliminarRama(Number(eliminar.closest("[data-rama]").dataset.rama));
});
elementosArbol.copiarTodasRamas.addEventListener("click", copiarTodasLasRamas);
elementosArbol.copiarRamas.addEventListener("click", copiarRamasSeleccionadas);
elementosArbol.pegarRamas.addEventListener("click", pegarRamasCopiadas);
elementosArbol.agregarRama.addEventListener("click", agregarRama);
elementosArbol.eliminarNodo.addEventListener("click", eliminarNodoSeleccionado);
elementosArbol.lienzo.addEventListener("click", evento => { const nodo = evento.target.closest("[data-nodo]"); if (nodo) seleccionarNodo(nodo.dataset.nodo); });
elementosArbol.lienzo.addEventListener("keydown", evento => { if ((evento.key === "Enter" || evento.key === " ") && evento.target.matches("[data-nodo]")) seleccionarNodo(evento.target.dataset.nodo); });
document.getElementById("resolver-arbol").addEventListener("click", () => resolverArbol(true));
document.getElementById("ejemplo-arbol").addEventListener("click", () => { arbol = crearEjemploArbol(elementosArbol.caso.value); cargarInterfaz(); resolverArbol(false); ajustarZoom(); });
document.getElementById("limpiar-arbol").addEventListener("click", () => { arbol = crearArbolVacio(); asegurarRamas(buscarNodo(arbol.raiz)); cargarInterfaz(); guardarArbol(); ajustarZoom(); });
document.getElementById("alejar-arbol").addEventListener("click", () => { nivelZoom = Math.max(.4, nivelZoom - .1); aplicarZoom(); });
document.getElementById("acercar-arbol").addEventListener("click", () => { nivelZoom = Math.min(1.8, nivelZoom + .1); aplicarZoom(); });
document.getElementById("ajustar-arbol").addEventListener("click", ajustarZoom);
document.getElementById("imprimir-arbol").addEventListener("click", () => window.print());
document.getElementById("teoria-arbol").addEventListener("click", () => { elementosArbol.dialogo.showModal(); renderizarLatexArbol([elementosArbol.dialogo]); });
document.querySelectorAll(".cerrar-dialogo").forEach(boton => boton.addEventListener("click", evento => evento.target.closest("dialog")?.close()));
elementosArbol.dialogo.addEventListener("click", evento => { if (evento.target === elementosArbol.dialogo) elementosArbol.dialogo.close(); });

agregarCasosGuia(elementosArbol.caso);
if (!restaurarArbol()) arbol = crearEjemploArbol();
cargarInterfaz();
resolverArbol(false);
requestAnimationFrame(ajustarZoom);
