"use strict";

const CLAVE_GUARDADO = "inventarios-modelos-v2";
const CAMPOS_NUMERICOS = ["demanda", "tasa-produccion", "costo-faltante", "costo-pedido", "costo-unitario", "dias-laborables", "tiempo-entrega", "capacidad-maxima", "mantenimiento"];

const elementos = {
  formulario: document.getElementById("formulario-inventario"),
  modelo: document.getElementById("modelo"),
  producto: document.getElementById("producto"),
  demanda: document.getElementById("demanda"),
  tasaProduccion: document.getElementById("tasa-produccion"),
  campoProduccion: document.getElementById("campo-produccion"),
  costoFaltante: document.getElementById("costo-faltante"),
  campoFaltante: document.getElementById("campo-faltante"),
  costoPedido: document.getElementById("costo-pedido"),
  costoUnitario: document.getElementById("costo-unitario"),
  diasLaborables: document.getElementById("dias-laborables"),
  tiempoEntrega: document.getElementById("tiempo-entrega"),
  capacidadMaxima: document.getElementById("capacidad-maxima"),
  mantenimiento: document.getElementById("mantenimiento"),
  moneda: document.getElementById("moneda"),
  mensaje: document.getElementById("mensaje"),
  salida: document.getElementById("salida"),
  estadoVacio: document.getElementById("estado-vacio"),
  tituloResultado: document.getElementById("titulo-resultado"),
  loteOptimo: document.getElementById("lote-optimo"),
  puntoReorden: document.getElementById("punto-reorden"),
  numeroPedidos: document.getElementById("numero-pedidos"),
  pedidosPracticos: document.getElementById("pedidos-practicos"),
  tiempoCiclo: document.getElementById("tiempo-ciclo"),
  rotuloLote: document.getElementById("rotulo-lote"),
  detalleLote: document.getElementById("detalle-lote"),
  rotuloReorden: document.getElementById("rotulo-reorden"),
  detalleReorden: document.getElementById("detalle-reorden"),
  rotuloFrecuencia: document.getElementById("rotulo-frecuencia"),
  rotuloCiclo: document.getElementById("rotulo-ciclo"),
  rotuloCostoRelevante: document.getElementById("rotulo-costo-relevante"),
  tituloGraficoPolitica: document.getElementById("titulo-grafico-politica"),
  ayudaComparacion: document.getElementById("ayuda-comparacion"),
  recomendacion: document.getElementById("recomendacion"),
  evaluacionCapacidad: document.getElementById("evaluacion-capacidad"),
  graficoInventario: document.getElementById("grafico-inventario"),
  graficoCostos: document.getElementById("grafico-costos"),
  lecturaGrafico: document.getElementById("lectura-grafico"),
  leyendaFaltante: document.getElementById("leyenda-faltante"),
  costoOrdenar: document.getElementById("costo-ordenar"),
  costoMantener: document.getElementById("costo-mantener"),
  costoFaltantes: document.getElementById("costo-faltantes"),
  filaCostoFaltantes: document.getElementById("fila-costo-faltantes"),
  costoRelevante: document.getElementById("costo-relevante"),
  costoAdquisicion: document.getElementById("costo-adquisicion"),
  costoTotal: document.getElementById("costo-total"),
  ciclosGrafico: document.getElementById("ciclos-grafico"),
  controlLote: document.getElementById("control-lote"),
  loteAlternativo: document.getElementById("lote-alternativo"),
  costoLoteAlternativo: document.getElementById("costo-lote-alternativo"),
  diferenciaLote: document.getElementById("diferencia-lote"),
  impactoLote: document.getElementById("impacto-lote"),
  desarrollo: document.getElementById("desarrollo"),
  escenarios: document.getElementById("escenarios"),
  barrasEscenarios: document.getElementById("barras-escenarios"),
  dialogoGuia: document.getElementById("dialogo-guia"),
  dialogoPegar: document.getElementById("dialogo-pegar"),
  ordenColumnas: document.getElementById("orden-columnas"),
  datosPegados: document.getElementById("datos-pegados")
};

let ultimoResultado = null;
let temporizadorCalculo = null;
let listaEscenarios = [];
let loteExplorado = null;

function numero(valor) {
  const convertido = Number(String(valor ?? "").replace(",", "."));
  return Number.isFinite(convertido) ? convertido : NaN;
}

function limitarDecimales(valor, maximo = 2) {
  if (!Number.isFinite(valor)) return "—";
  return new Intl.NumberFormat("es-PE", { maximumFractionDigits: maximo }).format(valor);
}

