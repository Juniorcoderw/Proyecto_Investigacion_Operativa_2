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
      nombre: "el entorno de pruebas no sobrescribe el árbol guardado",
      ejecutar() {
        const anterior = localStorage.getItem("teoria-decisiones-arbol-v1");
        calculadora.guardarArbol();
        afirmarArbol(localStorage.getItem("teoria-decisiones-arbol-v1") === anterior, "Las pruebas deben mantener el guardado del usuario");
      }
    },
    {
      nombre: "agregar y quitar una rama no redistribuye probabilidades",
      ejecutar() {
        const doc = calculadora.document;
        doc.getElementById("caso-arbol").value = "guia-producto";
        doc.getElementById("ejemplo-arbol").click();
        doc.querySelector('[data-nodo="n2"]').dispatchEvent(new MouseEvent("click", {bubbles:true}));
        const leer = () => [...doc.querySelectorAll('#lista-ramas [data-campo="probabilidad"]')].map(x => Number(x.value));
        afirmarArbol(leer().join(",") === "0.3,0.45,0.25", "Probabilidades del caso original");
        doc.getElementById("agregar-rama").click();
        afirmarArbol(leer().join(",") === "0.3,0.45,0.25,0", "Debe conservar las probabilidades al añadir");
        doc.querySelectorAll(".eliminar-rama")[3].click();
        afirmarArbol(leer().join(",") === "0.3,0.45,0.25", "Debe conservarlas al quitar la rama añadida");
      }
    },
    ...[["guia-producto", 43750], ["guia-ampliacion", 104000], ["guia-proveedores", 53000]].map(([clave, esperado]) => ({
      nombre: `árbol completo de la guía: ${clave}`,
      ejecutar() {
        const datos = calculadora.crearEjemploArbol(clave);
        afirmarArbol(datos.nodos.length === 13, "Deben cargarse trece nodos");
        casiArbol(calculadora.calcularArbol(datos).valor, esperado, "VME de la guía");
      }
    })),
    {
      nombre: "probabilidades vacías y ciclos rechazados",
      ejecutar() {
        afirmarArbol(calculadora.normalizarProbabilidadesNodo(["", 1]) === null, "No aceptar probabilidades vacías");
        const datos = calculadora.crearEjemploArbol("guia-producto");
        datos.nodos[1].ramas[0].destino = datos.raiz;
        let fallo = false;
        try { calculadora.calcularArbol(datos); } catch { fallo = true; }
        afirmarArbol(fallo, "Debe detectar el ciclo");
      }
    },
    {
      nombre: "probabilidades decimales y porcentuales",
      ejecutar() {
        casiArbol(calculadora.normalizarProbabilidadesNodo([.65, .35])[0], .65, "Debe aceptar decimales");
        casiArbol(calculadora.normalizarProbabilidadesNodo([65, 35])[1], .35, "Debe convertir porcentajes");
      }
    },
    {
      nombre: "árbol del ejercicio de la rifa",
      ejecutar() {
        const resultado = calculadora.calcularArbol(calculadora.crearEjemploArbol());
        casiArbol(resultado.valores.n2, -50, "Valor esperado de jugar");
        casiArbol(resultado.valor, 0, "Valor del nodo inicial");
        afirmarArbol(resultado.decisiones.n1 === 1, "Debe elegir no comprar");
      }
    },
    {
      nombre: "árbol del ejercicio de vacaciones",
      ejecutar() {
        const resultado = calculadora.calcularArbol(calculadora.crearEjemploArbol("vacaciones"));
        casiArbol(resultado.valores.n2, 707.95, "Costo esperado de México");
        casiArbol(resultado.valores.n3, 675, "Costo esperado de Panamá");
        casiArbol(resultado.valores.n4, 665.4, "Costo esperado de Venezuela");
        casiArbol(resultado.valor, 665.4, "Costo mínimo del viaje");
        afirmarArbol(resultado.decisiones.n1 === 2, "Debe elegir Venezuela");
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
    },
    {
      nombre: "copia profunda de un conjunto de ramas",
      ejecutar() {
        const datos = calculadora.crearEjemploArbol("vacaciones");
        const origen = datos.nodos.find(nodo => nodo.id === "n5");
        const destino = datos.nodos.find(nodo => nodo.id === "n6");
        const idsOriginales = origen.ramas.map(rama => rama.destino);
        const copia = calculadora.crearCopiaDeRamas(datos, origen.id, [0, 1], "estructura");
        calculadora.pegarCopiaDeRamas(datos, destino.id, copia);
        afirmarArbol(destino.ramas.length === 2, "Debe reemplazar el conjunto de ramas del destino");
        afirmarArbol(destino.ramas[0].nombre === origen.ramas[0].nombre, "Debe conservar el nombre de la rama");
        casiArbol(destino.ramas[1].probabilidad, origen.ramas[1].probabilidad, "Debe conservar la probabilidad");
        afirmarArbol(!idsOriginales.includes(destino.ramas[0].destino), "Debe crear nodos independientes");
        destino.ramas[0].nombre = "Nombre editado";
        destino.ramas[0].probabilidad = .1;
        datos.nodos.find(nodo => nodo.id === destino.ramas[0].destino).nombre = "Terminal editado";
        afirmarArbol(origen.ramas[0].nombre !== destino.ramas[0].nombre, "Editar la copia no debe modificar la rama original");
        afirmarArbol(origen.ramas[0].probabilidad !== destino.ramas[0].probabilidad, "Editar la probabilidad copiada no debe modificar la original");
        afirmarArbol(datos.nodos.find(nodo => nodo.id === idsOriginales[0]).nombre !== "Terminal editado", "Editar el subárbol copiado no debe modificar el original");
      }
    },
    {
      nombre: "copia de una rama individual",
      ejecutar() {
        const datos = calculadora.crearEjemploArbol();
        const nodo = datos.nodos.find(actual => actual.id === "n2");
        const destinoOriginal = nodo.ramas[0].destino;
        const copia = calculadora.crearCopiaDeRamas(datos, nodo.id, [0], "individual");
        calculadora.pegarCopiaDeRamas(datos, nodo.id, copia);
        afirmarArbol(nodo.ramas.length === 3, "Debe agregar la rama sin eliminar las existentes");
        afirmarArbol(nodo.ramas[2].destino !== destinoOriginal, "El nodo terminal copiado debe tener una identidad nueva");
        afirmarArbol(nodo.ramas[2].nombre === nodo.ramas[0].nombre, "Debe conservar los datos de la rama");
      }
    },
    {
      nombre: "copia de una selección agrega las ramas elegidas",
      ejecutar() {
        const datos = calculadora.crearEjemploArbol("vacaciones");
        const origen = datos.nodos.find(nodo => nodo.id === "n5");
        const destino = datos.nodos.find(nodo => nodo.id === "n6");
        const cantidadInicial = destino.ramas.length;
        const copia = calculadora.crearCopiaDeRamas(datos, origen.id, [0, 1], "seleccion");
        calculadora.pegarCopiaDeRamas(datos, destino.id, copia);
        afirmarArbol(destino.ramas.length === cantidadInicial + 2, "Debe agregar las ramas seleccionadas sin borrar las existentes");
        afirmarArbol(destino.ramas[cantidadInicial].destino !== origen.ramas[0].destino, "La selección pegada debe conservar independencia");
      }
    },
    {
      nombre: "distribución sin superposición por nivel",
      ejecutar() {
        const datos = calculadora.crearEjemploArbol("vacaciones");
        const distribucion = calculadora.calcularPosiciones(datos);
        const posiciones = Object.values(distribucion.posiciones);
        const grupos = new Map();
        posiciones.forEach(posicion => {
          if (!grupos.has(posicion.x)) grupos.set(posicion.x, []);
          grupos.get(posicion.x).push(posicion.y);
        });
        grupos.forEach(valores => {
          valores.sort((a, b) => a - b);
          for (let indice = 1; indice < valores.length; indice += 1) {
            afirmarArbol(valores[indice] - valores[indice - 1] >= 78, "Los nodos de un mismo nivel no deben superponerse");
          }
        });
        datos.nodos.forEach(nodo => nodo.ramas.forEach(rama => {
          afirmarArbol(distribucion.posiciones[rama.destino].x > distribucion.posiciones[nodo.id].x, "Cada sucesor debe ubicarse a la derecha");
        }));
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
