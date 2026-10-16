"use strict";

const resumen = document.getElementById("resumen-pruebas");
const lista = document.getElementById("lista-pruebas");
const aplicacion = document.getElementById("aplicacion-pruebas");

function afirmar(condicion, mensaje) {
  if (!condicion) throw new Error(mensaje);
}

function casi(valor, esperado, mensaje) {
  const tolerancia = 1e-9 * Math.max(1, Math.abs(valor), Math.abs(esperado));
  afirmar(Math.abs(valor - esperado) <= tolerancia, `${mensaje}: se obtuvo ${valor}`);
}

function registrar(nombre, error = null) {
  const elemento = document.createElement("li");
  elemento.className = error ? "prueba-fallida" : "prueba-correcta";
  elemento.innerHTML = `<strong>${error ? "No superada" : "Correcta"} · ${nombre}</strong>${error ? `<span>${error.message}</span>` : ""}`;
  lista.append(elemento);
}

aplicacion.addEventListener("load", () => {
  const calculadora = aplicacion.contentWindow;
  const base = {
    problema: "Prueba",
    tipoMatriz: "beneficios",
    alfa: .6,
    estados: [{ nombre: "Alta" }, { nombre: "Media" }, { nombre: "Baja" }],
    alternativas: [
      { nombre: "Grande", valores: [200, 80, -120] },
      { nombre: "Mediana", valores: [140, 90, -20] },
      { nombre: "No ampliar", valores: [40, 40, 40] }
    ],
    probabilidades: [.3, .5, .2]
  };
  const pruebas = [
    ...[
      ["guia-producto", 43750, 2, 15000],
      ["guia-ampliacion", 104000, 2, 17500],
      ["guia-proveedores", 53000, 0, 4400]
    ].map(([clave, esperado, indice, evpi]) => ({
      nombre: `guía práctica: ${clave} · tabla y árbol coinciden`,
      ejecutar() {
        const caso = calculadora.CASOS_GUIA_DECISION[clave];
        const resultado = calculadora.calcularDecision(caso);
        casi(resultado.criterioEsperado.valor, esperado, "Valor esperado de la tabla");
        casi(resultado.evpi, evpi, "Información perfecta");
        afirmar(resultado.criterioEsperado.indice === indice, "Alternativa incorrecta");
        const arbol = calculadora.crearArbolDesdeMatriz(caso, clave);
        casi(calculadora.calcularArbol(arbol).valor, esperado, "Valor del árbol");
        casi(arbol.nodos.filter(n => n.tipo === "azar").length, 3, "Tres alternativas completas");
      }
    })),
    {
      nombre: "un campo vacío no equivale a cero",
      ejecutar() {
        afirmar(Number.isNaN(calculadora.numero("")), "La matriz debe rechazar vacíos");
        afirmar(Number.isNaN(calculadora.numeroArbol(" ")), "El árbol debe rechazar vacíos");
        afirmar(calculadora.normalizarProbabilidades(["", 1]) === null, "No aceptar una probabilidad sin llenar");
        casi(calculadora.numero(0), 0, "Cero explícito válido");
      }
    },
    {
      nombre: "cargar una copia del ejemplo no modifica el original",
      ejecutar() {
        const caso = calculadora.CASOS_GUIA_DECISION['guia-producto'];
        const primero = calculadora.crearArbolDesdeMatriz(caso, 'guia-producto');
        const segundo = calculadora.crearArbolDesdeMatriz(caso, 'guia-producto');
        primero.nodos[1].ramas[0].valor = 1;
        casi(segundo.nodos[1].ramas[0].valor, 40000, "Carga independiente");
        casi(caso.alternativas[0].valores[0], 40000, "Fuente sin cambios");
      }
    },
    {
      nombre: "probabilidades decimales y porcentuales",
      ejecutar() {
        afirmar(Boolean(calculadora.normalizarProbabilidades([.3, .5, .2])), "Debe aceptar decimales");
        const probabilidades = calculadora.normalizarProbabilidades([30, 50, 20]);
        casi(probabilidades[1], .5, "Debe convertir porcentajes");
      }
    },
    {
      nombre: "valor esperado del ejercicio de la rifa",
      ejecutar() {
        const resultado = calculadora.calcularDecision({
          ...base,
          estados: [{ nombre: "Ganar" }, { nombre: "Perder" }],
          alternativas: [{ nombre: "Comprar", valores: [4900, -100] }, { nombre: "No comprar", valores: [0, 0] }],
          probabilidades: [.01, .99]
        });
        casi(resultado.valoresEsperados[0], -50, "VE de comprar");
        casi(resultado.valoresEsperados[1], 0, "VE de no comprar");
        afirmar(resultado.criterioEsperado.indice === 1, "Debe elegir no comprar");
      }
    },
    {
      nombre: "arrepentimiento minimax",
      ejecutar() {
        const resultado = calculadora.calcularDecision(base);
        afirmar(resultado.arrepentimientos[0].join(",") === "0,10,160", "Fila de arrepentimiento incorrecta");
        afirmar(resultado.criterios.find(criterio => criterio.id === "savage").indice === 1, "Savage debe elegir planta mediana");
      }
    },
    {
      nombre: "valor de información perfecta",
      ejecutar() {
        const resultado = calculadora.calcularDecision(base);
        casi(resultado.valorInformacionPerfecta, 113, "VE con información perfecta");
        casi(resultado.evpi, 30, "EVPI incorrecto");
      }
    },
    {
      nombre: "matriz de costos",
      ejecutar() {
        const resultado = calculadora.calcularDecision({
          ...base,
          tipoMatriz: "costos",
          alternativas: [{ nombre: "A", valores: [10, 30, 20] }, { nombre: "B", valores: [15, 18, 22] }]
        });
        afirmar(resultado.criterioEsperado.indice === 1, "Debe escoger el menor costo esperado");
        afirmar(resultado.criterios.find(criterio => criterio.id === "conservador").indice === 1, "Wald debe minimizar el mayor costo");
      }
    },
    {
      nombre: "ejercicio de inversión en acciones",
      ejecutar() {
        const datos = {
          ...base,
          estados: [{ nombre: "Mercado alcista" }, { nombre: "Mercado bajista" }],
          alternativas: [
            { nombre: "Compañía A", valores: [5000, -2000] },
            { nombre: "Compañía B", valores: [1500, 500] }
          ],
          probabilidades: [.60, .40]
        };
        const resultado = calculadora.calcularDecision(datos);
        casi(resultado.valoresEsperados[0], 2200, "VE de la compañía A");
        casi(resultado.valoresEsperados[1], 1100, "VE de la compañía B");
        afirmar(resultado.criterioEsperado.indice === 0, "Debe elegir la compañía A");
        casi(resultado.valorInformacionPerfecta, 3200, "VE con información perfecta");
        casi(resultado.evpi, 1000, "EVPI de la inversión");
      }
    }
  ];

  let correctas = 0;
  pruebas.forEach(prueba => {
    try {
      prueba.ejecutar();
      correctas += 1;
      registrar(prueba.nombre);
    } catch (error) {
      registrar(prueba.nombre, error);
    }
  });
  resumen.textContent = `${correctas} de ${pruebas.length} pruebas superadas.`;
  resumen.classList.add(correctas === pruebas.length ? "pruebas-superadas" : "pruebas-con-fallos");
  document.body.dataset.estado = correctas === pruebas.length ? "correcto" : "fallido";
}, { once: true });
