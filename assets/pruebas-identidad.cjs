/* Ciclo de vida de la entrada, con reloj controlado y sin red ni navegador. */
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const codigo = fs.readFileSync(__dirname + '/identidad.js', 'utf8');
function entorno(ruta = '/index.html', reducida = false, iframe = false) {
  let ahora = 0, secuencia = 0;
  const tareas = new Map(), eventos = new Map();
  const crear = tag => ({tag, children:[], attrs:{}, dataset:{}, className:'', hidden:false,
    append(...hijos) { this.children.push(...hijos); }, prepend(hijo) { this.children.unshift(hijo); },
    setAttribute(k,v) { this.attrs[k] = v; }, addEventListener(k,f) { this['on'+k] = f; },
    remove() { this.retirado = true; }, get classList() { return {add:n => { this.className += ' ' + n; }}; }
  });
  const documento = {body:crear('body'), documentElement:{dataset:{}}, currentScript:{src:'https://ejemplo.test/assets/identidad.js'}, readyState:'interactive',
    createElement:crear, createElementNS(_,tag) { return crear(tag); }, addEventListener(k,f) { eventos.set(k,f); }, removeEventListener(k) { eventos.delete(k); }
  };
  const ventana = {frameElement:iframe ? {id:'aplicacion-pruebas'} : null, addEventListener(k,f) { eventos.set(k,f); }};
  const contexto = {window:ventana, document:documento, location:{pathname:ruta}, URL, performance:{now:()=>ahora}, matchMedia:()=>({matches:reducida}),
    setTimeout(f,d=0) { const id=++secuencia; tareas.set(id,{f,cuando:ahora+d}); return id; }, clearTimeout(id) { tareas.delete(id); }
  };
  vm.runInNewContext(codigo, contexto);
  const avanzar = ms => {
    const hasta = ahora+ms;
    while (true) { const siguiente = [...tareas].filter(([,t])=>t.cuando<=hasta).sort((a,b)=>a[1].cuando-b[1].cuando)[0]; if (!siguiente) break; ahora=siguiente[1].cuando; tareas.delete(siguiente[0]); siguiente[1].f(); }
    ahora = hasta;
  };
  return {documento, eventos, avanzar, pantalla:documento.body.children[0]};
}
let total = 0;
function prueba(nombre, f) { f(); total++; console.log('Correcta · ' + nombre); }
for (const [ruta, modulo] of [['/index.html','inicio'],['/metodos/pert-cpm/index.html','pert'],['/metodos/inventarios/index.html','inventarios'],['/metodos/teoria-decisiones/index.html','decisiones']]) {
  prueba('entrada de 3 segundos: ' + modulo, () => {
    const e=entorno(ruta); assert.equal(e.pantalla.dataset.modulo, modulo);
    e.eventos.get('DOMContentLoaded')(); e.avanzar(2999);
    assert.equal(e.documento.documentElement.dataset.entrada, 'activa');
    e.avanzar(1); assert.equal(e.documento.documentElement.dataset.entrada, 'lista');
  });
}
prueba('cierre normal breve sin porcentaje inventado', () => {
  const e=entorno(); assert.equal(e.documento.documentElement.dataset.entrada, 'activa');
  e.eventos.get('DOMContentLoaded')(); e.avanzar(3000); assert.equal(e.documento.documentElement.dataset.entrada, 'lista');
  e.avanzar(340); assert.ok(e.pantalla.retirado); assert.equal(e.pantalla.attrs.role, 'status');
});
prueba('seguridad: se retira aunque nunca llegue DOMContentLoaded', () => {
  const e=entorno(); e.avanzar(3400); assert.ok(e.pantalla.retirado); assert.equal(e.documento.documentElement.dataset.entrada, 'lista');
});
prueba('Escape cierra y los callbacks posteriores son inocuos', () => {
  const e=entorno(); const listo=e.eventos.get('DOMContentLoaded'); e.eventos.get('keydown')({key:'Escape'});
  listo(); e.avanzar(3000); assert.ok(e.pantalla.retirado); assert.equal(e.eventos.has('keydown'),false);
});
prueba('movimiento reducido no añade espera', () => {
  const e=entorno('/index.html',true); e.eventos.get('DOMContentLoaded')(); e.avanzar(0); assert.ok(e.pantalla.retirado);
});
prueba('no interfiere con los entornos aislados de cálculo', () => {
  const e=entorno('/index.html',false,true); assert.equal(e.documento.body.children.length,0);
});
prueba('un logo no disponible no bloquea la aplicación', () => {
  const e=entorno(); const escena=e.pantalla.children[0].children[1]; const imagen=escena.children.at(-1).children[0];
  imagen.onerror(); assert.ok(imagen.hidden); e.avanzar(3400); assert.ok(e.pantalla.retirado);
});
prueba('volver desde la caché no deja una pantalla superpuesta', () => {
  const e=entorno(); e.eventos.get('pageshow')({persisted:true}); e.avanzar(340); assert.ok(e.pantalla.retirado);
});
console.log(`${total} de ${total} pruebas superadas.`);
