"use strict";

const resumenPruebasArbol = document.getElementById("resumen-pruebas");
const listaPruebasArbol = document.getElementById("lista-pruebas");
const aplicacionPruebasArbol = document.getElementById("aplicacion-pruebas");

function afirmarArbol(condicion, mensaje) {
  if (!condicion) throw new Error(mensaje);
}

function casiArbol(valor, esperado, mensaje) {
  const tolerancia = 1e-9 * Math.max(1, Math.abs(valor), Math.abs(esperado));
  afirmarArbol(Math.abs(valor - esperado) <= tolerancia, `${mensaje}: se obtuvo ${valor}`);
}

function registrarArbol(nombre, error = null) {
  const elemento = document.createElement("li");
  elemento.className = error ? "prueba-fallida" : "prueba-correcta";
  elemento.innerHTML = `<strong>${error ? "No superada" : "Correcta"} · ${nombre}</strong>${error ? `<span>${error.message}</span>` : ""}`;
  listaPruebasArbol.append(elemento);
}

function terminal(id, nombre = "Fin") {
  return { id, tipo: "terminal", nombre, ramas: [] };
}

aplicacionPruebasArbol.addEventListener("load", () => {
  const calculadora = aplicacionPruebasArbol.contentWindow;
  const pruebas = [
    {
      nombre: "probabilidades decimales y porcentuales",
      ejecutar() {
        casiArbol(calculadora.normalizarProbabilidadesNodo([.65, .35])[0], .65, "Debe aceptar decimales");
        casiArbol(calculadora.normalizarProbabilidadesNodo([65, 35])[1], .35, "Debe convertir porcentajes");
      }
    },
    {
      nombre: "caso secuencial de lanzamiento",
      ejecutar() {
        const resultado = calculadora.calcularArbol(calculadora.crearEjemploArbol());
        casiArbol(resultado.valor, 72.5, "Valor del nodo inicial");
        afirmarArbol(resultado.decisiones.n1 === 0, "Debe elegir desarrollar");
        afirmarArbol(resultado.decisiones.n4 === 0, "Tras el éxito debe elegir lanzamiento amplio");
      }
    },
    {
      nombre: "nodo de azar",
      ejecutar() {
        const datos = { objetivo: "maximizar", raiz: "n1", nodos: [{ id: "n1", tipo: "azar", nombre: "Demanda", ramas: [{ nombre: "Alta", valor: 100, probabilidad: .3, destino: "n2" }, { nombre: "Baja", valor: 20, probabilidad: .7, destino: "n3" }] }, terminal("n2"), terminal("n3")] };
        casiArbol(calculadora.calcularArbol(datos).valor, 44, "Valor esperado");
      }
    },
    {
      nombre: "minimización de costos",
      ejecutar() {
        const datos = { objetivo: "minimizar", raiz: "n1", nodos: [{ id: "n1", tipo: "decision", nombre: "Proveedor", ramas: [{ nombre: "A", valor: 100, destino: "n2" }, { nombre: "B", valor: 80, destino: "n3" }] }, terminal("n2"), terminal("n3")] };
        const resultado = calculadora.calcularArbol(datos);
        casiArbol(resultado.valor, 80, "Costo mínimo");
        afirmarArbol(resultado.decisiones.n1 === 1, "Debe escoger el proveedor B");
      }
    },
    {
      nombre: "suma de valores a lo largo de una rama",
      ejecutar() {
        const datos = { objetivo: "maximizar", raiz: "n1", nodos: [{ id: "n1", tipo: "decision", nombre: "Inicio", ramas: [{ nombre: "Invertir", valor: -40, destino: "n2" }, { nombre: "No invertir", valor: 10, destino: "n3" }] }, { id: "n2", tipo: "decision", nombre: "Escala", ramas: [{ nombre: "Grande", valor: 90, destino: "n4" }, { nombre: "Pequeña", valor: 50, destino: "n5" }] }, terminal("n3"), terminal("n4"), terminal("n5")] };
        casiArbol(calculadora.calcularArbol(datos).valor, 50, "Debe acumular -40 + 90");
      }
    },
    {
      nombre: "validación de probabilidades",
      ejecutar() {
        const datos = { objetivo: "maximizar", raiz: "n1", nodos: [{ id: "n1", tipo: "azar", nombre: "Evento", ramas: [{ nombre: "A", valor: 1, probabilidad: .2, destino: "n2" }, { nombre: "B", valor: 2, probabilidad: .2, destino: "n3" }] }, terminal("n2"), terminal("n3")] };
        let detectado = false;
        try { calculadora.calcularArbol(datos); } catch { detectado = true; }
        afirmarArbol(detectado, "Debe rechazar probabilidades cuya suma no sea uno");
      }
    }
  ];
  let correctas = 0;
  pruebas.forEach(prueba => {
    try { prueba.ejecutar(); correctas += 1; registrarArbol(prueba.nombre); }
    catch (error) { registrarArbol(prueba.nombre, error); }
  });
  resumenPruebasArbol.textContent = `${correctas} de ${pruebas.length} pruebas superadas.`;
  resumenPruebasArbol.classList.add(correctas === pruebas.length ? "pruebas-superadas" : "pruebas-con-fallos");
  document.body.dataset.estado = correctas === pruebas.length ? "correcto" : "fallido";
}, { once: true });
