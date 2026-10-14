"use strict";

const CLAVE_ARBOL = "teoria-decisiones-arbol-v1";
const elementosArbol = {
  problema: document.getElementById("problema-arbol"),
  objetivo: document.getElementById("objetivo-arbol"),
  nombreNodo: document.getElementById("nombre-nodo"),
  tipoNodo: document.getElementById("tipo-nodo"),
  tituloNodo: document.getElementById("titulo-nodo-seleccionado"),
  identificadorNodo: document.getElementById("identificador-nodo"),
  ayudaTipo: document.getElementById("ayuda-tipo"),
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

function numeroArbol(valor) {
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

function crearEjemploArbol() {
  contadorNodos = 7;
  return {
    problema: "Lanzamiento de un producto",
    objetivo: "maximizar",
    raiz: "n1",
    nodos: [
      { id: "n1", tipo: "decision", nombre: "Estrategia inicial", ramas: [
        { nombre: "Desarrollar", valor: -60, probabilidad: null, destino: "n2" },
        { nombre: "Licenciar", valor: 55, probabilidad: null, destino: "n3" }
      ] },
      { id: "n2", tipo: "azar", nombre: "Resultado técnico", ramas: [
        { nombre: "Éxito", valor: 0, probabilidad: .65, destino: "n4" },
        { nombre: "Fallo", valor: -30, probabilidad: .35, destino: "n5" }
      ] },
      { id: "n3", tipo: "terminal", nombre: "Ingreso seguro", ramas: [] },
      { id: "n4", tipo: "decision", nombre: "Escala de lanzamiento", ramas: [
        { nombre: "Amplio", valor: 220, probabilidad: null, destino: "n6" },
        { nombre: "Limitado", valor: 150, probabilidad: null, destino: "n7" }
      ] },
      { id: "n5", tipo: "terminal", nombre: "Proyecto detenido", ramas: [] },
      { id: "n6", tipo: "terminal", nombre: "Mercado nacional", ramas: [] },
      { id: "n7", tipo: "terminal", nombre: "Mercado regional", ramas: [] }
    ]
  };
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
  elementosArbol.listaRamas.innerHTML = nodo.ramas.map((rama, indice) => `<article class="rama-editor" data-rama="${indice}"><div class="cabecera-rama"><strong>Rama ${indice + 1}</strong><button class="eliminar eliminar-rama" type="button" aria-label="Eliminar rama" ${nodo.ramas.length <= 2 ? "disabled" : ""}>×</button></div><label>Nombre<input data-campo="nombre" type="text" maxlength="45" value="${escaparArbol(rama.nombre)}"></label><div class="campos-rama"><label>Valor inmediato<input data-campo="valor" type="number" step="any" value="${rama.valor}"></label>${nodo.tipo === "azar" ? `<label>Probabilidad<input data-campo="probabilidad" type="number" min="0" step="any" value="${rama.probabilidad ?? 0}"></label>` : ""}</div><button class="abrir-hijo" type="button" data-destino="${rama.destino}">Editar nodo siguiente <span>→</span></button></article>`).join("");
  elementosArbol.listaRamas.hidden = nodo.tipo === "terminal";
  elementosArbol.agregarRama.hidden = nodo.tipo === "terminal";
  elementosArbol.eliminarNodo.disabled = nodo.id === arbol.raiz;
}

function calcularPosiciones() {
  const posiciones = {};
  let hoja = 0;
  let profundidadMaxima = 0;
  function ubicar(id, profundidad) {
    const nodo = buscarNodo(id);
    profundidadMaxima = Math.max(profundidadMaxima, profundidad);
    const hijos = nodo?.ramas.map(rama => rama.destino) || [];
    let y;
    if (!hijos.length) {
      y = 72 + hoja * 128;
      hoja += 1;
    } else {
      const posicionesHijos = hijos.map(hijo => ubicar(hijo, profundidad + 1));
      y = posicionesHijos.reduce((suma, posicion) => suma + posicion.y, 0) / posicionesHijos.length;
    }
    posiciones[id] = { x: 62 + profundidad * 300, y };
    return posiciones[id];
  }
  ubicar(arbol.raiz, 0);
  return { posiciones, ancho: Math.max(660, 250 + profundidadMaxima * 300), alto: Math.max(310, 142 + Math.max(0, hoja - 1) * 128) };
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
    const inicioX = origen.x + 163;
    const finX = destino.x - 29;
    const control = Math.max(55, (finX - inicioX) * .48);
    const probabilidad = nodo.tipo === "azar" ? ` · p ${formatearArbol(numeroArbol(rama.probabilidad), 3)}` : "";
    conexiones.push(`<g class="rama-diagrama"><path class="${clase}" d="M ${inicioX} ${origen.y} C ${inicioX + control} ${origen.y}, ${finX - control} ${destino.y}, ${finX} ${destino.y}" marker-end="url(#${marcador})"/><rect class="fondo-etiqueta-rama" x="${(inicioX + finX) / 2 - 58}" y="${(origen.y + destino.y) / 2 - 18}" width="116" height="31" rx="7"/><text class="etiqueta-rama" x="${(inicioX + finX) / 2}" y="${(origen.y + destino.y) / 2 - 5}" text-anchor="middle">${escaparArbol(rama.nombre).slice(0, 17)}</text><text class="valor-rama" x="${(inicioX + finX) / 2}" y="${(origen.y + destino.y) / 2 + 7}" text-anchor="middle">${formatearArbol(numeroArbol(rama.valor))}${probabilidad}</text></g>`);
  }));
  const nodos = arbol.nodos.map(nodo => {
    const posicion = posiciones[nodo.id];
    if (!posicion) return "";
    const valor = calculoActual?.valores[nodo.id];
    const seleccionado = nodo.id === nodoSeleccionado ? " seleccionado" : "";
    const figura = nodo.tipo === "decision" ? `<rect class="simbolo decision" x="-17" y="-17" width="34" height="34" rx="5"/>` : nodo.tipo === "azar" ? `<circle class="simbolo azar" r="17"/>` : `<polygon class="simbolo terminal" points="0,-18 18,0 0,18 -18,0"/>`;
    return `<g class="nodo-arbol${seleccionado}" data-nodo="${nodo.id}" transform="translate(${posicion.x} ${posicion.y})" tabindex="0" role="button" aria-label="Editar ${escaparArbol(nodo.nombre)}"><rect class="tarjeta-nodo" x="-29" y="-31" width="192" height="62" rx="12"/>${figura}<text class="id-nodo" x="0" y="4" text-anchor="middle">${nodo.id.replace("n", "")}</text><text class="nombre-nodo" x="28" y="-5">${escaparArbol(nodo.nombre).slice(0, 21)}</text><text class="valor-nodo" x="28" y="14">${Number.isFinite(valor) ? `Valor ${formatearArbol(valor)}` : nodo.tipo === "terminal" ? "Fin" : "Sin evaluar"}</text></g>`;
  }).join("");
  elementosArbol.lienzo.dataset.ancho = ancho;
  elementosArbol.lienzo.dataset.alto = alto;
  elementosArbol.lienzo.innerHTML = `<svg viewBox="0 0 ${ancho} ${alto}" aria-label="Árbol de decisión"><defs><marker id="flecha-arbol" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="#9a8d94"/></marker><marker id="flecha-arbol-optima" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="#e3b447"/></marker></defs>${conexiones.join("")}${nodos}</svg>`;
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
  localStorage.setItem(CLAVE_ARBOL, JSON.stringify(arbol));
}

