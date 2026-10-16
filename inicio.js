"use strict";

const cabecera = document.getElementById("cabecera");
function actualizarCabecera() {
  cabecera.classList.toggle("desplazada", window.scrollY > 24);
}

window.addEventListener("scroll", actualizarCabecera, { passive: true });
actualizarCabecera();

const elementosRevelables = document.querySelectorAll(".revelar");
if ("IntersectionObserver" in window) {
  const observador = new IntersectionObserver(entradas => {
    entradas.forEach(entrada => {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add("visible");
      observador.unobserve(entrada.target);
    });
  }, { threshold: .13, rootMargin: "0px 0px -35px" });
  elementosRevelables.forEach(elemento => observador.observe(elemento));
} else {
  elementosRevelables.forEach(elemento => elemento.classList.add("visible"));
}

const enlacesNavegacion = [...document.querySelectorAll(".navegacion-principal a")];
const seccionesNavegacion = enlacesNavegacion
  .map(enlace => document.querySelector(enlace.getAttribute("href")))
  .filter(Boolean);
if ("IntersectionObserver" in window) {
  const observadorSecciones = new IntersectionObserver(entradas => {
    const actual = entradas.filter(entrada => entrada.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!actual) return;
    enlacesNavegacion.forEach(enlace => enlace.classList.toggle("activo", enlace.getAttribute("href") === `#${actual.target.id}`));
  }, { rootMargin: "-25% 0px -60%", threshold: [0,.2,.5] });
  seccionesNavegacion.forEach(seccion => observadorSecciones.observe(seccion));
}

