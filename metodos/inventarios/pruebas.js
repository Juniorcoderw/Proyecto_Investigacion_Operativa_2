"use strict";

const resumenPruebas = document.getElementById("resumen-pruebas");
const listaPruebas = document.getElementById("lista-pruebas");
const aplicacionPruebas = document.getElementById("aplicacion-pruebas");

function afirmar(condicion, mensaje) {
  if (!condicion) throw new Error(mensaje);
}

function afirmarCasiIgual(valor, esperado, mensaje) {
  const tolerancia = 1e-9 * Math.max(1, Math.abs(valor), Math.abs(esperado));
  afirmar(Math.abs(valor - esperado) <= tolerancia, `${mensaje}: se obtuvo ${valor}`);
}

function datosBase(cambios = {}) {
  return {
    modelo: "eoq",
    producto: "Caso de prueba",
    demanda: 3600,
    tasaProduccion: null,
    costoPedido: 20,
    costoUnitario: 3,
    diasLaborables: 250,
    tiempoEntrega: 5,
    capacidadMaxima: null,
    valorMantenimiento: .75,
    mantenimientoUnitario: .75,
    modoMantenimiento: "unidad",
    moneda: "USD",
    ...cambios
  };
}

function registrarResultado(nombre, error = null) {
  const elemento = document.createElement("li");
  elemento.className = error ? "prueba-fallida" : "prueba-correcta";
  const titulo = document.createElement("strong");
  titulo.textContent = `${error ? "No superada" : "Correcta"} · ${nombre}`;
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
      nombre: "EOQ de la práctica Veinteluces",
      ejecutar() {
        const resultado = calculadora.calcularEoq(datosBase({ demanda: 1200, costoPedido: 20, costoUnitario: 2, mantenimientoUnitario: .30, valorMantenimiento: .30, diasLaborables: 240, tiempoEntrega: 7 }));
        afirmarCasiIgual(resultado.loteOptimo, 400, "Q* debe ser 400");
        afirmarCasiIgual(resultado.numeroPedidos, 3, "Deben resultar 3 pedidos al año");
        afirmarCasiIgual(resultado.tiempoCiclo, 80, "El ciclo debe ser de 80 días");
        afirmarCasiIgual(resultado.puntoReorden, 35, "El punto de reorden debe ser 35");
      }
    },
    {
      nombre: "EOQ del ejercicio R&B Beverage Company",
      ejecutar() {
        const resultado = calculadora.calcularEoq(datosBase());
        afirmarCasiIgual(resultado.loteOptimo, Math.sqrt(192000), "Q* debe coincidir con el desarrollo manual");
        afirmarCasiIgual(resultado.puntoReorden, 72, "El punto de reorden debe ser 72");
        afirmarCasiIgual(resultado.costoRelevante, Math.sqrt(2 * 3600 * 20 * .75), "El costo relevante no coincide");
      }
    },
    {
      nombre: "EOQ del ejercicio Metropolitan Bus Company",
      ejecutar() {
        const resultado = calculadora.calcularEoq(datosBase({ demanda: 150000, costoPedido: 250, mantenimientoUnitario: .48, valorMantenimiento: .48, diasLaborables: 300, tiempoEntrega: 10 }));
        afirmarCasiIgual(resultado.loteOptimo, 12500, "Q* debe ser 12 500");
        afirmarCasiIgual(resultado.numeroPedidos, 12, "Deben resultar 12 pedidos al año");
        afirmarCasiIgual(resultado.puntoReorden, 5000, "El punto de reorden debe ser 5 000");
      }
    },
    {
      nombre: "EPQ con producción cuatro veces mayor que la demanda",
      ejecutar() {
        const resultado = calculadora.calcularEpq(datosBase({ modelo: "epq", demanda: 10000, tasaProduccion: 40000, costoPedido: 100, costoUnitario: 10, mantenimientoUnitario: 2, valorMantenimiento: 2 }));
        afirmarCasiIgual(resultado.factorProduccion, .75, "La fracción almacenada debe ser 0.75");
        afirmarCasiIgual(resultado.loteOptimo, Math.sqrt(2000000 / 1.5), "El lote EPQ no coincide");
        afirmarCasiIgual(resultado.inventarioMaximo, resultado.loteOptimo * .75, "El inventario máximo no coincide");
        afirmarCasiIgual(resultado.costoOrdenar, resultado.costoMantener, "Los costos deben equilibrarse en Q*");
      }
    },
    {
      nombre: "segundo caso de contraste EPQ",
      ejecutar() {
        const resultado = calculadora.calcularEpq(datosBase({ modelo: "epq", demanda: 24000, tasaProduccion: 60000, costoPedido: 80, costoUnitario: 6, mantenimientoUnitario: 1.2, valorMantenimiento: 1.2, diasLaborables: 300, tiempoEntrega: 4 }));
        afirmarCasiIgual(resultado.factorProduccion, .6, "La fracción almacenada debe ser 0.60");
        afirmarCasiIgual(resultado.loteOptimo, Math.sqrt(3840000 / .72), "El lote EPQ no coincide");
        afirmarCasiIgual(resultado.puntoReorden, 320, "El punto de reorden debe ser 320");
      }
    },
    {
      nombre: "capacidad EPQ evaluada con inventario máximo",
      ejecutar() {
        const datos = datosBase({ modelo: "epq", demanda: 10000, tasaProduccion: 40000, costoPedido: 100, mantenimientoUnitario: 2, valorMantenimiento: 2, capacidadMaxima: 900 });
        const resultado = calculadora.calcularEpq(datos);
        afirmar(resultado.loteOptimo > datos.capacidadMaxima, "El lote producido debe superar la capacidad de referencia");
        afirmar(resultado.inventarioMaximo <= datos.capacidadMaxima, "El inventario físico debe caber");
        afirmar(resultado.capacidadSuficiente, "EPQ debe comparar capacidad contra Imax");
      }
    },
    {
      nombre: "EOQ con faltantes planificados",
      ejecutar() {
        const resultado = calculadora.calcularEoqFaltantes(datosBase({ modelo: "faltantes", demanda: 2000, costoPedido: 25, costoUnitario: 50, mantenimientoUnitario: 10, valorMantenimiento: 10, costoFaltante: 30 }));
        const loteEsperado = Math.sqrt(2 * 2000 * 25 * 40 / (10 * 30));
        afirmarCasiIgual(resultado.loteOptimo, loteEsperado, "El lote con faltantes no coincide");
        afirmarCasiIgual(resultado.inventarioMaximo, loteEsperado * .75, "El inventario máximo no coincide");
        afirmarCasiIgual(resultado.faltanteMaximo, loteEsperado * .25, "El faltante máximo no coincide");
        afirmarCasiIgual(resultado.puntoReorden, 40 - resultado.faltanteMaximo, "El punto de reorden debe descontar el faltante máximo");
        afirmarCasiIgual(resultado.costoRelevante, resultado.costoOrdenar + resultado.costoMantener + resultado.costoFaltantes, "El costo debe incluir las tres componentes");
      }
    },
    {
      nombre: "segundo caso de contraste con faltantes",
      ejecutar() {
        const resultado = calculadora.calcularEoqFaltantes(datosBase({ modelo: "faltantes", demanda: 5000, costoPedido: 40, costoUnitario: 20, mantenimientoUnitario: 4, valorMantenimiento: 4, costoFaltante: 16, diasLaborables: 250, tiempoEntrega: 4 }));
        afirmarCasiIgual(resultado.loteOptimo, Math.sqrt(125000), "El lote con faltantes no coincide");
        afirmarCasiIgual(resultado.inventarioMaximo, resultado.loteOptimo * .8, "El inventario máximo no coincide");
        afirmarCasiIgual(resultado.faltanteMaximo, resultado.loteOptimo * .2, "El faltante máximo no coincide");
      }
    },
    {
      nombre: "mínimo de costos con faltantes",
      ejecutar() {
        const resultado = calculadora.calcularEoqFaltantes(datosBase({ modelo: "faltantes", demanda: 2000, costoPedido: 25, mantenimientoUnitario: 10, valorMantenimiento: 10, costoFaltante: 30 }));
        const optimo = calculadora.costoRelevanteParaLote(resultado, resultado.loteOptimo);
        afirmar(calculadora.costoRelevanteParaLote(resultado, resultado.loteOptimo * .8) > optimo, "Un lote menor debe costar más");
        afirmar(calculadora.costoRelevanteParaLote(resultado, resultado.loteOptimo * 1.2) > optimo, "Un lote mayor debe costar más");
      }
    },
    {
      nombre: "el costo es mínimo alrededor del lote óptimo",
      ejecutar() {
        const resultado = calculadora.calcularEpq(datosBase({ modelo: "epq", demanda: 10000, tasaProduccion: 40000, costoPedido: 100, mantenimientoUnitario: 2, valorMantenimiento: 2 }));
        const optimo = calculadora.costoRelevanteParaLote(resultado, resultado.loteOptimo);
        afirmar(calculadora.costoRelevanteParaLote(resultado, resultado.loteOptimo * .8) > optimo, "Un lote 20 % menor debe costar más");
        afirmar(calculadora.costoRelevanteParaLote(resultado, resultado.loteOptimo * 1.2) > optimo, "Un lote 20 % mayor debe costar más");
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
