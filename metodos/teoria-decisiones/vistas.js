/* Un caso de trabajo, dos representaciones. No se reducen árboles secuenciales. */
function matrizDesdeArbol(datos) {
  const raiz = buscarNodo(datos.raiz, datos);
  if (raiz?.tipo !== 'decision' || raiz.ramas.length < 2) return null;
  const base = raiz.ramas.map(r => buscarNodo(r.destino, datos)).find(n => n?.tipo === 'azar');
  if (!base || base.ramas.length < 2) return null;
  const pesos = normalizarProbabilidadesNodo(base.ramas.map(r => r.probabilidad));
  if (!pesos) return null;
  const nombres = base.ramas.map(r => r.nombre);
  const filas = [];
  for (const opcion of raiz.ramas) {
    const nodo = buscarNodo(opcion.destino, datos), inmediato = numeroArbol(opcion.valor);
    if (!Number.isFinite(inmediato)) return null;
    if (nodo?.tipo === 'terminal') { filas.push({nombre: opcion.nombre, valores: nombres.map(() => inmediato)}); continue; }
    if (nodo?.tipo !== 'azar' || nodo.ramas.length !== nombres.length) return null;
    const p = normalizarProbabilidadesNodo(nodo.ramas.map(r => r.probabilidad));
    if (!p || nodo.ramas.some((r, i) => r.nombre !== nombres[i] || Math.abs(p[i] - pesos[i]) > 1e-9 || buscarNodo(r.destino, datos)?.tipo !== 'terminal')) return null;
    const valores = nodo.ramas.map(r => inmediato + numeroArbol(r.valor));
    if (valores.some(v => !Number.isFinite(v))) return null;
    filas.push({nombre: opcion.nombre, valores});
  }
  return {problema: datos.problema, tipoMatriz: datos.objetivo === 'minimizar' ? 'costos' : 'beneficios', alfa: numero(elementos.alfa.value), estados: nombres.map(nombre => ({nombre})), alternativas: filas, probabilidades: pesos};
}