const detalles = {
  cpm: {
    categoria: "Proyectos", titulo: "Método de la ruta crítica", emblema: "CPM",
    contenido: `<p><strong>CPM</strong> corresponde a <em>Critical Path Method</em>. Utiliza una duración conocida por actividad y sus relaciones de precedencia.</p><h3>Qué permite obtener</h3><p>La duración del proyecto, los inicios y finales tempranos y tardíos, y la holgura de cada actividad. La ruta crítica conecta las actividades que no admiten retraso sin afectar el plazo del proyecto.</p><p><a href="metodos/pert-cpm/index.html">Abrir PERT–CPM →</a></p>`
  },
  pert: {
    categoria: "Proyectos", titulo: "Evaluación y revisión de programas", emblema: "PERT",
    contenido: `<p><strong>PERT</strong> corresponde a <em>Program Evaluation and Review Technique</em>. Se utiliza cuando la duración de una actividad es incierta.</p><h3>Tres estimaciones por actividad</h3><dl class="datos-concepto"><div><dt>a · Optimista</dt><dd>Duración en condiciones favorables.</dd></div><div><dt>m · Más probable</dt><dd>Duración esperada en condiciones habituales.</dd></div><div><dt>b · Pesimista</dt><dd>Duración en condiciones desfavorables.</dd></div></dl><p>El modelo combina estas estimaciones para calcular el tiempo esperado y la variabilidad de las actividades, y aproximar la probabilidad de cumplir un plazo.</p><p><a href="metodos/pert-cpm/index.html">Abrir PERT–CPM →</a></p>`
  },
  gantt: {
    categoria: "Proyectos", titulo: "Diagrama de Gantt", emblema: "↦",
    contenido: `<p>Representa cada actividad mediante una barra sobre una escala de tiempo. Su posición indica cuándo comienza y su longitud, cuánto dura.</p><p>Permite comparar actividades simultáneas y revisar el cronograma del proyecto junto con su red de precedencias.</p><p><a href="metodos/pert-cpm/index.html">Abrir PERT–CPM →</a></p>`
  },
  eoq: {
    categoria: "Inventarios", titulo: "Cantidad económica de pedido", emblema: "EOQ",
    contenido: `<p><strong>EOQ</strong> corresponde a <em>Economic Order Quantity</em>. Determina cuánto pedir para equilibrar el costo de realizar pedidos y el costo de mantener existencias.</p><h3>Cuándo utilizarlo</h3><p>Demanda constante, reposición del lote de una sola vez y sin faltantes. La demanda y el costo de mantenimiento deben expresarse para el mismo periodo.</p><p><a href="metodos/inventarios/index.html">Abrir Inventarios →</a></p>`
  },
  epq: {
    categoria: "Inventarios", titulo: "Cantidad económica de producción", emblema: "EPQ",
    contenido: `<p><strong>EPQ</strong> corresponde a <em>Economic Production Quantity</em>. Calcula el tamaño del lote cuando el inventario se repone gradualmente mientras se consume.</p><h3>Condición del modelo</h3><p>La tasa de producción debe superar a la demanda. A diferencia de EOQ, no todo el lote se encuentra almacenado al mismo tiempo.</p><p><a href="metodos/inventarios/index.html">Abrir Inventarios →</a></p>`
  },
  faltantes: {
    categoria: "Inventarios", titulo: "Faltantes planificados", emblema: "Q",
    contenido: `<p>Permite que una parte de la demanda quede pendiente y sea atendida al recibir el siguiente lote. No supone que esa demanda se pierda.</p><p>Además de ordenar y almacenar, considera el costo de mantener pedidos pendientes. El resultado determina el lote y el nivel de faltantes que minimizan esos costos.</p><p><a href="metodos/inventarios/index.html">Abrir Inventarios →</a></p>`
  },
  vme: {
    categoria: "Decisiones", titulo: "Valor monetario esperado", emblema: "VME",
    contenido: `<p><strong>VME</strong>, o <strong>EMV</strong> en inglés (<em>Expected Monetary Value</em>), pondera los resultados económicos por la probabilidad de cada escenario.</p><div class="ejemplo-concepto"><h3>Ejemplo</h3><p>Una alternativa paga 1 000 con probabilidad 0,60 y −200 con probabilidad 0,40.</p><strong>VME = (0,60 × 1 000) + (0,40 × −200) = 520</strong></div><p>No es un pago garantizado. Para ganancias se elige el mayor VME; para costos, el menor.</p><p><a href="metodos/teoria-decisiones/index.html">Abrir Tablas →</a> · <a href="metodos/teoria-decisiones/index.html#arboles">Abrir Árboles →</a></p>`
  },
  evpi: {
    categoria: "Decisiones", titulo: "Valor esperado de la información perfecta", emblema: "EVPI",
    contenido: `<p><strong>EVPI</strong> corresponde a <em>Expected Value of Perfect Information</em>. También se denomina <strong>VEIP</strong> en español.</p><p>Indica cuánto podría mejorar, en promedio, la decisión si se conociera con certeza qué escenario ocurrirá. Es un límite superior para lo que convendría pagar por información perfecta.</p><div class="ejemplo-concepto"><h3>Ejemplo con ganancias</h3><p>Si el valor esperado con información perfecta es 800 y la mejor alternativa sin ella tiene VME de 650:</p><strong>EVPI = 800 − 650 = 150</strong></div><p><a href="metodos/teoria-decisiones/index.html">Abrir Tablas →</a></p>`
  },
  inicio: {
    categoria: "Guía de uso", titulo: "Cómo empezar",
    contenido: `<ol><li><strong>Abra un método.</strong> Elija PERT–CPM, Inventarios, Tablas o Árboles de decisión.</li><li><strong>Cargue un ejercicio.</strong> Use el selector de ejemplos del módulo o introduzca sus propios datos. Las unidades de tiempo y los periodos deben coincidir.</li><li><strong>Revise la solución.</strong> En PERT–CPM pulse <em>Calcular proyecto</em>; en los demás módulos los resultados se actualizan al editar.</li><li><strong>Consulte el desarrollo.</strong> Allí encontrará las sustituciones numéricas. El botón de teoría de cada módulo reúne los conceptos y las fórmulas.</li></ol><p><a href="https://docs.google.com/document/d/1jav5G6S2AViDCU3NsVquI1vtXrxpPvtDxwxEemQFk6U/edit?tab=t.0" target="_blank" rel="noopener">Abrir manual de usuario ↗</a></p>`
  },
  modelos: {
    categoria: "Métodos", titulo: "Qué modelo utilizar",
    contenido: `<div class="modelo-detalle"><h3>PERT–CPM</h3><p>Para actividades con precedencias. Use <strong>CPM</strong> si conoce una duración por actividad; use <strong>PERT</strong> si dispone de estimaciones optimista, probable y pesimista.</p><a href="metodos/pert-cpm/index.html">Abrir PERT–CPM →</a></div><div class="modelo-detalle"><h3>Inventarios</h3><p><strong>EOQ:</strong> pedidos con reposición inmediata. <strong>EPQ:</strong> producción que repone gradualmente el inventario. <strong>Faltantes:</strong> pedidos pendientes con un costo por escasez.</p><a href="metodos/inventarios/index.html">Abrir Inventarios →</a></div><div class="modelo-detalle"><h3>Decisiones</h3><p>Use una <strong>tabla</strong> para comparar alternativas frente a los mismos estados. Use un <strong>árbol</strong> para representar decisiones y sucesos en varias etapas.</p><p><a href="metodos/teoria-decisiones/index.html">Tablas →</a> · <a href="metodos/teoria-decisiones/index.html#arboles">Árboles →</a></p></div>`
  },
  proyecto: {
    categoria: "Proyecto", titulo: "Investigación Operativa II",
    contenido: `<p>Trabajo de aplicación del curso de Investigación Operativa II de la Escuela Profesional de Ingeniería en Informática y Sistemas de la UNJBG.</p><h3>Contenido</h3><ul><li>Proyectos: CPM y PERT, red de actividades y cronograma.</li><li>Inventarios: EOQ, EPQ y faltantes planificados.</li><li>Decisiones: tablas de pago y árboles con valor monetario esperado.</li></ul><h3>Comparación de resultados</h3><p>Los casos precargados permiten resolver un mismo ejercicio manualmente, en esta aplicación y en POM-QM. Para comparar, mantenga iguales los datos, las unidades y el criterio de redondeo.</p><h3>Curso</h3><p>Docente: MSc. Manuel Yuri Apaza Valencia<br>Tacna · 2026</p>`
  },
  casos: {
    categoria: "Recursos", titulo: "Comparación con POM-QM",
    contenido: `<p>Abra el ejemplo desde el selector del módulo y utilice los mismos datos en POM-QM.</p><div class="modelo-detalle"><h3>PERT–CPM</h3><p>En POM-QM: <strong>Project Management (PERT/CPM)</strong>. Elija <em>Single time estimate</em> para CPM o <em>Triple time estimate</em> para PERT. Compare duración, tiempos y holguras.</p></div><div class="modelo-detalle"><h3>Inventarios</h3><p>En <strong>Inventory</strong>, seleccione <em>Economic Order Quantity</em>, <em>Production Order Quantity</em> o <em>Back Order Inventory</em>. Compruebe que demanda, producción y mantenimiento correspondan al mismo periodo.</p></div><div class="modelo-detalle"><h3>Decisiones</h3><p>En <strong>Decision Analysis</strong>, use <em>Decision Tables</em> o <em>Decision Trees</em>. Mantenga el mismo objetivo: maximizar ganancias o minimizar costos.</p></div><p class="nota-caso">El sistema calcula con precisión completa y redondea al mostrar. Redondear valores intermedios manualmente puede producir diferencias de centésimas.</p><p><a href="docs/casos-contraste-pom-qm.md" target="_blank" rel="noopener">Consultar datos y resultados de los casos ↗</a></p>`
  },
  html: { categoria: "Tecnologías", titulo: "HTML5", contenido: `<p>Organiza los formularios, tablas y secciones de cada modelo. Los menús y las ventanas de información usan controles accesibles desde el teclado.</p>` },
  css: { categoria: "Tecnologías", titulo: "CSS3", contenido: `<p>Define los colores, tipografías, distribución y animaciones. Los módulos ajustan su presentación al ancho de la pantalla y respetan la preferencia de movimiento reducido del dispositivo.</p>` },
  js: { categoria: "Tecnologías", titulo: "JavaScript", contenido: `<p>Realiza los cálculos de los modelos, valida los datos y actualiza gráficos y resultados en el navegador.</p><h3>Guardado de datos</h3><p>Los módulos emplean el almacenamiento local del navegador. Los datos se conservan en ese navegador y dispositivo; no se sincronizan con una cuenta.</p>` },
  svg: { categoria: "Tecnologías", titulo: "SVG", contenido: `<p>Dibuja redes, árboles y gráficos como elementos vectoriales. Permite ampliar los diagramas, seleccionar nodos y resaltar las ramas sin perder nitidez.</p>` },
  mathjax: { categoria: "Tecnologías", titulo: "MathJax", contenido: `<p>Presenta las fórmulas matemáticas del desarrollo y la teoría, incluidas fracciones, raíces y sumatorias, a partir de notación LaTeX.</p>` },
  github: { categoria: "Tecnologías", titulo: "GitHub", contenido: `<p>El repositorio público contiene el código fuente y el historial de cambios del proyecto.</p><p><a href="https://github.com/Juniorcoderw/Proyecto_Investigacion_Operativa_2" target="_blank" rel="noopener">Abrir repositorio ↗</a></p>` },
  vercel: { categoria: "Tecnologías", titulo: "Vercel", contenido: `<p>Aloja la versión publicada de la aplicación. Puede abrirse desde el navegador sin instalar el programa.</p><p><a href="https://io2modelos.vercel.app/" target="_blank" rel="noopener">Abrir sitio publicado ↗</a></p>` }
};
const dialogo = document.getElementById("detalle-flotante");
document.querySelectorAll("[data-detalle]").forEach(boton => {
  boton.addEventListener("click", () => {
    const detalle = detalles[boton.dataset.detalle];
    if (!detalle) return;
    document.getElementById("categoria-detalle").textContent = detalle.categoria;
    document.getElementById("titulo-detalle").textContent = detalle.titulo;
    document.getElementById("contenido-detalle").innerHTML = detalle.contenido;
    const emblema = document.getElementById("emblema-detalle");
    const logo = boton.querySelector("svg, .logo-math");
    emblema.replaceChildren();
    if (logo) emblema.append(logo.cloneNode(true));
    else emblema.textContent = detalle.emblema || ({ inicio: "01", modelos: "↗", proyecto: "II", casos: "≍" }[boton.dataset.detalle] || detalle.titulo.slice(0, 2));
    dialogo.dataset.categoria = detalle.categoria;
    dialogo.showModal();
    document.getElementById("contenido-detalle").scrollTop = 0;
    document.body.classList.add("dialogo-abierto");
  });
});
document.getElementById("cerrar-detalle").addEventListener("click", () => dialogo.close());
dialogo.addEventListener("click", evento => {
  const rect = dialogo.getBoundingClientRect();
  if (evento.target === dialogo && (evento.clientX < rect.left || evento.clientX > rect.right || evento.clientY < rect.top || evento.clientY > rect.bottom)) dialogo.close();
});
dialogo.addEventListener("close", () => document.body.classList.remove("dialogo-abierto"));

const preferenciaMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)");

const canvas = document.getElementById("campo-red");
const portada = document.getElementById("inicio");
const contexto = canvas.getContext("2d");
let reducirMovimiento = preferenciaMovimiento.matches;
let portadaVisible = true;
let cuadroRed = null;
let ultimoTiempoRed = 0;
let ancho = 0;
let alto = 0;
let proporcion = 1;
let nodos = [];
let enlaces = [];
let pulsos = [];
let puntero = { x: .72, y: .42 };

function crearRed() {
  const rect = portada.getBoundingClientRect();
  ancho = Math.max(320, rect.width);
  alto = Math.max(560, rect.height);
  proporcion = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(ancho * proporcion);
  canvas.height = Math.round(alto * proporcion);
  contexto.setTransform(proporcion, 0, 0, proporcion, 0, 0);

  const cantidad = ancho < 760 ? 18 : 34;
  nodos = Array.from({ length: cantidad }, (_, indice) => ({
    x: ancho * (.39 + Math.random() * .67),
    y: alto * (.06 + Math.random() * .88),
    vx: (Math.random() - .5) * .085,
    vy: (Math.random() - .5) * .085,
    radio: indice % 7 === 0 ? 3.5 : 2 + Math.random() * 1.6
  }));
  construirEnlaces();
  pulsos = Array.from({ length: Math.min(12, enlaces.length) }, (_, indice) => ({
    enlace: enlaces[(indice * 3) % enlaces.length],
    avance: Math.random(),
    velocidad: .0014 + Math.random() * .0018,
    dorado: indice % 3 !== 0
  }));
}

