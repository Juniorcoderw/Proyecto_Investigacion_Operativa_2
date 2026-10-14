"use strict";

const CLAVE_GUARDADO = "teoria-decisiones-v1";
const elementos = {
  formulario: document.getElementById("formulario-decision"),
  problema: document.getElementById("problema"),
  tipoMatriz: document.getElementById("tipo-matriz"),
  alfa: document.getElementById("alfa-hurwicz"),
  valorAlfa: document.getElementById("valor-alfa"),
  sumaProbabilidades: document.getElementById("suma-probabilidades"),
  mensaje: document.getElementById("mensaje"),
  cabeceraTabla: document.getElementById("cabecera-tabla"),
  cuerpoTabla: document.getElementById("cuerpo-tabla"),
  pieTabla: document.getElementById("pie-tabla"),
  salida: document.getElementById("salida"),
  tituloResultado: document.getElementById("titulo-resultado"),
  decisionEsperada: document.getElementById("decision-esperada"),
  detalleEsperado: document.getElementById("detalle-esperado"),
  mejorValor: document.getElementById("mejor-valor"),
  evpi: document.getElementById("evpi"),
  consenso: document.getElementById("consenso"),
  detalleConsenso: document.getElementById("detalle-consenso"),
  recomendacion: document.getElementById("recomendacion"),
  tarjetasCriterios: document.getElementById("tarjetas-criterios"),
  graficoValores: document.getElementById("grafico-valores"),
  cabeceraArrepentimiento: document.getElementById("cabecera-arrepentimiento"),
  cuerpoArrepentimiento: document.getElementById("cuerpo-arrepentimiento"),
  desarrollo: document.getElementById("desarrollo"),
  dialogoGuia: document.getElementById("dialogo-guia"),
  dialogoPegar: document.getElementById("dialogo-pegar"),
  datosPegados: document.getElementById("datos-pegados")
};

let estados = [];
let alternativas = [];
let probabilidades = [];
let ultimoResultado = null;
let temporizador = null;

function numero(valor) {
  const convertido = Number(String(valor ?? "").trim().replace(",", "."));
  return Number.isFinite(convertido) ? convertido : NaN;
}

function formatear(valor, maximo = 2) {
  if (!Number.isFinite(valor)) return "—";
  return new Intl.NumberFormat("es-PE", { maximumFractionDigits: maximo }).format(valor);
}

