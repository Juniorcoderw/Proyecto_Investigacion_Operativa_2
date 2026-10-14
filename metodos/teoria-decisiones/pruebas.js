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
      nombre: "valor esperado del caso de expansión",
      ejecutar() {
        const resultado = calculadora.calcularDecision(base);
        casi(resultado.valoresEsperados[0], 76, "VE de planta grande");
        casi(resultado.valoresEsperados[1], 83, "VE de planta mediana");
        casi(resultado.valoresEsperados[2], 40, "VE de no ampliar");
        afirmar(resultado.criterioEsperado.indice === 1, "Debe elegir planta mediana");
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
      nombre: "caso de selección de proveedor",
      ejecutar() {
        const datos = {
          ...base,
          tipoMatriz: "costos",
          estados: [{ nombre: "Alta exigencia" }, { nombre: "Normal" }, { nombre: "Baja" }],
          alternativas: [
            { nombre: "Proveedor A", valores: [175, 120, 95] },
            { nombre: "Proveedor B", valores: [155, 123, 108] },
            { nombre: "Producción interna", valores: [210, 115, 80] }
          ],
          probabilidades: [.25, .5, .25]
        };
        const resultado = calculadora.calcularDecision(datos);
        casi(resultado.valoresEsperados[0], 127.5, "Costo esperado de A");
        casi(resultado.valoresEsperados[1], 127.25, "Costo esperado de B");
        casi(resultado.valoresEsperados[2], 130, "Costo esperado de producción interna");
        afirmar(resultado.criterioEsperado.indice === 1, "Debe elegir proveedor B");
        casi(resultado.valorInformacionPerfecta, 116.25, "Costo con información perfecta");
        casi(resultado.evpi, 11, "EVPI del caso de proveedor");
      }
    },
    {
      nombre: "caso de lanzamiento comercial",
      ejecutar() {
        const datos = {
          ...base,
          estados: [{ nombre: "Muy favorable" }, { nombre: "Favorable" }, { nombre: "Estable" }, { nombre: "Adverso" }],
          alternativas: [
            { nombre: "Nacional", valores: [260, 150, 55, -110] },
            { nombre: "Regional", valores: [170, 115, 70, -25] },
            { nombre: "Piloto", valores: [90, 80, 60, 25] }
          ],
          probabilidades: [.15, .35, .3, .2]
        };
        const resultado = calculadora.calcularDecision(datos);
        casi(resultado.valoresEsperados[0], 86, "VE de lanzamiento nacional");
        casi(resultado.valoresEsperados[1], 81.75, "VE de lanzamiento regional");
        casi(resultado.valoresEsperados[2], 64.5, "VE del piloto");
        afirmar(resultado.criterioEsperado.indice === 0, "Debe elegir lanzamiento nacional");
        casi(resultado.valorInformacionPerfecta, 117.5, "VE con información perfecta");
        casi(resultado.evpi, 31.5, "EVPI del lanzamiento");
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