function construirEnlaces() {
  enlaces = [];
  nodos.forEach((nodo, indice) => {
    const cercanos = nodos
      .map((otro, otroIndice) => ({ otroIndice, distancia: Math.hypot(nodo.x - otro.x, nodo.y - otro.y) }))
      .filter(item => item.otroIndice !== indice)
      .sort((a,b) => a.distancia - b.distancia)
      .slice(0, 2);
    cercanos.forEach(item => {
      const clave = [indice, item.otroIndice].sort((a,b) => a-b).join("-");
      if (!enlaces.some(enlace => enlace.clave === clave)) enlaces.push({ a: indice, b: item.otroIndice, clave });
    });
  });
}

function dibujarRed(tiempo = 0) {
  cuadroRed = null;
  const intervalo = Math.min(32, ultimoTiempoRed && tiempo ? tiempo - ultimoTiempoRed : 16);
  ultimoTiempoRed = tiempo;
  contexto.clearRect(0, 0, ancho, alto);
  const desplazamientoX = (puntero.x - .5) * 16;
  const desplazamientoY = (puntero.y - .5) * 12;

  if (!reducirMovimiento) {
    nodos.forEach(nodo => {
      nodo.x += nodo.vx * intervalo / 16;
      nodo.y += nodo.vy * intervalo / 16;
      if (nodo.x < ancho * .34 || nodo.x > ancho * 1.05) nodo.vx *= -1;
      if (nodo.y < 25 || nodo.y > alto - 25) nodo.vy *= -1;
    });
  }

  contexto.lineWidth = 1;
  enlaces.forEach((enlace, indice) => {
    const a = nodos[enlace.a];
    const b = nodos[enlace.b];
    const gradiente = contexto.createLinearGradient(a.x, a.y, b.x, b.y);
    gradiente.addColorStop(0, indice % 4 === 0 ? "rgba(229,185,79,.20)" : "rgba(99,154,211,.11)");
    gradiente.addColorStop(1, "rgba(123,162,202,.04)");
    contexto.strokeStyle = gradiente;
    contexto.beginPath();
    contexto.moveTo(a.x + desplazamientoX, a.y + desplazamientoY);
    contexto.lineTo(b.x + desplazamientoX, b.y + desplazamientoY);
    contexto.stroke();
  });

  nodos.forEach((nodo, indice) => {
    const x = nodo.x + desplazamientoX;
    const y = nodo.y + desplazamientoY;
    contexto.beginPath();
    contexto.arc(x, y, nodo.radio, 0, Math.PI * 2);
    contexto.fillStyle = indice % 7 === 0 ? "rgba(244,207,105,.78)" : "rgba(112,167,219,.45)";
    contexto.shadowBlur = indice % 7 === 0 ? 17 : 8;
    contexto.shadowColor = indice % 7 === 0 ? "#e5b94f" : "#4d92cf";
    contexto.fill();
  });

  pulsos.forEach(pulso => {
    if (!reducirMovimiento) pulso.avance = (pulso.avance + pulso.velocidad * intervalo) % 1;
    const enlace = pulso.enlace;
    const a = nodos[enlace.a];
    const b = nodos[enlace.b];
    const x = a.x + (b.x - a.x) * pulso.avance + desplazamientoX;
    const y = a.y + (b.y - a.y) * pulso.avance + desplazamientoY;
    contexto.beginPath();
    contexto.arc(x, y, pulso.dorado ? 2.4 : 1.9, 0, Math.PI * 2);
    contexto.fillStyle = pulso.dorado ? "#ffe18a" : "#65c3ac";
    contexto.shadowBlur = 19;
    contexto.shadowColor = contexto.fillStyle;
    contexto.fill();
  });
  contexto.shadowBlur = 0;
  if (!reducirMovimiento && portadaVisible && !document.hidden) cuadroRed = requestAnimationFrame(dibujarRed);
}

function reanudarRed() {
  if (cuadroRed !== null) cancelAnimationFrame(cuadroRed);
  cuadroRed = null;
  ultimoTiempoRed = 0;
  if (portadaVisible && !document.hidden) dibujarRed();
}
if ("IntersectionObserver" in window) {
  new IntersectionObserver(entradas => {
    portadaVisible = entradas[0].isIntersecting;
    reanudarRed();
  }).observe(portada);
}
document.addEventListener("visibilitychange", reanudarRed);
preferenciaMovimiento.addEventListener("change", evento => {
  reducirMovimiento = evento.matches;
  reanudarRed();
});

portada.addEventListener("pointermove", evento => {
  const rect = portada.getBoundingClientRect();
  puntero.x = (evento.clientX - rect.left) / rect.width;
  puntero.y = (evento.clientY - rect.top) / rect.height;
});
portada.addEventListener("pointerleave", () => { puntero = { x: .72, y: .42 }; });

let temporizadorRedimension = null;
window.addEventListener("resize", () => {
  window.clearTimeout(temporizadorRedimension);
  temporizadorRedimension = window.setTimeout(() => { crearRed(); if (reducirMovimiento) dibujarRed(); }, 150);
});

crearRed();
dibujarRed();
