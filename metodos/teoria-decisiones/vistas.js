/* Dos vistas del mismo módulo; alternar no reconstruye ni borra los editores. */
(() => {
  const botones = [...document.querySelectorAll('[data-vista]')];
  const imprimirTabla = document.getElementById('imprimir');
  const desarrolloArbol = document.querySelector('.detalle-desarrollo');
  let desarrolloAbiertoAntesDeImprimir = false;
  function activar() {
    const vista = location.hash === '#arboles' ? 'arboles' : 'tablas';
    botones.forEach(boton => {
      const activo = boton.dataset.vista === vista;
      boton.setAttribute('aria-selected', String(activo));
      boton.tabIndex = activo ? 0 : -1;
      document.getElementById(`vista-${boton.dataset.vista}`).hidden = !activo;
    });
    document.getElementById('teoria-flotante').hidden = vista !== 'tablas';
    document.getElementById('teoria-arbol').hidden = vista !== 'arboles';
    document.getElementById('descripcion-vista').textContent = vista === 'tablas'
      ? 'Compare alternativas y estados en una matriz de pagos.'
      : 'Construya decisiones y eventos sucesivos. Copie ramas para reutilizar su estructura.';
    if (vista === 'arboles') requestAnimationFrame(ajustarZoom);
    document.title = `${vista === 'arboles' ? 'Árboles' : 'Tablas'} · Teoría de decisiones | IO II`;
  }
  botones.forEach(boton => {
    boton.addEventListener('click', () => { location.hash = boton.dataset.vista; });
    boton.addEventListener('keydown', evento => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(evento.key)) return;
      evento.preventDefault();
      const siguiente = evento.key === 'Home' ? botones[0] : evento.key === 'End' ? botones.at(-1) : botones.find(b => b !== boton);
      siguiente.click(); siguiente.focus();
    });
  });
  // Mantener las pestañas del análisis accesibles con teclado.
  document.querySelectorAll('.pestana').forEach(boton => boton.addEventListener('keydown', evento => {
    const pestanas = [...document.querySelectorAll('.pestana')];
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(evento.key)) return;
    evento.preventDefault();
    const indice = pestanas.indexOf(boton);
    const destino = evento.key === 'Home' ? 0 : evento.key === 'End' ? pestanas.length - 1 : (indice + (evento.key === 'ArrowRight' ? 1 : -1) + pestanas.length) % pestanas.length;
    pestanas[destino].click(); pestanas[destino].focus();
  }));
  window.addEventListener('hashchange', activar);
  window.addEventListener('resize', () => { if (!document.getElementById('vista-arboles').hidden) ajustarZoom(); });
  window.addEventListener('beforeprint', () => {
    if (document.getElementById('vista-tablas').hidden) imprimirTabla.disabled = true;
    desarrolloAbiertoAntesDeImprimir = desarrolloArbol.open;
    desarrolloArbol.open = true;
  });
  window.addEventListener('afterprint', () => {
    imprimirTabla.disabled = !ultimoResultado;
    desarrolloArbol.open = desarrolloAbiertoAntesDeImprimir;
  });
  activar();
})();