function escaparHtml(texto) {
  return String(texto ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function normalizarProbabilidades(valores) {
  const numeros = valores.map(numero);
  const suma = numeros.reduce((total, valor) => total + valor, 0);
  if (numeros.some(valor => valor < 0 || !Number.isFinite(valor))) return null;
  if (Math.abs(suma - 100) < 1e-8) return numeros.map(valor => valor / 100);
  if (Math.abs(suma - 1) < 1e-8) return numeros;
  return null;
}

function elegirIndice(valores, elegirMayor) {
  const objetivo = elegirMayor ? Math.max(...valores) : Math.min(...valores);
  return valores.findIndex(valor => Math.abs(valor - objetivo) < 1e-9);
}

function calcularDecision(datos) {
  const elegirMayor = datos.tipoMatriz === "beneficios";
  const filas = datos.alternativas.map(alternativa => alternativa.valores);
  const mejores = filas.map(fila => Math.max(...fila));
  const peores = filas.map(fila => Math.min(...fila));
  const promedios = filas.map(fila => fila.reduce((suma, valor) => suma + valor, 0) / fila.length);
  const hurwicz = filas.map((fila, indice) => elegirMayor
    ? datos.alfa * mejores[indice] + (1 - datos.alfa) * peores[indice]
    : datos.alfa * peores[indice] + (1 - datos.alfa) * mejores[indice]);
  const valoresEsperados = filas.map(fila => fila.reduce((suma, valor, indice) => suma + valor * datos.probabilidades[indice], 0));
  const referenciaEstados = datos.estados.map((_, indiceEstado) => {
    const columna = filas.map(fila => fila[indiceEstado]);
    return elegirMayor ? Math.max(...columna) : Math.min(...columna);
  });
  const arrepentimientos = filas.map(fila => fila.map((valor, indiceEstado) => elegirMayor ? referenciaEstados[indiceEstado] - valor : valor - referenciaEstados[indiceEstado]));
  const arrepentimientosMaximos = arrepentimientos.map(fila => Math.max(...fila));
  const criterios = [
    { id: "optimista", nombre: elegirMayor ? "Maximax" : "Minimin", explicacion: elegirMayor ? "Escoge el mayor resultado posible." : "Escoge el menor costo posible.", valores: elegirMayor ? mejores : peores, mayor: elegirMayor },
    { id: "conservador", nombre: elegirMayor ? "Maximin · Wald" : "Minimax · Wald", explicacion: "Protege frente al resultado menos favorable.", valores: elegirMayor ? peores : mejores, mayor: elegirMayor },
    { id: "hurwicz", nombre: "Hurwicz", explicacion: `Equilibra optimismo y prudencia con α = ${formatear(datos.alfa, 2)}.`, valores: hurwicz, mayor: elegirMayor },
    { id: "laplace", nombre: "Laplace", explicacion: "Asigna el mismo peso a todos los estados.", valores: promedios, mayor: elegirMayor },
    { id: "savage", nombre: "Minimax · Savage", explicacion: "Minimiza el peor costo de oportunidad.", valores: arrepentimientosMaximos, mayor: false },
    { id: "esperado", nombre: "Valor esperado · Bayes", explicacion: "Usa las probabilidades ingresadas.", valores: valoresEsperados, mayor: elegirMayor }
  ].map(criterio => ({ ...criterio, indice: elegirIndice(criterio.valores, criterio.mayor), valor: criterio.valores[elegirIndice(criterio.valores, criterio.mayor)] }));

  const criterioEsperado = criterios.find(criterio => criterio.id === "esperado");
  const valorInformacionPerfecta = referenciaEstados.reduce((suma, valor, indice) => suma + valor * datos.probabilidades[indice], 0);
  const evpi = elegirMayor ? valorInformacionPerfecta - criterioEsperado.valor : criterioEsperado.valor - valorInformacionPerfecta;
  const votos = criterios.reduce((conteo, criterio) => {
    conteo[criterio.indice] = (conteo[criterio.indice] || 0) + 1;
    return conteo;
  }, {});
  const indiceConsenso = Number(Object.entries(votos).sort((a, b) => b[1] - a[1])[0][0]);

  return { ...datos, elegirMayor, filas, mejores, peores, promedios, hurwicz, valoresEsperados, referenciaEstados, arrepentimientos, arrepentimientosMaximos, criterios, criterioEsperado, valorInformacionPerfecta, evpi: Math.max(0, evpi), indiceConsenso, votos: votos[indiceConsenso] };
}

function datosIniciales() {
  estados = [{ nombre: "Demanda alta" }, { nombre: "Demanda media" }, { nombre: "Demanda baja" }];
  alternativas = [
    { nombre: "Planta grande", valores: [200, 80, -120] },
    { nombre: "Planta mediana", valores: [140, 90, -20] },
    { nombre: "No ampliar", valores: [40, 40, 40] }
  ];
  probabilidades = [.30, .50, .20];
}

function renderizarTabla() {
  elementos.cabeceraTabla.innerHTML = `<tr><th>Alternativa</th>${estados.map((estado, indice) => `<th><input data-estado="${indice}" type="text" value="${escaparHtml(estado.nombre)}" aria-label="Nombre del estado ${indice + 1}"></th>`).join("")}<th></th></tr>`;
  elementos.cuerpoTabla.innerHTML = alternativas.map((alternativa, indiceAlternativa) => `<tr data-alternativa="${indiceAlternativa}"><td><input data-nombre-alternativa type="text" value="${escaparHtml(alternativa.nombre)}" aria-label="Nombre de la alternativa ${indiceAlternativa + 1}"></td>${estados.map((_, indiceEstado) => `<td><input data-valor="${indiceEstado}" type="number" step="any" value="${alternativa.valores[indiceEstado] ?? 0}" aria-label="Resultado de ${escaparHtml(alternativa.nombre)} en ${escaparHtml(estados[indiceEstado].nombre)}"></td>`).join("")}<td><button class="eliminar eliminar-alternativa" type="button" aria-label="Eliminar ${escaparHtml(alternativa.nombre)}" ${alternativas.length <= 2 ? "disabled" : ""}>×</button></td></tr>`).join("");
  elementos.pieTabla.innerHTML = `<tr><td>Probabilidad</td>${probabilidades.map((probabilidad, indice) => `<td><input data-probabilidad="${indice}" type="number" min="0" step="any" value="${probabilidad}" aria-label="Probabilidad de ${escaparHtml(estados[indice].nombre)}"></td>`).join("")}<td><button class="eliminar eliminar-estado" type="button" aria-label="Eliminar último estado" ${estados.length <= 2 ? "disabled" : ""}>−</button></td></tr>`;
  actualizarSumaProbabilidades();
}

function leerDatos() {
  return {
    problema: elementos.problema.value.trim() || "Problema de decisión",
    tipoMatriz: elementos.tipoMatriz.value,
    alfa: numero(elementos.alfa.value),
    estados: estados.map(estado => ({ nombre: estado.nombre.trim() || "Estado" })),
    alternativas: alternativas.map(alternativa => ({ nombre: alternativa.nombre.trim() || "Alternativa", valores: alternativa.valores.map(numero) })),
    probabilidades: normalizarProbabilidades(probabilidades)
  };
}

function validarDatos(datos, mostrar = true) {
  let error = "";
  if (datos.alternativas.length < 2 || datos.estados.length < 2) error = "Ingrese al menos dos alternativas y dos estados.";
  else if (datos.alternativas.some(alternativa => alternativa.valores.some(valor => !Number.isFinite(valor)))) error = "Complete todos los valores de la matriz.";
  else if (!datos.probabilidades) error = "Las probabilidades deben ser válidas y sumar 1 o 100 %.";
  if (mostrar) elementos.mensaje.textContent = error;
  return !error;
}

function resolver(mostrar = true) {
  const datos = leerDatos();
  if (!validarDatos(datos, mostrar)) return false;
  elementos.mensaje.textContent = "";
  mostrarResultado(calcularDecision(datos));
  guardar();
  return true;
}

function mostrarResultado(resultado) {
  ultimoResultado = resultado;
  elementos.salida.hidden = false;
  elementos.tituloResultado.textContent = resultado.problema;
  const alternativaEsperada = resultado.alternativas[resultado.criterioEsperado.indice].nombre;
  const alternativaConsenso = resultado.alternativas[resultado.indiceConsenso].nombre;
  elementos.decisionEsperada.textContent = alternativaEsperada;
  elementos.detalleEsperado.textContent = "alternativa recomendada bajo riesgo";
  elementos.mejorValor.textContent = formatear(resultado.criterioEsperado.valor);
  elementos.evpi.textContent = formatear(resultado.evpi);
  elementos.consenso.textContent = `${resultado.votos} de ${resultado.criterios.length}`;
  elementos.detalleConsenso.textContent = alternativaConsenso;
  elementos.recomendacion.innerHTML = `<p>Con las probabilidades ingresadas, elija <strong>${escaparHtml(alternativaEsperada)}</strong>: su valor esperado es <strong>${formatear(resultado.criterioEsperado.valor)}</strong>. La información perfecta no debería costar más de <strong>${formatear(resultado.evpi)}</strong>.</p>`;
  mostrarCriterios(resultado);
  mostrarArrepentimiento(resultado);
  mostrarDesarrollo(resultado);
  dibujarGrafico(resultado);
  actualizarFlujo("criterios");
}

function mostrarCriterios(resultado) {
  elementos.tarjetasCriterios.innerHTML = resultado.criterios.map(criterio => `<article class="tarjeta-criterio"><span>${criterio.nombre}</span><h3>${escaparHtml(resultado.alternativas[criterio.indice].nombre)}</h3><strong>${formatear(criterio.valor)}</strong><p>${criterio.explicacion}</p></article>`).join("");
}

function mostrarArrepentimiento(resultado) {
  elementos.cabeceraArrepentimiento.innerHTML = `<tr><th>Alternativa</th>${resultado.estados.map(estado => `<th>${escaparHtml(estado.nombre)}</th>`).join("")}<th>Arrep. máximo</th></tr>`;
  const indiceGanador = resultado.criterios.find(criterio => criterio.id === "savage").indice;
  elementos.cuerpoArrepentimiento.innerHTML = resultado.alternativas.map((alternativa, indice) => `<tr class="${indice === indiceGanador ? "ganador" : ""}"><td>${escaparHtml(alternativa.nombre)}</td>${resultado.arrepentimientos[indice].map(valor => `<td>${formatear(valor)}</td>`).join("")}<td><strong>${formatear(resultado.arrepentimientosMaximos[indice])}</strong></td></tr>`).join("");
}

function paso(numeroPaso, titulo, explicacion, formula) {
  return `<article class="paso-calculo"><span class="numero-paso">${numeroPaso}</span><div><h3>${titulo}</h3><p>${explicacion}</p></div><div class="formula">\\(${formula}\\)</div></article>`;
}

function mostrarDesarrollo(resultado) {
  const pasos = [];
  const listaProbabilidades = resultado.probabilidades.map(valor => formatear(valor, 4)).join(",\\quad ");
  pasos.push(paso("01", "Comprobar probabilidades", "La suma debe ser uno antes de calcular valores esperados.", `p=(${listaProbabilidades}),\\quad \\sum p_j=1`));
  resultado.alternativas.forEach((alternativa, indice) => {
    const productos = alternativa.valores.map((valor, j) => `(${formatear(resultado.probabilidades[j], 4)})(${formatear(valor, 4)})`).join("+");
    pasos.push(paso(String(pasos.length + 1).padStart(2, "0"), `Valor esperado de ${escaparHtml(alternativa.nombre)}`, "Multiplique cada resultado por la probabilidad del estado y sume.", `VE_${indice + 1}=${productos}=${formatear(resultado.valoresEsperados[indice], 4)}`));
  });
  const indiceValor = resultado.criterioEsperado.indice;
  pasos.push(paso(String(pasos.length + 1).padStart(2, "0"), "Elegir por valor esperado", resultado.elegirMayor ? "Seleccione el valor esperado mayor." : "Seleccione el costo esperado menor.", `VE^*=${formatear(resultado.criterioEsperado.valor, 4)}\\Rightarrow A_${indiceValor + 1}`));
  pasos.push(paso(String(pasos.length + 1).padStart(2, "0"), "Calcular información perfecta", "Primero elija el mejor resultado de cada estado y luego reste el valor esperado óptimo.", `VE_{PI}=${formatear(resultado.valorInformacionPerfecta, 4)},\\quad EVPI=${formatear(resultado.evpi, 4)}`));
  const criterioSavage = resultado.criterios.find(criterio => criterio.id === "savage");
  pasos.push(paso(String(pasos.length + 1).padStart(2, "0"), "Minimizar el arrepentimiento", "Compare el mayor arrepentimiento de cada alternativa y conserve el menor.", `\\min_i\\{${resultado.arrepentimientosMaximos.map(valor => formatear(valor, 4)).join(",") }\\}=${formatear(criterioSavage.valor, 4)}`));
  elementos.desarrollo.innerHTML = pasos.join("");
  renderizarLatex([elementos.desarrollo]);
}

function dibujarGrafico(resultado) {
  const ancho = 920;
  const alto = 310;
  const margen = { izquierda: 72, derecha: 25, superior: 28, inferior: 65 };
  const anchoUtil = ancho - margen.izquierda - margen.derecha;
  const altoUtil = alto - margen.superior - margen.inferior;
  const valores = resultado.valoresEsperados;
  const minimo = Math.min(0, ...valores);
  const maximo = Math.max(0, ...valores);
  const amplitud = Math.max(1, maximo - minimo);
  const ceroY = margen.superior + (maximo - 0) / amplitud * altoUtil;
  const anchoGrupo = anchoUtil / valores.length;
  const indiceOptimo = resultado.criterioEsperado.indice;
  const barras = valores.map((valor, indice) => {
    const x = margen.izquierda + indice * anchoGrupo + anchoGrupo * .18;
    const yValor = margen.superior + (maximo - valor) / amplitud * altoUtil;
    const y = Math.min(ceroY, yValor);
    const altoBarra = Math.max(2, Math.abs(ceroY - yValor));
    const color = indice === indiceOptimo ? "#e3b447" : "#76415c";
    return `<rect x="${x}" y="${y}" width="${anchoGrupo * .64}" height="${altoBarra}" rx="7" fill="${color}"><title>${escaparHtml(resultado.alternativas[indice].nombre)}: ${formatear(valor)}</title></rect><text x="${x + anchoGrupo * .32}" y="${valor >= 0 ? y - 8 : y + altoBarra + 15}" text-anchor="middle" fill="#51464c" font-size="11" font-weight="700">${formatear(valor)}</text><text x="${x + anchoGrupo * .32}" y="${alto - 29}" text-anchor="middle" fill="#6f656a" font-size="10">${escaparHtml(resultado.alternativas[indice].nombre).slice(0,18)}</text>`;
  }).join("");
  elementos.graficoValores.innerHTML = `<svg viewBox="0 0 ${ancho} ${alto}" role="img" aria-labelledby="titulo-grafico-ve"><title id="titulo-grafico-ve">Valor esperado por alternativa</title>${[0,.25,.5,.75,1].map(proporcion => { const valor = minimo + amplitud * proporcion; const y = margen.superior + (maximo - valor) / amplitud * altoUtil; return `<line x1="${margen.izquierda}" y1="${y}" x2="${ancho-margen.derecha}" y2="${y}" stroke="#e3ddd8"/><text x="${margen.izquierda-9}" y="${y+4}" text-anchor="end" fill="#80767b" font-size="10">${formatear(valor,0)}</text>`; }).join("")}<line x1="${margen.izquierda}" y1="${ceroY}" x2="${ancho-margen.derecha}" y2="${ceroY}" stroke="#695d63" stroke-width="1.5"/>${barras}</svg>`;
}

function actualizarSumaProbabilidades() {
  const valores = probabilidades.map(numero);
  const suma = valores.reduce((total, valor) => total + (Number.isFinite(valor) ? valor : 0), 0);
  const esPorcentaje = suma > 1.0000001;
  const texto = esPorcentaje ? `${formatear(suma, 2)} %` : `${formatear(suma * 100, 2)} %`;
  const valida = Boolean(normalizarProbabilidades(probabilidades));
  elementos.sumaProbabilidades.textContent = `Suma: ${texto}`;
  elementos.sumaProbabilidades.classList.toggle("invalido", !valida);
}

function agregarAlternativa() {
  alternativas.push({ nombre: `Alternativa ${alternativas.length + 1}`, valores: estados.map(() => 0) });
  renderizarTabla();
  programarResolucion();
}

function agregarEstado() {
  estados.push({ nombre: `Estado ${estados.length + 1}` });
  alternativas.forEach(alternativa => alternativa.valores.push(0));
  probabilidades = estados.map(() => 1 / estados.length);
  renderizarTabla();
  programarResolucion();
}

function actualizarMatriz(evento) {
  const entrada = evento.target;
  if (entrada.matches("[data-estado]")) estados[Number(entrada.dataset.estado)].nombre = entrada.value;
  if (entrada.matches("[data-probabilidad]")) probabilidades[Number(entrada.dataset.probabilidad)] = entrada.value;
  const fila = entrada.closest("tr[data-alternativa]");
  if (fila) {
    const indice = Number(fila.dataset.alternativa);
    if (entrada.matches("[data-nombre-alternativa]")) alternativas[indice].nombre = entrada.value;
    if (entrada.matches("[data-valor]")) alternativas[indice].valores[Number(entrada.dataset.valor)] = entrada.value;
  }
  actualizarSumaProbabilidades();
  programarResolucion();
}

function importarMatriz() {
  const lineas = elementos.datosPegados.value.trim().split(/\r?\n/).filter(Boolean).map(linea => linea.split(linea.includes("\t") ? "\t" : ";").map(celda => celda.trim()));
  if (lineas.length < 3 || lineas[0].length < 3) return reportarImportacion("La tabla necesita encabezado, dos alternativas y dos estados.");
  const nuevosEstados = lineas[0].slice(1).map((nombre, indice) => ({ nombre: nombre || `Estado ${indice + 1}` }));
  const filaProbabilidad = lineas.find(fila => /^probabilidad/i.test(fila[0]));
  const filasAlternativas = lineas.slice(1).filter(fila => !/^probabilidad/i.test(fila[0]));
  const nuevasAlternativas = filasAlternativas.map((fila, indice) => ({ nombre: fila[0] || `Alternativa ${indice + 1}`, valores: fila.slice(1, nuevosEstados.length + 1).map(numero) }));
  if (nuevasAlternativas.length < 2 || nuevasAlternativas.some(alternativa => alternativa.valores.length !== nuevosEstados.length || alternativa.valores.some(valor => !Number.isFinite(valor)))) return reportarImportacion("Revise que todas las filas tengan la misma cantidad de valores numéricos.");
  const nuevasProbabilidades = filaProbabilidad ? filaProbabilidad.slice(1, nuevosEstados.length + 1).map(numero) : nuevosEstados.map(() => 1 / nuevosEstados.length);
  if (!normalizarProbabilidades(nuevasProbabilidades)) return reportarImportacion("Las probabilidades deben sumar 1 o 100 %.");
  estados = nuevosEstados;
  alternativas = nuevasAlternativas;
  probabilidades = nuevasProbabilidades;
  elementos.datosPegados.setCustomValidity("");
  elementos.dialogoPegar.close();
  elementos.datosPegados.value = "";
  renderizarTabla();
  resolver();
}

function reportarImportacion(mensaje) {
  elementos.datosPegados.setCustomValidity(mensaje);
  elementos.datosPegados.reportValidity();
}

function cargarEjemplo() {
  datosIniciales();
  elementos.problema.value = "Expansión de capacidad";
  elementos.tipoMatriz.value = "beneficios";
  elementos.alfa.value = ".60";
  elementos.valorAlfa.value = ".60";
  renderizarTabla();
  resolver();
}

function limpiar() {
  datosIniciales();
  elementos.formulario.reset();
  elementos.problema.value = "";
  elementos.salida.hidden = true;
  elementos.mensaje.textContent = "";
  localStorage.removeItem(CLAVE_GUARDADO);
  renderizarTabla();
  actualizarFlujo("datos");
}

function guardar() {
  localStorage.setItem(CLAVE_GUARDADO, JSON.stringify({ problema: elementos.problema.value, tipoMatriz: elementos.tipoMatriz.value, alfa: elementos.alfa.value, estados, alternativas, probabilidades }));
}

function restaurar() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE_GUARDADO));
    if (!datos || !Array.isArray(datos.estados) || !Array.isArray(datos.alternativas)) return false;
    estados = datos.estados;
    alternativas = datos.alternativas;
    probabilidades = datos.probabilidades;
    elementos.problema.value = datos.problema || "";
    elementos.tipoMatriz.value = datos.tipoMatriz || "beneficios";
    elementos.alfa.value = datos.alfa || ".60";
    elementos.valorAlfa.value = Number(elementos.alfa.value).toFixed(2);
    return true;
  } catch { return false; }
}