function restaurarArbol() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_ARBOL));
    if (!guardado?.raiz || !Array.isArray(guardado.nodos) || !guardado.nodos.length) return false;
    arbol = guardado;
    contadorNodos = Math.max(...arbol.nodos.map(nodo => Number(nodo.id.replace(/\D/g, "")) || 0));
    return true;
  } catch {
    return false;
  }
}

function cargarInterfaz() {
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
    elementosArbol.mensaje.textContent = mostrar ? error.message : "";
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
elementosArbol.listaRamas.addEventListener("click", evento => {
  const abrir = evento.target.closest(".abrir-hijo");
  if (abrir) seleccionarNodo(abrir.dataset.destino);
  const eliminar = evento.target.closest(".eliminar-rama");
  if (eliminar) eliminarRama(Number(eliminar.closest("[data-rama]").dataset.rama));
});
elementosArbol.agregarRama.addEventListener("click", agregarRama);
elementosArbol.eliminarNodo.addEventListener("click", eliminarNodoSeleccionado);
elementosArbol.lienzo.addEventListener("click", evento => { const nodo = evento.target.closest("[data-nodo]"); if (nodo) seleccionarNodo(nodo.dataset.nodo); });
elementosArbol.lienzo.addEventListener("keydown", evento => { if ((evento.key === "Enter" || evento.key === " ") && evento.target.matches("[data-nodo]")) seleccionarNodo(evento.target.dataset.nodo); });
document.getElementById("resolver-arbol").addEventListener("click", () => resolverArbol(true));
document.getElementById("ejemplo-arbol").addEventListener("click", () => { arbol = crearEjemploArbol(); localStorage.removeItem(CLAVE_ARBOL); cargarInterfaz(); resolverArbol(false); ajustarZoom(); });
document.getElementById("limpiar-arbol").addEventListener("click", () => { arbol = crearArbolVacio(); asegurarRamas(buscarNodo(arbol.raiz)); localStorage.removeItem(CLAVE_ARBOL); cargarInterfaz(); ajustarZoom(); });
document.getElementById("alejar-arbol").addEventListener("click", () => { nivelZoom = Math.max(.4, nivelZoom - .1); aplicarZoom(); });
document.getElementById("acercar-arbol").addEventListener("click", () => { nivelZoom = Math.min(1.8, nivelZoom + .1); aplicarZoom(); });
document.getElementById("ajustar-arbol").addEventListener("click", ajustarZoom);
document.getElementById("imprimir-arbol").addEventListener("click", () => window.print());
document.getElementById("teoria-arbol").addEventListener("click", () => { elementosArbol.dialogo.showModal(); renderizarLatexArbol([elementosArbol.dialogo]); });
document.querySelectorAll(".cerrar-dialogo").forEach(boton => boton.addEventListener("click", evento => evento.target.closest("dialog")?.close()));
elementosArbol.dialogo.addEventListener("click", evento => { if (evento.target === elementosArbol.dialogo) elementosArbol.dialogo.close(); });

if (!restaurarArbol()) arbol = crearEjemploArbol();
cargarInterfaz();
resolverArbol(false);
requestAnimationFrame(ajustarZoom);
