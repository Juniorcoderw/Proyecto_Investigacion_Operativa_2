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