function programarResolucion() {
  clearTimeout(temporizador);
  guardar();
  temporizador = setTimeout(() => resolver(false), 180);
}

function activarPestana(idPanel) {
  document.querySelectorAll(".pestana").forEach(boton => { const activa = boton.dataset.panel === idPanel; boton.classList.toggle("activo", activa); boton.setAttribute("aria-selected", activa); boton.tabIndex = activa ? 0 : -1; });
  document.querySelectorAll(".panel-pestana").forEach(panel => { const activa = panel.id === idPanel; panel.hidden = !activa; panel.classList.toggle("activo", activa); });
  actualizarFlujo("analisis");
}

function actualizarFlujo(paso) {
  document.querySelectorAll(".flujo li").forEach(elemento => elemento.classList.toggle("activo", elemento.dataset.paso === paso));
}

function abrirGuia() { elementos.dialogoGuia.showModal(); renderizarLatex([elementos.dialogoGuia]); }
function cerrarDialogo(evento) { evento.target.closest("dialog")?.close(); }
function renderizarLatex(contenedores) { if (!window.MathJax?.typesetPromise) return; window.MathJax.typesetClear?.(contenedores); window.MathJax.typesetPromise(contenedores).catch(() => {}); }

elementos.formulario.addEventListener("submit", evento => { evento.preventDefault(); if (resolver()) elementos.salida.scrollIntoView({ behavior: "smooth", block: "start" }); });
elementos.formulario.addEventListener("input", () => { elementos.valorAlfa.value = Number(elementos.alfa.value).toFixed(2); programarResolucion(); });
elementos.cabeceraTabla.addEventListener("input", actualizarMatriz);
elementos.cuerpoTabla.addEventListener("input", actualizarMatriz);
elementos.pieTabla.addEventListener("input", actualizarMatriz);
elementos.cuerpoTabla.addEventListener("click", evento => { const boton = evento.target.closest(".eliminar-alternativa"); if (!boton || alternativas.length <= 2) return; alternativas.splice(Number(boton.closest("tr").dataset.alternativa), 1); renderizarTabla(); programarResolucion(); });
elementos.pieTabla.addEventListener("click", evento => { if (!evento.target.closest(".eliminar-estado") || estados.length <= 2) return; estados.pop(); probabilidades.pop(); alternativas.forEach(alternativa => alternativa.valores.pop()); renderizarTabla(); programarResolucion(); });
document.getElementById("agregar-alternativa").addEventListener("click", agregarAlternativa);
document.getElementById("agregar-estado").addEventListener("click", agregarEstado);
document.getElementById("cargar-ejemplo").addEventListener("click", cargarEjemplo);
document.getElementById("limpiar").addEventListener("click", limpiar);
document.getElementById("pegar-matriz").addEventListener("click", () => elementos.dialogoPegar.showModal());
document.getElementById("importar-matriz").addEventListener("click", importarMatriz);
document.getElementById("abrir-guia").addEventListener("click", abrirGuia);
document.getElementById("teoria-flotante").addEventListener("click", abrirGuia);
document.getElementById("imprimir").addEventListener("click", () => window.print());
document.querySelectorAll(".cerrar-dialogo").forEach(boton => boton.addEventListener("click", cerrarDialogo));
document.querySelectorAll("dialog").forEach(dialogo => dialogo.addEventListener("click", evento => { if (evento.target === dialogo) dialogo.close(); }));
document.querySelectorAll(".pestana").forEach(boton => boton.addEventListener("click", () => activarPestana(boton.dataset.panel)));

if (!restaurar()) datosIniciales();
renderizarTabla();
resolver(false);