(() => {
  const botones = [...document.querySelectorAll('[data-vista]')];
  const tabla = document.getElementById('vista-tablas'), vistaArbol = document.getElementById('vista-arboles');
  let origen = location.hash === '#arboles' ? 'arbol' : 'tabla';
  if (window.frameElement?.id !== 'aplicacion-pruebas') {
    try { const guardado = localStorage.getItem('decision-origen-compartido'); if (['tabla', 'arbol'].includes(guardado)) origen = guardado; } catch { /* Sin almacenamiento. */ }
  }
  const primeraVista = location.hash === '#arboles' ? 'arboles' : 'tablas';
  let vistaActual = 'tablas';
  function marcarOrigen(valor) {
    origen = valor;
    if (window.frameElement?.id !== 'aplicacion-pruebas') try { localStorage.setItem('decision-origen-compartido', valor); } catch { /* Sin almacenamiento. */ }
  }
  const crear = (tag, clase, texto) => { const e = document.createElement(tag); if (clase) e.className = clase; if (texto) e.textContent = texto; return e; };
  const plegable = (titulo, ...contenido) => { const d = crear('details', 'consulta-decision'); d.append(crear('summary', '', titulo), ...contenido); return d; };

  // Reubicar los nodos conserva sus listeners, valores y etiquetas accesibles.
  const comun = crear('section', 'panel caso-compartido');
  comun.setAttribute('aria-label', 'Caso de decisión compartido');
  const cabecera = crear('div', 'cabecera-caso');
  cabecera.append(crear('h2', '', 'Caso de trabajo'));
  const formulario = elementos.formulario;
  const alfa = elementos.alfa.closest('label');
  const calcular = formulario.querySelector('[type=submit]'); calcular.textContent = 'Calcular';
  const fila = crear('div', 'datos-compartidos');
  fila.append(formulario.querySelector('.selector-caso'), elementos.tipoMatriz.closest('label'), calcular);
  const opciones = plegable('Opciones', elementos.problema.closest('label'), formulario.querySelector('.acciones-formulario'), document.getElementById('imprimir'), document.getElementById('teoria-flotante'), document.getElementById('teoria-arbol'));
  const enunciado = document.getElementById('caso-tabla');
  const estadoProb = elementos.sumaProbabilidades.closest('.estado-probabilidades');
  const indicador = crear('p', 'estado-caso'); indicador.id = 'estado-caso-compartido';
  indicador.setAttribute('role', 'status'); indicador.setAttribute('aria-live', 'polite');
  formulario.replaceChildren(fila, enunciado, elementos.mensaje, indicador, opciones);
  comun.append(cabecera, formulario); document.getElementById('contenido-decisiones').prepend(comun);
  tabla.querySelector('aside').remove();
  document.querySelector('.panel-matriz').append(estadoProb);
  document.querySelector('.panel-matriz .encabezado-panel').append(plegable('Editar tabla', document.querySelector('.acciones-tabla')));
  document.getElementById('titulo-matriz').textContent = 'Tabla de decisión';
  document.getElementById('titulo-resultado').closest('.encabezado-resultados').hidden = true;
  document.querySelector('.resumen-decision').lastElementChild.remove();
  document.querySelector('.navegacion-pestanas').remove();
  document.querySelector('.coincidencia-criterios').hidden = true;
  const informacion = crear('p', 'informacion-perfecta');
  informacion.append('Valor de la información perfecta: ', elementos.evpi, '. Máximo valor de conocer el estado antes de decidir.');
  const complementos = crear('div', 'consultas-decision');
  complementos.append(plegable('Otros criterios de decisión', alfa, elementos.tarjetasCriterios), plegable('Información perfecta', informacion));
  for (const [id, titulo] of [['panel-arrepentimiento', 'Matriz de arrepentimiento'], ['panel-desarrollo', 'Desarrollo del cálculo']]) {
    const panel = document.getElementById(id); panel.hidden = false; panel.classList.remove('panel-pestana');
    complementos.append(plegable(titulo, panel));
  }
  document.getElementById('salida').append(complementos);
  elementos.graficoValores.dataset.herramientas = 'plegadas';
  const editor = document.querySelector('.editor-arbol');
  const editarArbol = plegable('Editar árbol · estructura y ramas', editor); editarArbol.id = 'editar-arbol';
  vistaArbol.querySelector('.area-analisis').append(editarArbol);
  vistaArbol.querySelector('.area-analisis').insertBefore(document.querySelector('.detalle-desarrollo'), editarArbol);
  document.getElementById('formulario-arbol').hidden = true;
  document.getElementById('resolver-arbol').hidden = true;
  document.getElementById('imprimir-arbol').hidden = true;
  const herramientas = plegable('Reutilizar ramas', elementosArbol.herramientasRamas);
  elementosArbol.listaRamas.before(herramientas);
  herramientas.addEventListener('toggle', () => editor.classList.toggle('mostrar-copias', herramientas.open));
  elementosArbol.lienzo.addEventListener('click', e => { if (e.target.closest('[data-nodo]')) editarArbol.open = true; });
  elementosArbol.lienzo.addEventListener('keydown', e => { if (['Enter', ' '].includes(e.key) && e.target.matches('[data-nodo]')) editarArbol.open = true; });
  elementos.caso.append(new Option('Árbol secuencial · Vacaciones', 'vacaciones'));

  const aviso = (texto = '') => { indicador.textContent = texto; };
  function cabeceraDesdeArbol() {
    elementos.problema.value = arbol.problema;
    elementos.tipoMatriz.value = arbol.objetivo === 'minimizar' ? 'costos' : 'beneficios';
    if ([...elementos.caso.options].some(o => o.value === arbol.caso)) elementos.caso.value = arbol.caso;
    mostrarEnunciadoGuia('caso-tabla', arbol.caso);
  }
  function sincronizarTabla() {
    const datos = matrizDesdeArbol(arbol); if (!datos) return false;
    estados = datos.estados; alternativas = datos.alternativas; probabilidades = datos.probabilidades;
    elementos.problema.value = datos.problema; elementos.tipoMatriz.value = datos.tipoMatriz;
    renderizarTabla(); resolver(false); return true;
  }
  function sincronizarArbol() {
    const datos = leerDatos(); if (!validarDatos(datos, true)) return false;
    arbol = crearArbolDesdeMatriz({...datos, estados: datos.estados.map(e => e.nombre)}, elementos.caso.value);
    contadorNodos = arbol.nodos.length; cargarInterfaz(); resolverArbol(false); return true;
  }
  function activar(vista = location.hash === '#arboles' ? 'arboles' : 'tablas') {
    if (vista === 'arboles' && origen === 'tabla' && !sincronizarArbol()) {
      aviso('Complete la tabla y revise las probabilidades antes de abrir el árbol.'); history.replaceState(null, '', '#tablas'); return;
    }
    if (vista === 'tablas' && origen === 'arbol' && !sincronizarTabla()) {
      aviso('Este árbol no corresponde a una tabla simple: puede contener decisiones sucesivas, estados o probabilidades diferentes. Se conserva completo en Árbol.'); history.replaceState(null, '', '#arboles'); return;
    }
    vistaActual = vista;
    botones.forEach(b => { const activo = b.dataset.vista === vista; b.setAttribute('aria-selected', String(activo)); b.tabIndex = activo ? 0 : -1; document.getElementById(`vista-${b.dataset.vista}`).hidden = !activo; });
    document.getElementById('teoria-flotante').hidden = vista !== 'tablas';
    document.getElementById('teoria-arbol').hidden = vista !== 'arboles';
    document.getElementById('descripcion-vista').textContent = 'Cargue el caso una vez. Edite los datos y consulte la tabla o el árbol.';
    if (vista === 'arboles') requestAnimationFrame(ajustarZoom);
    document.title = `${vista === 'arboles' ? 'Árbol' : 'Tabla'} · Teoría de decisiones | IO II`;
    aviso('');
  }
  window.cargarCasoUnificado = clave => {
    clearTimeout(temporizador); clearTimeout(temporizadorArbol);
    elementos.mensaje.textContent = '';
    if (clave === 'vacaciones') {
      arbol = crearEjemploArbol(clave); cargarInterfaz(); resolverArbol(false); marcarOrigen('arbol'); cabeceraDesdeArbol();
      history.replaceState(null, '', '#arboles'); activar('arboles'); aviso('Caso secuencial: se trabaja en Árbol. No se reduce a una tabla simple.');
    } else { cargarEjemplo(); marcarOrigen('tabla'); sincronizarArbol(); activar(vistaActual); }
    editarArbol.open = false;
  };
  tabla.addEventListener('input', () => { marcarOrigen('tabla'); aviso(''); });
  tabla.addEventListener('click', e => { if (e.target.closest('.eliminar, #agregar-alternativa, #agregar-estado')) marcarOrigen('tabla'); });
  editor.addEventListener('input', () => { marcarOrigen('arbol'); aviso(''); });
  editor.addEventListener('change', () => { marcarOrigen('arbol'); });
  editor.addEventListener('click', e => { if (e.target.closest('#agregar-rama, #eliminar-nodo, #pegar-ramas, .eliminar-rama')) marcarOrigen('arbol'); });
  elementos.alfa.addEventListener('input', () => { elementos.valorAlfa.value = Number(elementos.alfa.value).toFixed(2); programarResolucion(); });
  formulario.addEventListener('input', e => {
    if (e.target === elementos.caso) return;
    if (vistaActual === 'arboles') {
      marcarOrigen('arbol'); elementosArbol.problema.value = elementos.problema.value;
      elementosArbol.objetivo.value = elementos.tipoMatriz.value === 'costos' ? 'minimizar' : 'maximizar'; actualizarPosterior();
    } else marcarOrigen('tabla');
    aviso('');
  });
  window.calcularCasoUnificado = () => {
    clearTimeout(temporizador); clearTimeout(temporizadorArbol);
    if (vistaActual === 'arboles') { marcarOrigen('arbol'); const bien = resolverArbol(false); elementos.mensaje.textContent = bien ? '' : elementosArbol.mensaje.textContent; }
    else { marcarOrigen('tabla'); resolver(); }
  };
  document.getElementById('importar-matriz').addEventListener('click', () => { if (!elementos.dialogoPegar.open) { marcarOrigen('tabla'); history.replaceState(null, '', '#tablas'); activar('tablas'); } });
  document.getElementById('limpiar').addEventListener('click', () => { marcarOrigen('tabla'); history.replaceState(null, '', '#tablas'); activar('tablas'); });
  botones.forEach(b => {
    b.addEventListener('click', () => { if (b.dataset.vista !== vistaActual) activar(b.dataset.vista); history.replaceState(null, '', `#${vistaActual}`); });
    b.addEventListener('keydown', e => { if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return; e.preventDefault(); const siguiente = e.key === 'Home' ? botones[0] : e.key === 'End' ? botones.at(-1) : botones.find(x => x !== b); siguiente.click(); siguiente.focus(); });
  });
  window.addEventListener('hashchange', () => activar());
  document.addEventListener('decision:arbol-evaluado', () => { if (!vistaArbol.hidden) elementos.mensaje.textContent = elementosArbol.mensaje.textContent; });
  window.addEventListener('resize', () => { if (!vistaArbol.hidden) ajustarZoom(); });
  const desarrolloArbol = document.querySelector('.detalle-desarrollo'); let abiertoImprimir = false;
  window.addEventListener('beforeprint', () => { abiertoImprimir = desarrolloArbol.open; desarrolloArbol.open = true; });
  window.addEventListener('afterprint', () => { desarrolloArbol.open = abiertoImprimir; });
  if (origen === 'arbol') cabeceraDesdeArbol();
  if (origen === 'arbol' && !matrizDesdeArbol(arbol)) {
    activar('arboles'); history.replaceState(null, '', '#arboles');
    aviso('Este caso se conserva en Árbol porque no corresponde a una tabla simple.');
  } else activar(primeraVista);
  if (!vistaArbol.hidden) elementos.mensaje.textContent = elementosArbol.mensaje.textContent;
})();
