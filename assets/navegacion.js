/* Navegación compartida por la portada y los tres módulos. */
(() => {
  const raiz = new URL('../', document.currentScript.src);
  const contenedor = document.querySelector('[data-menu-metodos]');
  if (!contenedor) return;
  const metodos = [
    ['pert-cpm', 'PERT–CPM', 'Proyectos, red y diagrama de Gantt'],
    ['inventarios', 'Inventarios', 'Pedidos, producción y faltantes'],
    ['teoria-decisiones', 'Decisiones', 'Tablas y árboles de decisión']
  ];
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'io-menu-boton';
  boton.setAttribute('aria-label', 'Abrir menú de métodos');
  boton.setAttribute('aria-expanded', 'false');
  boton.setAttribute('aria-controls', 'io-menu');
  boton.innerHTML = '<span aria-hidden="true">☰</span> Métodos';
  contenedor.append(boton);
  const dialogo = document.createElement('dialog');
  dialogo.id = 'io-menu';
  dialogo.className = 'io-menu';
  dialogo.setAttribute('aria-labelledby', 'io-menu-titulo');
  dialogo.innerHTML = `<header><div><small>Investigación Operativa II</small><h2 id="io-menu-titulo">Métodos</h2></div><button type="button" aria-label="Cerrar menú">×</button></header><nav aria-label="Cambiar de método">${metodos.map(([ruta, nombre, descripcion], i) => `<a href="${new URL(`metodos/${ruta}/index.html`, raiz)}" ${location.pathname.includes(`/metodos/${ruta}/`) ? 'aria-current="page"' : ''}><span>0${i + 1}</span><div><strong>${nombre}</strong><small>${descripcion}</small></div><b aria-hidden="true">↗</b></a>`).join('')}</nav><footer><a href="${new URL('index.html', raiz)}">Inicio <span>↗</span></a><a href="${new URL('docs/manual/Manual_de_usuario_Investigacion_Operativa_II.pdf', raiz)}" target="_blank" rel="noopener">Manual de usuario <span>PDF ↗</span></a></footer>`;
  document.body.append(dialogo);
  let desbordamiento = '';
  function cerrar() { dialogo.close(); }
  boton.addEventListener('click', () => {
    desbordamiento = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogo.showModal();
    boton.setAttribute('aria-expanded', 'true');
    dialogo.querySelector('button').focus();
  });
  dialogo.querySelector('button').addEventListener('click', cerrar);
  dialogo.addEventListener('click', evento => { if (evento.target === dialogo) { const r = dialogo.getBoundingClientRect(); if (evento.clientX < r.left || evento.clientX > r.right || evento.clientY < r.top || evento.clientY > r.bottom) cerrar(); } });
  dialogo.querySelectorAll('a').forEach(enlace => enlace.addEventListener('click', cerrar));
  dialogo.addEventListener('close', () => { document.body.style.overflow = desbordamiento; boton.setAttribute('aria-expanded', 'false'); boton.focus(); });
})();