function formatearMoneda(valor, codigo = elementos.moneda.value) {
  if (!Number.isFinite(valor)) return "—";
  const importe = new Intl.NumberFormat("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor);
  return `${simboloMoneda(codigo)} ${importe}`;
}

function simboloMoneda(codigo) {
  return { PEN: "S/", USD: "$", EUR: "€" }[codigo] || codigo;
}

function escaparHtml(texto) {
  return String(texto ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function obtenerModoMantenimiento() {
  return elementos.formulario.elements.modoMantenimiento.value;
}

function leerDatos() {
  const modoMantenimiento = obtenerModoMantenimiento();
  const costoUnitario = numero(elementos.costoUnitario.value);
  const valorMantenimiento = numero(elementos.mantenimiento.value);
  const mantenimientoUnitario = modoMantenimiento === "porcentaje"
    ? costoUnitario * valorMantenimiento / 100
    : valorMantenimiento;
  const capacidadMaxima = elementos.capacidadMaxima.value.trim()
    ? numero(elementos.capacidadMaxima.value)
    : null;

  return {
    modelo: elementos.modelo.value,
    producto: elementos.producto.value.trim() || "Producto analizado",
    demanda: numero(elementos.demanda.value),
    tasaProduccion: elementos.tasaProduccion.value.trim() ? numero(elementos.tasaProduccion.value) : null,
    costoFaltante: elementos.costoFaltante.value.trim() ? numero(elementos.costoFaltante.value) : null,
    costoPedido: numero(elementos.costoPedido.value),
    costoUnitario,
    diasLaborables: numero(elementos.diasLaborables.value),
    tiempoEntrega: numero(elementos.tiempoEntrega.value),
    capacidadMaxima,
    valorMantenimiento,
    mantenimientoUnitario,
    modoMantenimiento,
    moneda: elementos.moneda.value
  };
}

function validarDatos(datos, mostrarMensaje = true) {
  const errores = [];
  if (!(datos.demanda > 0)) errores.push("La demanda anual debe ser mayor que cero.");
  if (datos.modelo === "epq" && !(datos.tasaProduccion > datos.demanda)) errores.push("En EPQ, la producción anual debe ser mayor que la demanda anual.");
  if (datos.modelo === "faltantes" && !(datos.costoFaltante > 0)) errores.push("El costo anual por faltante debe ser mayor que cero.");
  if (!(datos.costoPedido > 0)) errores.push("El costo por pedido debe ser mayor que cero.");
  if (!(datos.costoUnitario >= 0)) errores.push("Ingrese un costo unitario válido.");
  if (!(datos.diasLaborables > 0)) errores.push("Los días laborables deben ser mayores que cero.");
  if (!(datos.tiempoEntrega >= 0)) errores.push("El tiempo de entrega no puede ser negativo.");
  if (datos.capacidadMaxima !== null && !(datos.capacidadMaxima > 0)) errores.push("La capacidad máxima debe ser mayor que cero o dejarse vacía.");
  if (!(datos.valorMantenimiento > 0)) errores.push("El mantenimiento debe ser mayor que cero.");
  if (datos.modoMantenimiento === "porcentaje" && !(datos.costoUnitario > 0)) errores.push("Para usar un porcentaje, el costo unitario debe ser mayor que cero.");
  if (!(datos.mantenimientoUnitario > 0)) errores.push("El costo anual de mantenimiento resultante debe ser mayor que cero.");
  if (mostrarMensaje) elementos.mensaje.textContent = errores[0] || "";
  return errores.length === 0;
}

function calcularEoq(datos) {
  const loteOptimo = Math.sqrt((2 * datos.demanda * datos.costoPedido) / datos.mantenimientoUnitario);
  const numeroPedidos = datos.demanda / loteOptimo;
  const tiempoCiclo = datos.diasLaborables / numeroPedidos;
  const demandaDiaria = datos.demanda / datos.diasLaborables;
  const puntoReorden = demandaDiaria * datos.tiempoEntrega;
  const inventarioPromedio = loteOptimo / 2;
  const costoOrdenar = numeroPedidos * datos.costoPedido;
  const costoMantener = inventarioPromedio * datos.mantenimientoUnitario;
  const costoRelevante = costoOrdenar + costoMantener;
  const costoAdquisicion = datos.demanda * datos.costoUnitario;
  const costoTotal = costoRelevante + costoAdquisicion;

  return {
    ...datos,
    modelo: "eoq",
    factorProduccion: 1,
    loteOptimo,
    numeroPedidos,
    tiempoCiclo,
    demandaDiaria,
    puntoReorden,
    inventarioMaximo: loteOptimo,
    inventarioPromedio,
    faltanteMaximo: 0,
    tiempoSinInventario: 0,
    tiempoProduccion: 0,
    costoOrdenar,
    costoMantener,
    costoFaltantes: 0,
    costoRelevante,
    costoAdquisicion,
    costoTotal,
    capacidadSuficiente: datos.capacidadMaxima === null ? null : loteOptimo <= datos.capacidadMaxima
  };
}

function calcularEpq(datos) {
  const factorProduccion = 1 - datos.demanda / datos.tasaProduccion;
  const loteOptimo = Math.sqrt((2 * datos.demanda * datos.costoPedido) / (datos.mantenimientoUnitario * factorProduccion));
  const numeroPedidos = datos.demanda / loteOptimo;
  const tiempoCiclo = datos.diasLaborables / numeroPedidos;
  const tiempoProduccion = loteOptimo / datos.tasaProduccion * datos.diasLaborables;
  const demandaDiaria = datos.demanda / datos.diasLaborables;
  const puntoReorden = demandaDiaria * datos.tiempoEntrega;
  const inventarioMaximo = loteOptimo * factorProduccion;
  const inventarioPromedio = inventarioMaximo / 2;
  const costoOrdenar = numeroPedidos * datos.costoPedido;
  const costoMantener = inventarioPromedio * datos.mantenimientoUnitario;
  const costoRelevante = costoOrdenar + costoMantener;
  const costoAdquisicion = datos.demanda * datos.costoUnitario;
  const costoTotal = costoRelevante + costoAdquisicion;

  return {
    ...datos,
    modelo: "epq",
    factorProduccion,
    loteOptimo,
    numeroPedidos,
    tiempoCiclo,
    tiempoProduccion,
    demandaDiaria,
    puntoReorden,
    inventarioMaximo,
    inventarioPromedio,
    faltanteMaximo: 0,
    tiempoSinInventario: 0,
    costoOrdenar,
    costoMantener,
    costoFaltantes: 0,
    costoRelevante,
    costoAdquisicion,
    costoTotal,
    capacidadSuficiente: datos.capacidadMaxima === null ? null : inventarioMaximo <= datos.capacidadMaxima
  };
}

function calcularEoqFaltantes(datos) {
  const factorCosto = datos.costoFaltante / (datos.mantenimientoUnitario + datos.costoFaltante);
  const loteOptimo = Math.sqrt((2 * datos.demanda * datos.costoPedido) / (datos.mantenimientoUnitario * factorCosto));
  const inventarioMaximo = loteOptimo * factorCosto;
  const faltanteMaximo = loteOptimo - inventarioMaximo;
  const numeroPedidos = datos.demanda / loteOptimo;
  const tiempoCiclo = datos.diasLaborables / numeroPedidos;
  const demandaDiaria = datos.demanda / datos.diasLaborables;
  const puntoReorden = demandaDiaria * datos.tiempoEntrega - faltanteMaximo;
  const inventarioPromedio = inventarioMaximo ** 2 / (2 * loteOptimo);
  const faltantePromedio = faltanteMaximo ** 2 / (2 * loteOptimo);
  const tiempoSinInventario = faltanteMaximo / demandaDiaria;
  const costoOrdenar = numeroPedidos * datos.costoPedido;
  const costoMantener = inventarioPromedio * datos.mantenimientoUnitario;
  const costoFaltantes = faltantePromedio * datos.costoFaltante;
  const costoRelevante = costoOrdenar + costoMantener + costoFaltantes;
  const costoAdquisicion = datos.demanda * datos.costoUnitario;
  const costoTotal = costoRelevante + costoAdquisicion;

  return {
    ...datos,
    modelo: "faltantes",
    factorProduccion: 1,
    factorCosto,
    loteOptimo,
    numeroPedidos,
    tiempoCiclo,
    demandaDiaria,
    puntoReorden,
    inventarioMaximo,
    inventarioPromedio,
    faltanteMaximo,
    faltantePromedio,
    tiempoSinInventario,
    tiempoProduccion: 0,
    costoOrdenar,
    costoMantener,
    costoFaltantes,
    costoRelevante,
    costoAdquisicion,
    costoTotal,
    capacidadSuficiente: datos.capacidadMaxima === null ? null : inventarioMaximo <= datos.capacidadMaxima
  };
}

function calcularModelo(datos) {
  if (datos.modelo === "epq") return calcularEpq(datos);
  if (datos.modelo === "faltantes") return calcularEoqFaltantes(datos);
  return calcularEoq(datos);
}

function guardarFormulario() {
  const datos = {};
  new FormData(elementos.formulario).forEach((valor, clave) => { datos[clave] = valor; });
  datos.escenarios = listaEscenarios;
  localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(datos));
}

function restaurarFormulario() {
  const guardado = localStorage.getItem(CLAVE_GUARDADO);
  if (!guardado) return false;
  try {
    const datos = JSON.parse(guardado);
    Object.entries(datos).forEach(([clave, valor]) => {
      if (clave === "escenarios") return;
      const control = elementos.formulario.elements[clave];
      if (!control) return;
      if (control instanceof RadioNodeList) control.value = valor;
      else control.value = valor;
    });
    if (Array.isArray(datos.escenarios)) listaEscenarios = datos.escenarios;
    actualizarModelo();
    actualizarModoMantenimiento();
    actualizarSimbolosMoneda();
    return true;
  } catch {
    localStorage.removeItem(CLAVE_GUARDADO);
    return false;
  }
}

function actualizarModelo() {
  const esEpq = elementos.modelo.value === "epq";
  const esFaltantes = elementos.modelo.value === "faltantes";
  elementos.campoProduccion.hidden = !esEpq;
  elementos.tasaProduccion.disabled = !esEpq;
  elementos.campoFaltante.hidden = !esFaltantes;
  elementos.costoFaltante.disabled = !esFaltantes;
  document.querySelectorAll(".columna-produccion").forEach(elemento => { elemento.hidden = !esEpq; });
  document.querySelectorAll(".columna-faltantes").forEach(elemento => { elemento.hidden = !esFaltantes; });
  if (esEpq) {
    elementos.ayudaComparacion.textContent = "Pegue filas desde Excel o edite las celdas. En EPQ, P debe ser mayor que D.";
    elementos.ordenColumnas.innerHTML = "Orden de columnas: <strong>Escenario, Demanda, Costo de preparación, Mantenimiento, Producción</strong>.";
    elementos.datosPegados.placeholder = "Base\t10000\t100\t2\t40000\nMayor producción\t10000\t100\t2\t50000";
  } else if (esFaltantes) {
    elementos.ayudaComparacion.textContent = "Pegue filas desde Excel o edite las celdas. Cₛ es el costo anual de mantener una unidad pendiente.";
    elementos.ordenColumnas.innerHTML = "Orden de columnas: <strong>Escenario, Demanda, Costo por pedido, Mantenimiento, Costo por faltante</strong>.";
    elementos.datosPegados.placeholder = "Base\t2000\t25\t10\t30\nFaltante costoso\t2000\t25\t10\t45";
  } else {
    elementos.ayudaComparacion.textContent = "Pegue filas desde Excel o edite las celdas. Cₕ se expresa por unidad al año.";
    elementos.ordenColumnas.innerHTML = "Orden de columnas: <strong>Escenario, Demanda, Costo por pedido, Mantenimiento por unidad</strong>.";
    elementos.datosPegados.placeholder = "Base\t1200\t20\t0.30\nAlta demanda\t1500\t20\t0.30";
  }
}

function actualizarModoMantenimiento() {
  const esPorcentaje = obtenerModoMantenimiento() === "porcentaje";
  document.getElementById("rotulo-mantenimiento").textContent = esPorcentaje ? "Tasa anual de mantenimiento" : "Costo por unidad al año";
  document.getElementById("simbolo-mantenimiento").innerHTML = esPorcentaje ? "I" : "C<sub>h</sub>";
  document.getElementById("unidad-mantenimiento").textContent = esPorcentaje ? "%" : simboloMoneda(elementos.moneda.value);
  document.getElementById("ayuda-mantenimiento").textContent = esPorcentaje
    ? "Se calcula Cₕ = I × C. Ingrese la tasa como porcentaje."
    : "Ingrese el costo anual de conservar una unidad en inventario.";
  elementos.mantenimiento.placeholder = esPorcentaje ? "15" : "0.30";
}

function actualizarSimbolosMoneda() {
  const simbolo = simboloMoneda(elementos.moneda.value);
  document.querySelectorAll(".simbolo-moneda").forEach(elemento => { elemento.textContent = simbolo; });
  if (obtenerModoMantenimiento() === "unidad") document.getElementById("unidad-mantenimiento").textContent = simbolo;
}

function mostrarResultado(resultado) {
  ultimoResultado = resultado;
  elementos.estadoVacio.hidden = true;
  elementos.salida.hidden = false;
  elementos.tituloResultado.textContent = resultado.producto;
  const esEpq = resultado.modelo === "epq";
  const esFaltantes = resultado.modelo === "faltantes";
  elementos.rotuloLote.innerHTML = esEpq ? "Lote de producción <i>Q*</i>" : esFaltantes ? "Lote con faltantes <i>Q*</i>" : "Cantidad económica <i>Q*</i>";
  elementos.detalleLote.textContent = esEpq ? "unidades por lote producido" : "unidades por pedido";
  elementos.rotuloReorden.innerHTML = esFaltantes ? "Faltante máximo <i>B*</i>" : esEpq ? "Inicio de preparación <i>r</i>" : "Punto de reorden <i>r</i>";
  elementos.detalleReorden.textContent = esFaltantes ? "unidades pendientes al final del ciclo" : "unidades de posición de inventario";
  elementos.rotuloFrecuencia.innerHTML = esEpq ? "Ciclos por año <i>N</i>" : "Pedidos por año <i>N</i>";
  elementos.rotuloCiclo.innerHTML = esEpq ? "Tiempo entre ciclos <i>T</i>" : "Tiempo entre pedidos <i>T</i>";
  elementos.rotuloCostoRelevante.innerHTML = esEpq ? "Costo anual EPQ <i>CT</i>" : esFaltantes ? "Costo anual con faltantes <i>CT</i>" : "Costo anual EOQ <i>CT</i>";
  elementos.tituloGraficoPolitica.textContent = esEpq ? "Producción e inventario por ciclo" : esFaltantes ? "Existencias y pedidos pendientes" : "Cuándo realizar cada pedido";
  elementos.loteOptimo.textContent = limitarDecimales(resultado.loteOptimo);
  elementos.puntoReorden.textContent = limitarDecimales(esFaltantes ? resultado.faltanteMaximo : resultado.puntoReorden);
  elementos.numeroPedidos.textContent = limitarDecimales(resultado.numeroPedidos);
  elementos.pedidosPracticos.textContent = esEpq ? "corridas de producción estimadas" : "frecuencia anual estimada";
  elementos.tiempoCiclo.textContent = limitarDecimales(resultado.tiempoCiclo);
  elementos.costoOrdenar.textContent = formatearMoneda(resultado.costoOrdenar, resultado.moneda);
  elementos.costoMantener.textContent = formatearMoneda(resultado.costoMantener, resultado.moneda);
  elementos.costoFaltantes.textContent = formatearMoneda(resultado.costoFaltantes, resultado.moneda);
  elementos.filaCostoFaltantes.hidden = !esFaltantes;
  elementos.leyendaFaltante.hidden = !esFaltantes;
  elementos.costoRelevante.textContent = formatearMoneda(resultado.costoRelevante, resultado.moneda);
  elementos.costoAdquisicion.textContent = formatearMoneda(resultado.costoAdquisicion, resultado.moneda);
  elementos.costoTotal.textContent = formatearMoneda(resultado.costoTotal, resultado.moneda);

  const lotePractico = Math.round(resultado.loteOptimo);
  const reordenPractico = Math.ceil(resultado.puntoReorden);
  if (esEpq) {
    elementos.recomendacion.innerHTML = `<p>Programe lotes de aproximadamente <strong>${limitarDecimales(lotePractico, 0)} unidades</strong>. Inicie la preparación cuando la posición del inventario llegue a <strong>${limitarDecimales(reordenPractico, 0)} unidades</strong>; el inventario físico máximo será <strong>${limitarDecimales(resultado.inventarioMaximo)} unidades</strong>.</p>`;
  } else if (esFaltantes) {
    const indicacionReorden = resultado.puntoReorden >= 0
      ? `cuando la posición del inventario llegue a <strong>${limitarDecimales(reordenPractico, 0)} unidades</strong>`
      : `cuando existan aproximadamente <strong>${limitarDecimales(Math.abs(reordenPractico), 0)} unidades pendientes</strong>`;
    elementos.recomendacion.innerHTML = `<p>Solicite aproximadamente <strong>${limitarDecimales(lotePractico, 0)} unidades</strong> ${indicacionReorden}. La política admite hasta <strong>${limitarDecimales(resultado.faltanteMaximo)} unidades pendientes</strong> y conserva como máximo <strong>${limitarDecimales(resultado.inventarioMaximo)} unidades</strong>.</p>`;
  } else {
    elementos.recomendacion.innerHTML = `<p>Solicite aproximadamente <strong>${limitarDecimales(lotePractico, 0)} unidades</strong> cada vez que la posición del inventario llegue a <strong>${limitarDecimales(reordenPractico, 0)} unidades</strong>. En condiciones constantes, esto ocurre cada <strong>${limitarDecimales(resultado.tiempoCiclo)} días laborables</strong>.</p>`;
  }

  if (resultado.capacidadSuficiente === null) {
    elementos.evaluacionCapacidad.hidden = true;
    elementos.evaluacionCapacidad.classList.remove("no-suficiente");
  } else {
    elementos.evaluacionCapacidad.hidden = false;
    elementos.evaluacionCapacidad.classList.toggle("no-suficiente", !resultado.capacidadSuficiente);
    elementos.evaluacionCapacidad.innerHTML = resultado.capacidadSuficiente
      ? `<strong>Capacidad suficiente.</strong> ${esEpq || esFaltantes ? "I<sub>máx</sub>" : "Q*"} = ${limitarDecimales(resultado.inventarioMaximo)} es menor o igual que C<sub>máx</sub> = ${limitarDecimales(resultado.capacidadMaxima)} unidades.`
      : `<strong>Capacidad insuficiente.</strong> ${esEpq || esFaltantes ? "I<sub>máx</sub>" : "Q*"} = ${limitarDecimales(resultado.inventarioMaximo)} supera C<sub>máx</sub> = ${limitarDecimales(resultado.capacidadMaxima)} unidades.`;
  }

  configurarSimuladorLote(resultado);
  dibujarGraficoInventario(resultado);
  dibujarGraficoCostos(resultado);
  mostrarLecturaGrafico(resultado);
  mostrarDesarrollo(resultado);
  if (!listaEscenarios.length) crearEscenariosIniciales(resultado);
  else renderizarEscenarios();
  const panelActivo = document.querySelector(".pestana.activo")?.dataset.panel || "panel-politica";
  actualizarFlujo(panelActivo === "panel-politica" ? "politica" : "analisis");
  guardarFormulario();
}

function resolverFormulario(mostrarMensaje = true) {
  const datos = leerDatos();
  if (!validarDatos(datos, mostrarMensaje)) return false;
  elementos.mensaje.textContent = "";
  mostrarResultado(calcularModelo(datos));
  return true;
}

function programarCalculo() {
  clearTimeout(temporizadorCalculo);
  guardarFormulario();
  temporizadorCalculo = setTimeout(() => resolverFormulario(false), 220);
}

function cargarEjemplo() {
  const esEpq = elementos.modelo.value === "epq";
  const esFaltantes = elementos.modelo.value === "faltantes";
  elementos.producto.value = esEpq ? "Producción por lotes" : esFaltantes ? "Pedidos con espera planificada" : "R&B Beverage Company";
  elementos.demanda.value = esEpq ? "10000" : esFaltantes ? "2000" : "3600";
  elementos.tasaProduccion.value = esEpq ? "40000" : "";
  elementos.costoFaltante.value = esFaltantes ? "30" : "";
  elementos.costoPedido.value = esEpq ? "100" : esFaltantes ? "25" : "20";
  elementos.costoUnitario.value = esEpq ? "10" : esFaltantes ? "50" : "3";
  elementos.diasLaborables.value = "250";
  elementos.tiempoEntrega.value = esEpq ? "2" : "5";
  elementos.capacidadMaxima.value = "";
  elementos.mantenimiento.value = esEpq ? "2" : esFaltantes ? "10" : "25";
  elementos.moneda.value = "USD";
  elementos.formulario.elements.modoMantenimiento.value = esEpq || esFaltantes ? "unidad" : "porcentaje";
  listaEscenarios = [];
  actualizarModoMantenimiento();
  actualizarSimbolosMoneda();
  resolverFormulario();
}

function limpiarFormulario() {
  elementos.formulario.reset();
  CAMPOS_NUMERICOS.forEach(id => { document.getElementById(id).value = ""; });
  elementos.producto.value = "";
  elementos.moneda.value = "PEN";
  listaEscenarios = [];
  ultimoResultado = null;
  localStorage.removeItem(CLAVE_GUARDADO);
  elementos.mensaje.textContent = "";
  elementos.salida.hidden = true;
  elementos.estadoVacio.hidden = false;
  actualizarFlujo("datos");
  actualizarModelo();
  actualizarModoMantenimiento();
  actualizarSimbolosMoneda();
}

function lineaSvg(puntos) {
  return puntos.map((punto, indice) => `${indice ? "L" : "M"}${punto[0].toFixed(1)},${punto[1].toFixed(1)}`).join(" ");
}

function dibujarGraficoInventario(resultado) {
  const ancho = 980;
  const alto = 360;
  const margen = { izquierda: 72, derecha: 30, superior: 28, inferior: 55 };
  const anchoUtil = ancho - margen.izquierda - margen.derecha;
  const altoUtil = alto - margen.superior - margen.inferior;
  const ciclos = Number(elementos.ciclosGrafico.value) || 3;
  const esEpq = resultado.modelo === "epq";
  const esFaltantes = resultado.modelo === "faltantes";
  const minimoDatos = Math.min(0, esFaltantes ? -resultado.faltanteMaximo : 0, resultado.puntoReorden);
  const maximoDatos = Math.max(resultado.inventarioMaximo, resultado.puntoReorden, 0);
  const amplitudDatos = Math.max(1, maximoDatos - minimoDatos);
  const minimoY = minimoDatos - (esFaltantes ? amplitudDatos * .08 : 0);
  const maximoY = maximoDatos + amplitudDatos * .12;
  const escalaX = tiempo => margen.izquierda + (tiempo / (resultado.tiempoCiclo * ciclos)) * anchoUtil;
  const escalaY = valor => margen.superior + (maximoY - valor) / (maximoY - minimoY) * altoUtil;
  const puntos = [];
  for (let ciclo = 0; ciclo < ciclos; ciclo += 1) {
    const inicio = ciclo * resultado.tiempoCiclo;
    const fin = (ciclo + 1) * resultado.tiempoCiclo;
    if (esEpq) {
      const finProduccion = inicio + resultado.tiempoProduccion;
      puntos.push(
        [escalaX(inicio), escalaY(0)],
        [escalaX(finProduccion), escalaY(resultado.inventarioMaximo)],
        [escalaX(fin), escalaY(0)]
      );
    } else if (esFaltantes) {
      puntos.push(
        [escalaX(inicio), escalaY(resultado.inventarioMaximo)],
        [escalaX(fin), escalaY(-resultado.faltanteMaximo)]
      );
      if (ciclo < ciclos - 1) puntos.push([escalaX(fin), escalaY(resultado.inventarioMaximo)]);
    } else {
      puntos.push([escalaX(inicio), escalaY(resultado.loteOptimo)], [escalaX(fin), escalaY(0)]);
      if (ciclo < ciclos - 1) puntos.push([escalaX(fin), escalaY(resultado.loteOptimo)]);
    }
  }

  const lineasHorizontales = [0, .25, .5, .75, 1].map(proporcion => {
    const valor = minimoY + (maximoY - minimoY) * proporcion;
    const y = escalaY(valor);
    return `<line x1="${margen.izquierda}" y1="${y}" x2="${ancho - margen.derecha}" y2="${y}" stroke="#dfe7e3"/><text x="${margen.izquierda - 11}" y="${y + 4}" text-anchor="end" fill="#71817b" font-size="11">${limitarDecimales(valor, 0)}</text>`;
  }).join("");

  const etiquetasX = Array.from({ length: ciclos + 1 }, (_, indice) => {
    const tiempo = indice * resultado.tiempoCiclo;
    const x = escalaX(tiempo);
    return `<line x1="${x}" y1="${margen.superior}" x2="${x}" y2="${alto - margen.inferior}" stroke="#e8ecea"/><text x="${x}" y="${alto - 25}" text-anchor="middle" fill="#71817b" font-size="11">${limitarDecimales(tiempo)}</text>`;
  }).join("");

  const yReorden = escalaY(resultado.puntoReorden);
  const yCero = escalaY(0);
  const marcadores = [];
  if (resultado.tiempoEntrega <= resultado.tiempoCiclo) {
    for (let ciclo = 1; ciclo <= ciclos; ciclo += 1) {
      const momento = ciclo * resultado.tiempoCiclo - resultado.tiempoEntrega;
      const x = escalaX(momento);
      marcadores.push(`<circle cx="${x}" cy="${yReorden}" r="5" fill="#bd6c3c" stroke="#fff" stroke-width="3"><title>Emitir pedido en el día ${limitarDecimales(momento)}</title></circle>`, `<line x1="${x}" y1="${yReorden}" x2="${escalaX(ciclo * resultado.tiempoCiclo)}" y2="${alto - margen.inferior + 18}" stroke="#bd6c3c" stroke-width="1.5" stroke-dasharray="5 5" opacity=".7"/>`);
    }
  }

  elementos.graficoInventario.innerHTML = `
    <svg viewBox="0 0 ${ancho} ${alto}" role="img" aria-labelledby="titulo-grafico-inventario">
      <title id="titulo-grafico-inventario">${esEpq ? "Producción e inventario" : "Inventario"} de ${escaparHtml(resultado.producto)} durante ${ciclos} ciclos</title>
      <defs><linearGradient id="area-inventario" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#4ca38b" stop-opacity=".28"/><stop offset="1" stop-color="#4ca38b" stop-opacity=".03"/></linearGradient><linearGradient id="trazo-inventario" gradientUnits="userSpaceOnUse" x1="0" y1="${margen.superior}" x2="0" y2="${alto - margen.inferior}"><stop offset="0" stop-color="#25816b"/><stop offset="${Math.max(0, Math.min(1, (yCero - margen.superior) / altoUtil))}" stop-color="#25816b"/><stop offset="${Math.max(0, Math.min(1, (yCero - margen.superior) / altoUtil))}" stop-color="#bd6c3c"/><stop offset="1" stop-color="#bd6c3c"/></linearGradient></defs>
      ${lineasHorizontales}${etiquetasX}
      ${esFaltantes ? `<rect x="${margen.izquierda}" y="${yCero}" width="${anchoUtil}" height="${alto - margen.inferior - yCero}" fill="#fff0ec" opacity=".7"/>` : ""}
      <line x1="${margen.izquierda}" y1="${yCero}" x2="${ancho - margen.derecha}" y2="${yCero}" stroke="#61756e" stroke-width="1.5"/>
      <line x1="${margen.izquierda}" y1="${margen.superior}" x2="${margen.izquierda}" y2="${alto - margen.inferior}" stroke="#61756e" stroke-width="1.5"/>
      ${esFaltantes ? "" : `<path d="${lineaSvg([[margen.izquierda, yCero], ...puntos, [ancho - margen.derecha, yCero]])} Z" fill="url(#area-inventario)"/>`}
      <path d="${lineaSvg(puntos)}" fill="none" stroke="${esFaltantes ? "url(#trazo-inventario)" : "#25816b"}" stroke-width="4" stroke-linejoin="round"/>
      <line x1="${margen.izquierda}" y1="${yReorden}" x2="${ancho - margen.derecha}" y2="${yReorden}" stroke="#bd6c3c" stroke-width="2" stroke-dasharray="8 6"/>
      ${marcadores.join("")}
      <rect x="${ancho - 177}" y="${Math.min(alto - margen.inferior - 24, Math.max(8, yReorden - 24))}" width="147" height="24" rx="7" fill="#fff4ec" stroke="#e6b8a0"/>
      <text x="${ancho - 104}" y="${Math.min(alto - margen.inferior - 8, Math.max(24, yReorden - 8))}" text-anchor="middle" fill="#9b5130" font-size="11" font-weight="700">r = ${limitarDecimales(resultado.puntoReorden)}</text>
      <text x="20" y="${margen.superior + altoUtil / 2}" transform="rotate(-90 20 ${margen.superior + altoUtil / 2})" text-anchor="middle" fill="#536760" font-size="12" font-weight="700">${esFaltantes ? "Inventario neto" : "Inventario físico"}</text>
      <text x="${margen.izquierda + anchoUtil / 2}" y="${alto - 5}" text-anchor="middle" fill="#536760" font-size="12" font-weight="700">Días laborables</text>
    </svg>`;
}

function dibujarGraficoCostos(resultado) {
  const ancho = 860;
  const alto = 344;
  const margen = { izquierda: 75, derecha: 26, superior: 30, inferior: 54 };
  const anchoUtil = ancho - margen.izquierda - margen.derecha;
  const altoUtil = alto - margen.superior - margen.inferior;
  const minimoQ = resultado.loteOptimo * .25;
  const maximoQ = resultado.loteOptimo * 2.25;
  const esFaltantes = resultado.modelo === "faltantes";
  const muestras = Array.from({ length: 55 }, (_, indice) => {
    const q = minimoQ + (maximoQ - minimoQ) * indice / 54;
    const ordenar = resultado.demanda / q * resultado.costoPedido;
    const inventarioMaximo = esFaltantes ? q * resultado.costoFaltante / (resultado.mantenimientoUnitario + resultado.costoFaltante) : q * resultado.factorProduccion;
    const faltanteMaximo = esFaltantes ? q - inventarioMaximo : 0;
    const mantener = esFaltantes ? inventarioMaximo ** 2 / (2 * q) * resultado.mantenimientoUnitario : inventarioMaximo / 2 * resultado.mantenimientoUnitario;
    const faltantes = esFaltantes ? faltanteMaximo ** 2 / (2 * q) * resultado.costoFaltante : 0;
    return { q, ordenar, mantener, faltantes, total: ordenar + mantener + faltantes };
  });
  const maximoCosto = Math.max(...muestras.map(muestra => muestra.total)) * 1.08;
  const escalaX = q => margen.izquierda + (q - minimoQ) / (maximoQ - minimoQ) * anchoUtil;
  const escalaY = costo => margen.superior + altoUtil - costo / maximoCosto * altoUtil;
  const ruta = clave => lineaSvg(muestras.map(muestra => [escalaX(muestra.q), escalaY(muestra[clave])]));
  const lineas = [0, .25, .5, .75, 1].map(proporcion => {
    const costo = maximoCosto * proporcion;
    const y = escalaY(costo);
    return `<line x1="${margen.izquierda}" y1="${y}" x2="${ancho - margen.derecha}" y2="${y}" stroke="#dfe7e3"/><text x="${margen.izquierda - 10}" y="${y + 4}" text-anchor="end" fill="#71817b" font-size="10">${limitarDecimales(costo, 0)}</text>`;
  }).join("");
  const xOptimo = escalaX(resultado.loteOptimo);
  const yOptimo = escalaY(resultado.costoRelevante);
  const loteAlternativo = Math.min(maximoQ, Math.max(minimoQ, loteExplorado || resultado.loteOptimo));
  const costoAlternativo = costoRelevanteParaLote(resultado, loteAlternativo);
  const xAlternativo = escalaX(loteAlternativo);
  const yAlternativo = escalaY(costoAlternativo);
  const mostrarAlternativo = Math.abs(loteAlternativo - resultado.loteOptimo) > Math.max(.01, resultado.loteOptimo * .001);

  elementos.graficoCostos.innerHTML = `
    <svg viewBox="0 0 ${ancho} ${alto}" role="img" aria-labelledby="titulo-grafico-costos">
      <title id="titulo-grafico-costos">Costo anual según el tamaño de lote</title>
      ${lineas}
      <line x1="${margen.izquierda}" y1="${alto - margen.inferior}" x2="${ancho - margen.derecha}" y2="${alto - margen.inferior}" stroke="#61756e" stroke-width="1.5"/>
      <path d="${ruta("ordenar")}" fill="none" stroke="#bd6c3c" stroke-width="3"/>
      <path d="${ruta("mantener")}" fill="none" stroke="#25816b" stroke-width="3"/>
      ${esFaltantes ? `<path d="${ruta("faltantes")}" fill="none" stroke="#795b9f" stroke-width="3"/>` : ""}
      <path d="${ruta("total")}" fill="none" stroke="#172722" stroke-width="4"/>
      <line x1="${xOptimo}" y1="${margen.superior}" x2="${xOptimo}" y2="${alto - margen.inferior}" stroke="#e7b949" stroke-width="2" stroke-dasharray="7 5"/>
      <circle cx="${xOptimo}" cy="${yOptimo}" r="7" fill="#e7b949" stroke="#fff" stroke-width="3"><title>Q* = ${limitarDecimales(resultado.loteOptimo)}</title></circle>
      ${mostrarAlternativo ? `<line x1="${xAlternativo}" y1="${margen.superior}" x2="${xAlternativo}" y2="${alto - margen.inferior}" stroke="#795b9f" stroke-width="2" stroke-dasharray="4 5"/><circle cx="${xAlternativo}" cy="${yAlternativo}" r="7" fill="#795b9f" stroke="#fff" stroke-width="3"><title>Lote probado ${limitarDecimales(loteAlternativo)} · Costo ${formatearMoneda(costoAlternativo, resultado.moneda)}</title></circle>` : ""}
      <text x="${xOptimo}" y="${alto - 31}" text-anchor="middle" fill="#8e651b" font-size="11" font-weight="800">Q* ${limitarDecimales(resultado.loteOptimo)}</text>
      <g transform="translate(${margen.izquierda + 12} 15)" font-size="10" font-weight="700"><circle cx="0" cy="0" r="4" fill="#bd6c3c"/><text x="9" y="4" fill="#6c7773">Ordenar</text><circle cx="72" cy="0" r="4" fill="#25816b"/><text x="81" y="4" fill="#6c7773">Mantener</text>${esFaltantes ? `<circle cx="154" cy="0" r="4" fill="#795b9f"/><text x="163" y="4" fill="#6c7773">Faltantes</text><circle cx="232" cy="0" r="4" fill="#172722"/><text x="241" y="4" fill="#6c7773">Relevante</text>` : `<circle cx="154" cy="0" r="4" fill="#172722"/><text x="163" y="4" fill="#6c7773">Relevante</text>`}${mostrarAlternativo ? `<circle cx="${esFaltantes ? 318 : 236}" cy="0" r="4" fill="#9a7dbd"/><text x="${esFaltantes ? 327 : 245}" y="4" fill="#6c7773">Lote probado</text>` : ""}</g>
      <text x="${margen.izquierda + anchoUtil / 2}" y="${alto - 5}" text-anchor="middle" fill="#536760" font-size="12" font-weight="700">${resultado.modelo === "epq" ? "Lote de producción Q" : "Cantidad por pedido Q"}</text>
    </svg>`;
}

function costoRelevanteParaLote(resultado, lote) {
  if (resultado.modelo === "faltantes") {
    const inventarioMaximo = lote * resultado.costoFaltante / (resultado.mantenimientoUnitario + resultado.costoFaltante);
    const faltanteMaximo = lote - inventarioMaximo;
    return resultado.demanda / lote * resultado.costoPedido
      + inventarioMaximo ** 2 / (2 * lote) * resultado.mantenimientoUnitario
      + faltanteMaximo ** 2 / (2 * lote) * resultado.costoFaltante;
  }
  return resultado.demanda / lote * resultado.costoPedido + lote * resultado.factorProduccion / 2 * resultado.mantenimientoUnitario;
}

function configurarSimuladorLote(resultado) {
  const minimo = Math.max(.01, resultado.loteOptimo * .25);
  const maximo = resultado.loteOptimo * 2.25;
  const paso = resultado.loteOptimo >= 100 ? 1 : Math.max(.01, resultado.loteOptimo / 100);
  loteExplorado = resultado.loteOptimo;
  elementos.controlLote.min = String(minimo);
  elementos.controlLote.max = String(maximo);
  elementos.controlLote.step = String(paso);
  elementos.controlLote.value = String(resultado.loteOptimo);
  elementos.loteAlternativo.min = String(minimo);
  elementos.loteAlternativo.max = String(maximo);
  elementos.loteAlternativo.step = String(paso);
  elementos.loteAlternativo.value = String(Number(resultado.loteOptimo.toFixed(2)));
  actualizarSimulacionLote(false);
}

function actualizarSimulacionLote(redibujar = true) {
  if (!ultimoResultado) return;
  const minimo = numero(elementos.controlLote.min);
  const maximo = numero(elementos.controlLote.max);
  loteExplorado = Math.min(maximo, Math.max(minimo, numero(loteExplorado)));
  const costo = costoRelevanteParaLote(ultimoResultado, loteExplorado);
  const diferencia = costo - ultimoResultado.costoRelevante;
  const porcentaje = diferencia / ultimoResultado.costoRelevante * 100;
  const practicamenteOptimo = porcentaje < .005;
  elementos.costoLoteAlternativo.textContent = formatearMoneda(costo, ultimoResultado.moneda);
  elementos.diferenciaLote.textContent = practicamenteOptimo ? formatearMoneda(0, ultimoResultado.moneda) : `+ ${formatearMoneda(diferencia, ultimoResultado.moneda)}`;
  elementos.impactoLote.textContent = practicamenteOptimo ? "Costo mínimo" : `+ ${limitarDecimales(porcentaje, 3)} %`;
  [elementos.diferenciaLote, elementos.impactoLote].forEach(elemento => {
    elemento.classList.toggle("costo-optimo", practicamenteOptimo);
    elemento.classList.toggle("costo-mayor", !practicamenteOptimo);
  });
  if (redibujar) dibujarGraficoCostos(ultimoResultado);
}

function mostrarLecturaGrafico(resultado) {
  const esEpq = resultado.modelo === "epq";
  const esFaltantes = resultado.modelo === "faltantes";
  const avisoEntrega = resultado.tiempoEntrega > resultado.tiempoCiclo
    ? "El tiempo de entrega supera un ciclo; puede haber varios pedidos pendientes. Interprete r como posición de inventario."
    : `El pedido tarda ${limitarDecimales(resultado.tiempoEntrega)} días y llega cuando el inventario se aproxima a cero.`;
  elementos.lecturaGrafico.innerHTML = esFaltantes
    ? `<div><span>Inventario máximo</span><strong>${limitarDecimales(resultado.inventarioMaximo)} unidades</strong></div><div><span>Faltante máximo</span><strong>${limitarDecimales(resultado.faltanteMaximo)} unidades</strong></div><div><span>Periodo sin existencias</span><strong>${limitarDecimales(resultado.tiempoSinInventario)} días por ciclo</strong></div>`
    : `<div><span>Inventario máximo</span><strong>${limitarDecimales(resultado.inventarioMaximo)} unidades</strong></div><div><span>Inventario promedio</span><strong>${limitarDecimales(resultado.inventarioPromedio)} unidades</strong></div><div><span>${esEpq ? "Producción del lote" : "Tiempo de entrega"}</span><strong>${esEpq ? `${limitarDecimales(resultado.tiempoProduccion)} días de producción` : escaparHtml(avisoEntrega)}</strong></div>`;
}

function pasoDesarrollo(numeroPaso, titulo, explicacion, formula) {
  return `<article class="paso-calculo"><span class="numero-paso">${numeroPaso}</span><div><h3>${titulo}</h3><p>${explicacion}</p></div><div class="formula">\\(${formula}\\)</div></article>`;
}

function mostrarDesarrollo(resultado) {
  const d = limitarDecimales(resultado.demanda, 4);
  const co = limitarDecimales(resultado.costoPedido, 4);
  const ch = limitarDecimales(resultado.mantenimientoUnitario, 4);
  const q = limitarDecimales(resultado.loteOptimo, 4);
  const dias = limitarDecimales(resultado.diasLaborables, 4);
  const m = limitarDecimales(resultado.tiempoEntrega, 4);
  const demandaDiaria = limitarDecimales(resultado.demandaDiaria, 4);
  const costo = simboloMoneda(resultado.moneda);
  const pasos = [];
  const esEpq = resultado.modelo === "epq";
  const esFaltantes = resultado.modelo === "faltantes";

  if (esFaltantes) {
    const cs = limitarDecimales(resultado.costoFaltante, 4);
    const imax = limitarDecimales(resultado.inventarioMaximo, 4);
    const faltante = limitarDecimales(resultado.faltanteMaximo, 4);
    const agregar = (titulo, explicacion, formula) => pasos.push(pasoDesarrollo(String(pasos.length + 1).padStart(2, "0"), titulo, explicacion, formula));
    if (resultado.modoMantenimiento === "porcentaje") {
      agregar("Calcular el costo de retención", "Convierta la tasa anual a decimal y multiplíquela por el costo unitario.", `C_h=IC=\\left(\\frac{${limitarDecimales(resultado.valorMantenimiento, 4)}}{100}\\right)(${limitarDecimales(resultado.costoUnitario, 4)})=${ch}`);
    }
    agregar("Cantidad económica con faltantes", "Incluya el costo de mantener unidades y el costo de dejarlas pendientes.", `Q^*=\\sqrt{\\frac{2DC_o(C_h+C_s)}{C_hC_s}}=\\sqrt{\\frac{2(${d})(${co})(${ch}+${cs})}{(${ch})(${cs})}}=${q}`);
    agregar("Calcular el inventario máximo", "La parte más costosa de dejar pendiente se conserva como existencia.", `I_{max}=Q^*\\frac{C_s}{C_h+C_s}=(${q})\\frac{${cs}}{${ch}+${cs}}=${imax}`);
    agregar("Calcular el faltante máximo", "La parte restante del lote corresponde a pedidos pendientes.", `B^*=Q^*\\frac{C_h}{C_h+C_s}=(${q})\\frac{${ch}}{${ch}+${cs}}=${faltante}`);
    agregar("Calcular los pedidos del año", "Divida la demanda anual entre el lote óptimo.", `N=\\frac{D}{Q^*}=\\frac{${d}}{${q}}=${limitarDecimales(resultado.numeroPedidos, 4)}`);
    agregar("Calcular el tiempo entre pedidos", "Distribuya los días laborables entre los ciclos.", `T=\\frac{d_a}{N}=\\frac{${dias}}{${limitarDecimales(resultado.numeroPedidos, 4)}}=${limitarDecimales(resultado.tiempoCiclo, 4)}\\;días`);
    agregar("Calcular la demanda diaria", "Divida la demanda anual entre los días laborables.", `d=\\frac{D}{d_a}=\\frac{${d}}{${dias}}=${demandaDiaria}`);
    agregar("Obtener el punto de reorden", "Reste el faltante máximo a la demanda esperada durante la entrega.", `r=dm-B^*=(${demandaDiaria})(${m})-${faltante}=${limitarDecimales(resultado.puntoReorden, 4)}`);
    agregar("Costo anual de preparación", "Multiplique el número de pedidos por el costo de cada orden.", `CP=\\frac{D}{Q^*}C_o=\\frac{${d}}{${q}}(${co})=${costo}\\;${limitarDecimales(resultado.costoOrdenar, 4)}`);
    agregar("Costo anual de retención", "Considere únicamente el área positiva del ciclo de inventario.", `CR=\\frac{I_{max}^2}{2Q^*}C_h=\\frac{${imax}^2}{2(${q})}(${ch})=${costo}\\;${limitarDecimales(resultado.costoMantener, 4)}`);
    agregar("Costo anual de faltantes", "Considere el área negativa del ciclo y su penalización anual.", `CF=\\frac{{B^*}^2}{2Q^*}C_s=\\frac{${faltante}^2}{2(${q})}(${cs})=${costo}\\;${limitarDecimales(resultado.costoFaltantes, 4)}`);
    agregar("Costo anual con faltantes", "Sume preparación, retención y faltantes.", `CT=CP+CR+CF=${limitarDecimales(resultado.costoOrdenar, 4)}+${limitarDecimales(resultado.costoMantener, 4)}+${limitarDecimales(resultado.costoFaltantes, 4)}=${costo}\\;${limitarDecimales(resultado.costoRelevante, 4)}`);
    if (resultado.capacidadMaxima !== null) {
      const comparador = resultado.capacidadSuficiente ? "\\le" : ">";
      const conclusion = resultado.capacidadSuficiente ? "La capacidad disponible es suficiente." : "La capacidad disponible no es suficiente.";
      agregar("Comprobar la capacidad", conclusion, `I_{max}=${imax}${comparador}C_{\\max}=${limitarDecimales(resultado.capacidadMaxima, 4)}`);
    }
    elementos.desarrollo.innerHTML = pasos.join("");
    renderizarLatex([elementos.desarrollo]);
    return;
  }

  if (resultado.modoMantenimiento === "porcentaje") {
    pasos.push(pasoDesarrollo("01", "Calcular el costo de retención", "Convierta la tasa anual a decimal y multiplíquela por el costo unitario.", `I=${limitarDecimales(resultado.valorMantenimiento, 4)}\\%=\\frac{${limitarDecimales(resultado.valorMantenimiento, 4)}}{100},\\quad C_h=IC=\\left(\\frac{${limitarDecimales(resultado.valorMantenimiento, 4)}}{100}\\right)(${limitarDecimales(resultado.costoUnitario, 4)})=${ch}`));
  }
  if (esEpq) {
    pasos.push(pasoDesarrollo(
      String(pasos.length + 1).padStart(2, "0"),
      "Obtener la fracción almacenada",
      "Descuente del ritmo de producción la parte que se consume mientras se fabrica.",
      `1-\\frac{D}{P}=1-\\frac{${limitarDecimales(resultado.demanda, 4)}}{${limitarDecimales(resultado.tasaProduccion, 4)}}=${limitarDecimales(resultado.factorProduccion, 4)}`
    ));
  }
  const base = pasos.length + 1;
  pasos.push(
    pasoDesarrollo(String(base).padStart(2, "0"), esEpq ? "Lote económico de producción" : "Cantidad económica de pedido", esEpq ? "Incluya la reposición gradual en el equilibrio de costos." : "Sustituya la demanda, el costo por pedido y el costo de retención.", esEpq ? `Q^*=\\sqrt{\\frac{2DC_o}{C_h(1-D/P)}}=\\sqrt{\\frac{2(${d})(${co})}{(${ch})(${limitarDecimales(resultado.factorProduccion, 4)})}}=${q}` : `Q^*=\\sqrt{\\frac{2DC_o}{C_h}}=\\sqrt{\\frac{2(${d})(${co})}{${ch}}}=${q}`),
    pasoDesarrollo(String(base + 1).padStart(2, "0"), esEpq ? "Calcular los ciclos del año" : "Calcular los pedidos del año", "Divida la demanda anual entre el lote óptimo.", `N=\\frac{D}{Q^*}=\\frac{${d}}{${q}}=${limitarDecimales(resultado.numeroPedidos, 4)}`),
    pasoDesarrollo(String(base + 2).padStart(2, "0"), esEpq ? "Calcular el tiempo entre ciclos" : "Calcular el tiempo entre pedidos", "Distribuya los días laborables entre los ciclos.", `T=\\frac{d_a}{N}=\\frac{${dias}}{${limitarDecimales(resultado.numeroPedidos, 4)}}=${limitarDecimales(resultado.tiempoCiclo, 4)}\\;días`),
    pasoDesarrollo(String(base + 3).padStart(2, "0"), "Calcular la demanda diaria", "Divide la demanda anual entre los días laborables.", `d=\\frac{D}{d_a}=\\frac{${d}}{${dias}}=${demandaDiaria}`),
    pasoDesarrollo(String(base + 4).padStart(2, "0"), esEpq ? "Definir el inicio de preparación" : "Obtener el punto de reorden", "Multiplique la demanda diaria por el tiempo de preparación o entrega.", `r=dm=(${demandaDiaria})(${m})=${limitarDecimales(resultado.puntoReorden, 4)}`),
    ...(esEpq ? [
      pasoDesarrollo(String(base + 5).padStart(2, "0"), "Calcular el inventario máximo", "Solo la fracción no consumida del lote llega a almacenarse.", `I_{max}=Q^*\\left(1-\\frac{D}{P}\\right)=(${q})(${limitarDecimales(resultado.factorProduccion, 4)})=${limitarDecimales(resultado.inventarioMaximo, 4)}`),
      pasoDesarrollo(String(base + 6).padStart(2, "0"), "Calcular el tiempo de producción", "Divida el lote entre la producción anual y convierta el resultado a días laborables.", `t_p=\\frac{Q^*}{P}d_a=\\frac{${q}}{${limitarDecimales(resultado.tasaProduccion, 4)}}(${dias})=${limitarDecimales(resultado.tiempoProduccion, 4)}\\;días`)
    ] : []),
    pasoDesarrollo(String(base + (esEpq ? 7 : 5)).padStart(2, "0"), "Costo anual de preparación", "Multiplique el número de ciclos por el costo de cada preparación.", `CP=\\frac{D}{Q^*}C_o=\\frac{${d}}{${q}}(${co})=${costo}\\;${limitarDecimales(resultado.costoOrdenar, 4)}`),
    pasoDesarrollo(String(base + (esEpq ? 8 : 6)).padStart(2, "0"), "Costo anual de retención", "Multiplique el inventario promedio por el costo de mantener una unidad.", `CR=I_{prom}C_h=(${limitarDecimales(resultado.inventarioPromedio, 4)})(${ch})=${costo}\\;${limitarDecimales(resultado.costoMantener, 4)}`),
    pasoDesarrollo(String(base + (esEpq ? 9 : 7)).padStart(2, "0"), esEpq ? "Costo anual EPQ" : "Costo anual EOQ", "Sume el costo de preparación y el costo de retención.", `CT=CP+CR=${limitarDecimales(resultado.costoOrdenar, 4)}+${limitarDecimales(resultado.costoMantener, 4)}=${costo}\\;${limitarDecimales(resultado.costoRelevante, 4)}`)
  );
  if (resultado.capacidadMaxima !== null) {
    const comparador = resultado.capacidadSuficiente ? "\\le" : ">";
    const conclusion = resultado.capacidadSuficiente ? "La capacidad disponible es suficiente." : "La capacidad disponible no es suficiente.";
    pasos.push(pasoDesarrollo(String(base + (esEpq ? 10 : 8)).padStart(2, "0"), "Comprobar la capacidad", conclusion, `${esEpq ? `I_{max}=${limitarDecimales(resultado.inventarioMaximo, 4)}` : `Q^*=${q}`}${comparador}C_{\\max}=${limitarDecimales(resultado.capacidadMaxima, 4)}`));
  }
  elementos.desarrollo.innerHTML = pasos.join("");
  renderizarLatex([elementos.desarrollo]);
}

function renderizarLatex(contenedores) {
  if (!window.MathJax?.typesetPromise) return;
  window.MathJax.typesetClear?.(contenedores);
  window.MathJax.typesetPromise(contenedores).catch(() => {});
}

function crearEscenariosIniciales(resultado) {
  const esFaltantes = resultado.modelo === "faltantes";
  listaEscenarios = [
    { nombre: "Base", demanda: resultado.demanda, pedido: resultado.costoPedido, mantenimiento: resultado.mantenimientoUnitario, produccion: resultado.tasaProduccion, faltante: resultado.costoFaltante },
    { nombre: "Demanda +20%", demanda: resultado.demanda * 1.2, pedido: resultado.costoPedido, mantenimiento: resultado.mantenimientoUnitario, produccion: resultado.tasaProduccion, faltante: resultado.costoFaltante },
    { nombre: resultado.modelo === "epq" ? "Producción +20%" : esFaltantes ? "Faltante +20%" : "Pedido +20%", demanda: resultado.demanda, pedido: resultado.modelo === "epq" || esFaltantes ? resultado.costoPedido : resultado.costoPedido * 1.2, mantenimiento: resultado.mantenimientoUnitario, produccion: resultado.modelo === "epq" ? resultado.tasaProduccion * 1.2 : null, faltante: esFaltantes ? resultado.costoFaltante * 1.2 : null }
  ];
  renderizarEscenarios();
}

function calculoEscenario(escenario) {
  const demanda = numero(escenario.demanda);
  const pedido = numero(escenario.pedido);
  const mantenimiento = numero(escenario.mantenimiento);
  if (!(demanda > 0 && pedido > 0 && mantenimiento > 0)) return null;
  const esEpq = elementos.modelo.value === "epq";
  const esFaltantes = elementos.modelo.value === "faltantes";
  const produccion = numero(escenario.produccion);
  const faltante = numero(escenario.faltante);
  if (esEpq && !(produccion > demanda)) return null;
  if (esFaltantes && !(faltante > 0)) return null;
  const factor = esEpq ? 1 - demanda / produccion : esFaltantes ? faltante / (mantenimiento + faltante) : 1;
  const lote = Math.sqrt(2 * demanda * pedido / (mantenimiento * factor));
  const pedidos = demanda / lote;
  const relevante = demanda / lote * pedido + lote * factor / 2 * mantenimiento;
  return { lote, pedidos, relevante, factor };
}

function renderizarEscenarios() {
  const esEpq = elementos.modelo.value === "epq";
  const esFaltantes = elementos.modelo.value === "faltantes";
  elementos.escenarios.innerHTML = listaEscenarios.map((escenario, indice) => {
    const calculo = calculoEscenario(escenario);
    return `<tr data-indice="${indice}">
      <td><input data-campo="nombre" type="text" value="${escaparHtml(escenario.nombre)}" aria-label="Nombre del escenario ${indice + 1}"></td>
      <td><input data-campo="demanda" type="number" min="0" step="any" value="${escenario.demanda}" aria-label="Demanda del escenario ${indice + 1}"></td>
      <td><input data-campo="pedido" type="number" min="0" step="any" value="${escenario.pedido}" aria-label="Costo por pedido del escenario ${indice + 1}"></td>
      <td><input data-campo="mantenimiento" type="number" min="0" step="any" value="${escenario.mantenimiento}" aria-label="Mantenimiento del escenario ${indice + 1}"></td>
      <td class="columna-produccion"${esEpq ? "" : " hidden"}><input data-campo="produccion" type="number" min="0" step="any" value="${escenario.produccion ?? ""}" aria-label="Producción del escenario ${indice + 1}"></td>
      <td class="columna-faltantes"${esFaltantes ? "" : " hidden"}><input data-campo="faltante" type="number" min="0" step="any" value="${escenario.faltante ?? ""}" aria-label="Costo por faltante del escenario ${indice + 1}"></td>
      <td data-salida="lote">${calculo ? limitarDecimales(calculo.lote) : "—"}</td>
      <td data-salida="pedidos">${calculo ? limitarDecimales(calculo.pedidos) : "—"}</td>
      <td data-salida="relevante">${calculo ? formatearMoneda(calculo.relevante) : "—"}</td>
      <td><button class="eliminar-escenario" type="button" aria-label="Eliminar ${escaparHtml(escenario.nombre)}">×</button></td>
    </tr>`;
  }).join("");
  renderizarBarrasEscenarios();
  guardarFormulario();
}

function renderizarBarrasEscenarios() {
  const validos = listaEscenarios.map(escenario => ({ escenario, calculo: calculoEscenario(escenario) })).filter(item => item.calculo);
  const maximo = Math.max(1, ...validos.map(item => item.calculo.relevante));
  elementos.barrasEscenarios.innerHTML = validos.map(item => `<div class="barra-escenario"><span>${escaparHtml(item.escenario.nombre || "Sin nombre")}</span><div class="pista-barra"><i style="width:${Math.max(3, item.calculo.relevante / maximo * 100)}%"></i></div><strong>${formatearMoneda(item.calculo.relevante)}</strong></div>`).join("");
}

function actualizarEscenarioDesdeTabla(evento) {
  const entrada = evento.target.closest("input[data-campo]");
  if (!entrada) return;
  const fila = entrada.closest("tr[data-indice]");
  const indice = Number(fila.dataset.indice);
  const campo = entrada.dataset.campo;
  listaEscenarios[indice][campo] = campo === "nombre" ? entrada.value : entrada.value;
  const calculo = calculoEscenario(listaEscenarios[indice]);
  fila.querySelector('[data-salida="lote"]').textContent = calculo ? limitarDecimales(calculo.lote) : "—";
  fila.querySelector('[data-salida="pedidos"]').textContent = calculo ? limitarDecimales(calculo.pedidos) : "—";
  fila.querySelector('[data-salida="relevante"]').textContent = calculo ? formatearMoneda(calculo.relevante) : "—";
  renderizarBarrasEscenarios();
  guardarFormulario();
}

function agregarEscenario() {
  listaEscenarios.push({ nombre: `Escenario ${listaEscenarios.length + 1}`, demanda: ultimoResultado?.demanda || "", pedido: ultimoResultado?.costoPedido || "", mantenimiento: ultimoResultado?.mantenimientoUnitario || "", produccion: ultimoResultado?.tasaProduccion || "", faltante: ultimoResultado?.costoFaltante || "" });
  renderizarEscenarios();
}

function importarEscenarios() {
  const esEpq = elementos.modelo.value === "epq";
  const esFaltantes = elementos.modelo.value === "faltantes";
  const lineas = elementos.datosPegados.value.trim().split(/\r?\n/).filter(Boolean);
  const importados = [];
  lineas.forEach(linea => {
    const separador = linea.includes("\t") ? "\t" : ";";
    const partes = linea.split(separador).map(parte => parte.trim());
    if (partes.length < (esEpq || esFaltantes ? 5 : 4)) return;
    const escenario = { nombre: partes[0] || `Escenario ${importados.length + 1}`, demanda: numero(partes[1]), pedido: numero(partes[2]), mantenimiento: numero(partes[3]), produccion: esEpq ? numero(partes[4]) : null, faltante: esFaltantes ? numero(partes[4]) : null };
    if (calculoEscenario(escenario)) importados.push(escenario);
  });
  if (!importados.length) {
    elementos.datosPegados.setCustomValidity("No se encontraron filas válidas.");
    elementos.datosPegados.reportValidity();
    return;
  }
  elementos.datosPegados.setCustomValidity("");
  listaEscenarios = importados;
  renderizarEscenarios();
  elementos.dialogoPegar.close();
  elementos.datosPegados.value = "";
}

function activarPestana(idPanel) {
  document.querySelectorAll(".pestana").forEach(boton => {
    const activa = boton.dataset.panel === idPanel;
    boton.classList.toggle("activo", activa);
    boton.setAttribute("aria-selected", String(activa));
    boton.tabIndex = activa ? 0 : -1;
  });
  document.querySelectorAll(".panel-pestana").forEach(panel => {
    const activo = panel.id === idPanel;
    panel.hidden = !activo;
    panel.classList.toggle("activo", activo);
  });
  actualizarFlujo(idPanel === "panel-politica" ? "politica" : "analisis");
}

function actualizarFlujo(paso) {
  document.querySelectorAll(".flujo li").forEach(elemento => elemento.classList.toggle("activo", elemento.dataset.paso === paso));
}

function cerrarDialogo(evento) {
  const dialogo = evento.target.closest("dialog");
  if (dialogo) dialogo.close();
}

function abrirGuia() {
  elementos.dialogoGuia.showModal();
  renderizarLatex([elementos.dialogoGuia]);
}

elementos.formulario.addEventListener("submit", evento => {
  evento.preventDefault();
  if (resolverFormulario()) elementos.salida.scrollIntoView({ behavior: "smooth", block: "start" });
});

elementos.formulario.addEventListener("input", evento => {
  if (evento.target.name === "modoMantenimiento") actualizarModoMantenimiento();
  if (evento.target.id === "moneda") actualizarSimbolosMoneda();
  programarCalculo();
});
elementos.formulario.addEventListener("change", evento => {
  if (evento.target.id === "modelo") {
    actualizarModelo();
    listaEscenarios = [];
  }
  if (evento.target.name === "modoMantenimiento") actualizarModoMantenimiento();
  if (evento.target.id === "moneda") actualizarSimbolosMoneda();
  programarCalculo();
});

document.getElementById("cargar-ejemplo").addEventListener("click", cargarEjemplo);
document.getElementById("limpiar").addEventListener("click", limpiarFormulario);
document.getElementById("imprimir").addEventListener("click", () => window.print());
document.getElementById("abrir-guia").addEventListener("click", abrirGuia);
document.getElementById("teoria-flotante").addEventListener("click", abrirGuia);
document.getElementById("pegar-escenarios").addEventListener("click", () => elementos.dialogoPegar.showModal());
document.getElementById("agregar-escenario").addEventListener("click", agregarEscenario);
document.getElementById("importar-escenarios").addEventListener("click", importarEscenarios);
document.querySelectorAll(".cerrar-dialogo").forEach(boton => boton.addEventListener("click", cerrarDialogo));
elementos.ciclosGrafico.addEventListener("change", () => {
  if (ultimoResultado) dibujarGraficoInventario(ultimoResultado);
});
elementos.controlLote.addEventListener("input", () => {
  loteExplorado = numero(elementos.controlLote.value);
  elementos.loteAlternativo.value = String(Number(loteExplorado.toFixed(2)));
  actualizarSimulacionLote();
});
elementos.loteAlternativo.addEventListener("input", () => {
  const valor = numero(elementos.loteAlternativo.value);
  if (!(valor > 0)) return;
  const minimo = numero(elementos.controlLote.min);
  const maximo = numero(elementos.controlLote.max);
  loteExplorado = Math.min(maximo, Math.max(minimo, valor));
  elementos.controlLote.value = String(loteExplorado);
  actualizarSimulacionLote();
});
elementos.loteAlternativo.addEventListener("change", () => {
  elementos.loteAlternativo.value = String(Number(loteExplorado.toFixed(2)));
});

document.querySelectorAll(".dialogo").forEach(dialogo => dialogo.addEventListener("click", evento => {
  if (evento.target === dialogo) dialogo.close();
}));

document.querySelectorAll(".pestana").forEach(boton => {
  boton.addEventListener("click", () => activarPestana(boton.dataset.panel));
  boton.addEventListener("keydown", evento => {
    if (!["ArrowLeft", "ArrowRight"].includes(evento.key)) return;
    evento.preventDefault();
    const pestanas = [...document.querySelectorAll(".pestana")];
    const desplazamiento = evento.key === "ArrowRight" ? 1 : -1;
    const siguiente = pestanas[(pestanas.indexOf(boton) + desplazamiento + pestanas.length) % pestanas.length];
    activarPestana(siguiente.dataset.panel);
    siguiente.focus();
  });
});

elementos.escenarios.addEventListener("input", actualizarEscenarioDesdeTabla);
elementos.escenarios.addEventListener("click", evento => {
  const boton = evento.target.closest(".eliminar-escenario");
  if (!boton) return;
  const indice = Number(boton.closest("tr").dataset.indice);
  listaEscenarios.splice(indice, 1);
  renderizarEscenarios();
});

const habiaGuardado = restaurarFormulario();
actualizarModelo();
if (habiaGuardado) resolverFormulario(false);
actualizarModoMantenimiento();
actualizarSimbolosMoneda();
window.addEventListener("load", () => {
  if (ultimoResultado) renderizarLatex([elementos.desarrollo]);
});
