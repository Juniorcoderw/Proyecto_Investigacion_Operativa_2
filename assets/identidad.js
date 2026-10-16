/* Entrada breve y no bloqueante. No simula un porcentaje ni espera servicios externos. */
(() => {
  if (window.frameElement?.id === 'aplicacion-pruebas') return;
  const archivo = document.currentScript?.src;
  if (!archivo || !document.body) return;
  const logo = new URL('institucional/logo-esis.png', archivo).href;
  const ruta = location.pathname;
  const tipo = ruta.includes('/pert-cpm/') ? 'pert' : ruta.includes('/inventarios/') ? 'inventarios' : ruta.includes('/teoria-decisiones/') ? 'decisiones' : 'inicio';
  const textos = {
    inicio: ['Investigación Operativa II', 'Ingeniería en Informática y Sistemas · UNJBG'],
    pert: ['PERT – CPM', 'Planificación de proyectos'],
    inventarios: ['Inventarios', 'Pedidos · Producción · Costos'],
    decisiones: ['Teoría de decisiones', 'Alternativas · Escenarios · Estrategias']
  };
  const reducida = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const comienzo = performance.now();
  const minimo = reducida ? 0 : tipo === 'inicio' ? 650 : 420;
  const pantalla = document.createElement('div');
  pantalla.className = 'entrada-io'; pantalla.dataset.modulo = tipo;
  pantalla.setAttribute('role', 'status'); pantalla.setAttribute('aria-live', 'polite');
  const centro = document.createElement('div'); centro.className = 'entrada-centro';
  const insignia = document.createElement('p'); insignia.className = 'entrada-insignia'; insignia.textContent = 'ESIS · UNJBG';
  const escena = document.createElement('div'); escena.className = 'esis-holograma'; escena.setAttribute('aria-hidden', 'true');
  for (const clase of ['esis-orbita', 'esis-orbita esis-orbita-dos', 'esis-orbita esis-orbita-tres', 'esis-plataforma']) { const e = document.createElement('span'); e.className = clase; escena.append(e); }
  const emblema = document.createElement('div'); emblema.className = 'esis-emblema';
  const imagen = document.createElement('img'); imagen.src = logo; imagen.alt = ''; imagen.width = 300; imagen.height = 300;
  imagen.addEventListener('error', () => { imagen.hidden = true; });
  emblema.append(imagen); escena.append(emblema);
  const titulo = document.createElement('p'); titulo.className = 'entrada-titulo'; titulo.textContent = textos[tipo][0];
  const simbolo = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  simbolo.setAttribute('viewBox', '0 0 240 44'); simbolo.setAttribute('aria-hidden', 'true'); simbolo.setAttribute('class', 'entrada-metodo simbolo-' + tipo);
  const figura = (tag, atributos) => { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); Object.entries(atributos).forEach(([k,v]) => e.setAttribute(k,v)); simbolo.append(e); };
  if (tipo === 'pert') {
    figura('path', {d:'M30 22H210', class:'trazo-entrada'});
    [30,90,150,210].forEach(cx => figura('circle', {cx,cy:22,r:6}));
  } else if (tipo === 'inventarios') {
    [14,23,32,23,14].forEach((alto,i) => figura('rect', {x:64+i*23,y:38-alto,width:13,height:alto,rx:2,class:'barra-entrada',style:`animation-delay:${i*.12}s`}));
  } else if (tipo === 'decisiones') {
    figura('path', {d:'M65 22H105L145 9H175M105 22L145 35H175',class:'trazo-entrada'});
    figura('rect', {x:55,y:16,width:12,height:12,rx:3});
    [9,35].forEach(cy => figura('circle', {cx:181,cy,r:5}));
  }
  const subtitulo = document.createElement('p'); subtitulo.className = 'entrada-subtitulo'; subtitulo.textContent = textos[tipo][1];
  const pista = document.createElement('div'); pista.className = 'entrada-pista'; pista.setAttribute('aria-hidden', 'true'); pista.append(document.createElement('span'));
  centro.append(insignia, escena, titulo); if (tipo !== 'inicio') centro.append(simbolo);
  centro.append(subtitulo, pista); pantalla.append(centro); document.body.prepend(pantalla);
  document.documentElement.dataset.entrada = 'activa';
  let cerrada = false;
  function cerrar() {
    if (cerrada) return;
    cerrada = true; clearTimeout(limite);
    pantalla.classList.add('entrada-finalizada');
    document.documentElement.dataset.entrada = 'lista';
    document.removeEventListener('keydown', escapar);
    setTimeout(() => pantalla.remove(), reducida ? 0 : 340);
  }
  function escapar(e) { if (e.key === 'Escape') cerrar(); }
  const limite = setTimeout(cerrar, 2200);
  document.addEventListener('keydown', escapar);
  const lista = () => setTimeout(cerrar, Math.max(0, minimo - (performance.now() - comienzo)));
  if (document.readyState === 'complete') lista();
  else document.addEventListener('DOMContentLoaded', lista, {once:true});
  window.addEventListener('pageshow', e => { if (e.persisted) cerrar(); });
})();
