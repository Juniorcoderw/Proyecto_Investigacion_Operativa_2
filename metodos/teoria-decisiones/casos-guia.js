/* Datos transcritos de GUÍA PRÁCTICA, ejercicios 1–3. Importes en soles. */
(() => {
  const casos = {
    'guia-producto': {
      problema: 'Lanzamiento de un nuevo producto', tipoMatriz: 'beneficios', alfa: .60,
      fuente: 'Práctica 07 · Ejercicio 1 · p. 3 · S/',
      enunciado: 'Una empresa evalúa lanzar un producto pequeño, mediano o grande. La demanda puede ser alta (30 %), media (45 %) o baja (25 %). Compare los beneficios y seleccione la alternativa de mayor valor esperado.',
      estados: ['Demanda alta', 'Demanda media', 'Demanda baja'], probabilidades: [.30, .45, .25],
      alternativas: [
        {nombre: 'Producto pequeño', valores: [40000, 25000, 10000]},
        {nombre: 'Producto mediano', valores: [70000, 35000, -10000]},
        {nombre: 'Producto grande', valores: [120000, 45000, -50000]}
      ]
    },
    'guia-ampliacion': {
      problema: 'Ampliación de una empresa', tipoMatriz: 'beneficios', alfa: .60,
      fuente: 'Práctica 07 · Ejercicio 2 · p. 4 · S/',
      enunciado: 'Una empresa debe decidir si mantiene su capacidad o realiza una ampliación pequeña o grande. Las probabilidades de demanda alta, normal y baja son 40 %, 35 % y 25 %. Compare los beneficios de las tres alternativas.',
      estados: ['Demanda alta', 'Demanda normal', 'Demanda baja'], probabilidades: [.40, .35, .25],
      alternativas: [
        {nombre: 'No ampliar', valores: [80000, 60000, 40000]},
        {nombre: 'Ampliación pequeña', valores: [130000, 75000, 20000]},
        {nombre: 'Ampliación grande', valores: [200000, 90000, -30000]}
      ]
    },
    'guia-proveedores': {
      problema: 'Contratación de proveedores', tipoMatriz: 'costos', alfa: .60,
      fuente: 'Práctica 07 · Ejercicio 3 · p. 5 · Costos en S/',
      enunciado: 'Se comparan tres proveedores según los costos de contratación en un mercado favorable (50 %), normal (30 %) o desfavorable (20 %). El objetivo es minimizar el costo esperado, no maximizar los valores de la tabla.',
      estados: ['Mercado favorable', 'Mercado normal', 'Mercado desfavorable'], probabilidades: [.50, .30, .20],
      alternativas: [
        {nombre: 'Proveedor A', valores: [45000, 55000, 70000]},
        {nombre: 'Proveedor B', valores: [40000, 60000, 85000]},
        {nombre: 'Proveedor C', valores: [50000, 52000, 65000]}
      ]
    }
  };
  window.CASOS_GUIA_DECISION = casos;
  // Cada carga crea nodos y ramas independientes, sin compartir referencias con la matriz.
  window.crearArbolDesdeMatriz = (caso, clave) => {
    let contador = 1;
    const nuevo = () => `n${++contador}`;
    const raiz = {id: 'n1', tipo: 'decision', nombre: caso.tipoMatriz === 'costos' ? 'Elegir proveedor' : 'Elegir alternativa', ramas: []};
    const nodos = [raiz];
    caso.alternativas.forEach(alternativa => {
      const nodo = {id: nuevo(), tipo: 'azar', nombre: alternativa.nombre, ramas: []};
      raiz.ramas.push({nombre: alternativa.nombre, valor: 0, probabilidad: null, destino: nodo.id});
      nodos.push(nodo);
      caso.estados.forEach((estado, i) => {
        const terminal = {id: nuevo(), tipo: 'terminal', nombre: estado, ramas: []};
        nodo.ramas.push({nombre: estado, valor: alternativa.valores[i], probabilidad: caso.probabilidades[i], destino: terminal.id});
        nodos.push(terminal);
      });
    });
    return {problema: caso.problema, objetivo: caso.tipoMatriz === 'costos' ? 'minimizar' : 'maximizar', raiz: raiz.id, nodos, caso: clave};
  };
  window.agregarCasosGuia = selector => {
    const grupo = document.createElement('optgroup');
    grupo.label = 'Práctica 07 · Casos completos';
    Object.entries(casos).forEach(([clave, caso], i) => grupo.append(new Option(`${i + 1} · ${caso.problema}`, clave)));
    selector.prepend(grupo);
  };
  window.mostrarEnunciadoGuia = (id, clave) => {
    const detalles = document.getElementById(id);
    if (!detalles) return;
    const caso = casos[clave];
    detalles.hidden = !caso;
    if (caso) { detalles.querySelector('summary').textContent = caso.fuente; detalles.querySelector('p').textContent = caso.enunciado; }
  };
})();
