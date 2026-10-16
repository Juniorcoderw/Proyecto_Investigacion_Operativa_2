'use strict';
document.getElementById('aplicacion-pruebas').addEventListener('load', () => {
  const app = document.getElementById('aplicacion-pruebas').contentWindow, doc = app.document;
  const q = id => doc.getElementById(id);
  const afirmar = (condicion, mensaje) => { if (!condicion) throw Error(mensaje); };
  const cerca = (a,b) => Math.abs(a-b) < 1e-7;
  const editar = (entrada, valor) => { entrada.value = valor; entrada.dispatchEvent(new app.Event('input', {bubbles:true})); };
  let total = 0, correctas = 0;
  const probar = (nombre, ejecutar) => {
    total++; const li = document.createElement('li');
    try { ejecutar(); correctas++; li.textContent = 'Correcta · ' + nombre; }
    catch (error) { li.className = 'fallo'; li.textContent = 'No superada · ' + nombre + ': ' + error.message; }
    document.getElementById('lista').append(li);
  };
  probar('una carga y un cálculo visibles; editor avanzado plegado', () => {
    afirmar(q('cargar-ejemplo').getClientRects().length > 0 && !q('ejemplo-arbol').getClientRects().length, 'Se repite la carga');
    afirmar(!q('editar-arbol').open && !q('resolver-arbol').getClientRects().length, 'Se muestran controles duplicados');
  });
  for (const clave of ['guia-producto','guia-ampliacion','guia-proveedores','rifa','inversion']) probar('tabla y árbol coinciden tras una carga: ' + clave, () => {
    q('caso-decision').value = clave; app.cargarCasoUnificado(clave);
    const datos = app.leerDatos(), esperado = app.calcularDecision(datos).criterioEsperado.valor;
    q('tab-arboles').click();
    const lienzo = q('lienzo-arbol');
    afirmar(q('tab-arboles').getAttribute('aria-selected') === 'true', 'No abre el árbol');
    afirmar(lienzo.textContent.includes(app.formatear(esperado)), 'Valor del árbol diferente');
    q('tab-tablas').click();
    afirmar(q('mejor-valor').textContent === app.formatear(esperado), 'Valor de tabla diferente');
  });
  probar('editar matriz actualiza el árbol sin recargar el caso', () => {
    q('caso-decision').value = 'guia-producto'; app.cargarCasoUnificado('guia-producto');
    editar(q('cuerpo-tabla').querySelector('[data-alternativa="2"] [data-valor="2"]'), '-40000');
    q('tab-arboles').click(); afirmar(q('valor-arbol').textContent === '46,250', 'Árbol desactualizado');
  });
  probar('editar un pago del árbol conserva el cambio al volver a tabla', () => {
    app.seleccionarNodo('n10'); editar(q('lista-ramas').querySelector('[data-rama="0"] [data-campo="valor"]'), '130000');
    q('tab-tablas').click(); afirmar(app.leerDatos().alternativas[2].valores[0] === 130000, 'Se perdió el pago');
    afirmar(q('mejor-valor').textContent === '49,250', 'No se recalculó la tabla');
  });
  probar('probabilidades porcentuales se transfieren normalizadas', () => {
    [...q('pie-tabla').querySelectorAll('[data-probabilidad]')].forEach((e,i) => editar(e, [30,45,25][i]));
    q('tab-arboles').click(); afirmar(q('valor-arbol').textContent === '49,250', 'Falló el porcentaje');
  });
  probar('objetivo de costos compartido entre vistas', () => {
    editar(q('tipo-matriz'), 'costos'); q('tab-tablas').click();
    afirmar(app.leerDatos().tipoMatriz === 'costos', 'Objetivos distintos');
    afirmar(q('decision-esperada').textContent === 'Producto pequeño', 'No minimiza costos');
  });
  probar('entrada incompleta impide abrir un árbol con datos anteriores', () => {
    editar(q('pie-tabla').querySelector('[data-probabilidad]'), ''); q('tab-arboles').click();
    afirmar(q('tab-tablas').getAttribute('aria-selected') === 'true' && q('estado-caso-compartido').textContent.length > 0, 'Dejó ver resultados desactualizados');
  });
  probar('árbol secuencial no se convierte ni pierde sus ramas', () => {
    q('caso-decision').value = 'vacaciones'; app.cargarCasoUnificado('vacaciones');
    const antes = q('lienzo-arbol').textContent; q('tab-tablas').click();
    afirmar(q('tab-arboles').getAttribute('aria-selected') === 'true', 'Redujo un árbol secuencial a tabla');
    afirmar(q('lienzo-arbol').textContent === antes && q('estado-caso-compartido').textContent.length > 0, 'Cambió las ramas o no explica la limitación');
    afirmar(q('mensaje').textContent === '', 'Quedó un error de la matriz anterior');
  });
  probar('calcular un árbol inválido muestra el aviso fuera del editor plegado', () => {
    q('caso-decision').value = 'guia-producto'; app.cargarCasoUnificado('guia-producto'); q('tab-arboles').click();
    app.seleccionarNodo('n2'); editar(q('lista-ramas').querySelector('[data-campo="probabilidad"]'), '');
    q('editar-arbol').open = false; app.calcularCasoUnificado();
    afirmar(q('resultado-arbol').hidden && q('mensaje').textContent.length > 0, 'No se muestra la validación principal');
  });
  probar('conversión conserva pagos inmediatos y rechaza probabilidades incompatibles', () => {
    const caso = app.crearArbolDesdeMatriz(app.CASOS_GUIA_DECISION['guia-producto'], 'guia-producto');
    caso.nodos[0].ramas[0].valor = 100;
    afirmar(cerca(app.matrizDesdeArbol(caso).alternativas[0].valores[0], 40100), 'Se perdió el pago inicial');
    caso.nodos[1].ramas[0].probabilidad = .5; caso.nodos[1].ramas[1].probabilidad = .25; caso.nodos[1].ramas[2].probabilidad = .25;
    afirmar(app.matrizDesdeArbol(caso) === null, 'Aceptó estados con probabilidades distintas');
  });
  document.getElementById('resumen').textContent = `${correctas} de ${total} pruebas superadas.`;
});
