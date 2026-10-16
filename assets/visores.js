/* Navegación visual compartida. No modifica parámetros ni resultados de los modelos. */
(() => {
  const ayudas = {
    red: ["Red de actividades", "Muestra qué actividades deben completarse antes de iniciar otras. Se lee desde Inicio hasta Fin; cada nodo contiene los tiempos y la holgura de una actividad.", "La ruta crítica determina la duración del proyecto bajo los datos y el escenario actuales. Una actividad con holgura cero no admite retraso sin afectar esa duración. Puede haber varias rutas críticas.", "Use Ver todo para el panorama y Lectura o + para consultar tiempos. Pulse un nodo para abrir su procedimiento. Las conexiones expresan precedencias, no distancias ni duraciones."],
    gantt: ["Diagrama de Gantt", "El eje horizontal representa tiempo y cada fila corresponde a una actividad. La posición de la barra indica su inicio y su longitud representa su duración.", "La leyenda distingue actividades críticas y con holgura. El margen rayado es tiempo disponible, no trabajo adicional. Ver todo compacta el conjunto; Lectura recupera el detalle.", "Pulse una barra para consultar inicio, fin y holgura. Al cambiar el escenario PERT se recalculan la programación y la criticidad. Activar Dependencias muestra las relaciones entre actividades."],
    "grafico-inventario": ["Evolución del inventario", "El eje horizontal muestra días laborables; el vertical, unidades disponibles. El selector Ciclos cambia cuántas repeticiones de la política se dibujan.", "En EOQ la reposición es instantánea y luego el inventario disminuye por consumo. En EPQ aumenta mientras se produce y disminuye al terminar la fabricación. Con faltantes, la parte negativa representa demanda pendiente, no existencias físicas negativas.", "La marca de reorden indica cuándo iniciar el pedido o la preparación considerando la entrega. Si supera el inventario máximo puede haber pedidos simultáneos; no debe interpretarse como inventario físico. El gráfico representa el modelo, no una predicción de ventas reales."],
    "grafico-costos": ["Curvas de costos del inventario", "El eje horizontal es el tamaño de lote Q y el vertical es costo anual. La leyenda identifica pedidos o preparación, mantenimiento, faltantes cuando corresponda y total del modelo.", "El punto Q* señala el mínimo calculado. El total de estas curvas no incluye la compra anual: revise el Desglose para distinguir costo del modelo y total con compra.", "Mueva el cursor para consultar y pulse sobre la curva para probar otro lote. También puede usar el campo Lote propuesto o su deslizador. La simulación compara costos sin reemplazar el óptimo ni los datos originales."],
    "barras-escenarios": ["Comparación de escenarios de inventario", "Cada barra corresponde a una fila de la tabla de escenarios. Su longitud representa el costo anual relevante del modelo; el valor numérico permite compararlos directamente.", "Una barra menor representa menos costo bajo los parámetros de esa fila. Si la demanda o la producción difieren, el resultado no equivale a una comparación de proveedores en igualdad de condiciones.", "Edite los escenarios o pegue una tabla. Compare las mismas unidades, periodos y componentes de costo. Esta vista complementa el cálculo individual; no busca automáticamente una política entre modelos distintos."],
    "grafico-valores": ["Valor esperado por alternativa", "Cada barra representa una alternativa y su altura corresponde al valor monetario esperado según las probabilidades ingresadas. El cero separa valores positivos y negativos.", "La alternativa resaltada responde al objetivo elegido: mayor valor para beneficios o menor valor para costos. La barra más alta no siempre es la recomendada cuando se minimizan costos.", "Consulte el nombre y el valor de la barra con el cursor o el teclado. El valor esperado no es un resultado garantizado. No confunda la elección con probabilidades con los criterios de incertidumbre o con el valor de la información perfecta."],
    "visor-arbol": ["Árbol de decisión", "Se lee del nodo inicial hacia los resultados finales para comprender las alternativas; la evaluación recorre el sentido inverso. Los símbolos de la leyenda distinguen decisiones, azar y resultados.", "Los eventos de azar ponderan sus ramas por probabilidades y los nodos de decisión conservan la mejor opción según el objetivo. La estrategia resaltada incluye los posibles eventos de la opción elegida, no un único futuro garantizado.", "Seleccione un nodo para editarlo o reutilizar sus ramas. Ajustar muestra el conjunto y + permite revisar valores. Las probabilidades de cada nodo de azar deben sumar 1 o 100 %. Copiar ramas genera estructuras independientes."]
  };
  const dialogo = document.createElement("dialog");
  dialogo.className = "ayuda-grafica-dialogo";
  dialogo.setAttribute("aria-labelledby", "titulo-ayuda-grafica");
  const formulario = document.createElement("form");
  formulario.method = "dialog";
  const titulo = document.createElement("h2");
  titulo.id = "titulo-ayuda-grafica";
  const contenido = document.createElement("div");
  const cerrar = document.createElement("button");
  cerrar.textContent = "Cerrar";
  cerrar.className = "boton";
  formulario.append(titulo, contenido, cerrar);
  dialogo.append(formulario);
  document.body.append(dialogo);
  dialogo.addEventListener("click", e => { if (e.target === dialogo) dialogo.close(); });
  Object.entries(ayudas).forEach(([id, ayuda]) => {
    const grafico = document.getElementById(id);
    if (!grafico) return;
    const barra = document.createElement("div");
    barra.className = "herramientas-grafica";
    barra.setAttribute("role", "group");
    barra.setAttribute("aria-label", "Herramientas de " + ayuda[0]);
    const boton = (texto, etiqueta, accion) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = texto;
      b.setAttribute("aria-label", etiqueta);
      b.addEventListener("click", accion);
      barra.append(b);
      return b;
    };
    if (["grafico-inventario", "grafico-costos", "grafico-valores"].includes(id)) {
      let escala = 1, ajuste = true, anchoAnterior = 0;
      const salida = document.createElement("output");
      salida.setAttribute("aria-live", "polite");
      grafico.classList.add("visor-grafica");
      grafico.tabIndex = 0;
      const aplicar = () => {
        const svg = grafico.querySelector("svg");
        if (!svg || !grafico.clientWidth) return;
        const caja = svg.viewBox.baseVal;
        if (!caja.width || !caja.height) return;
        if (ajuste) escala = Math.min(1, Math.max(.15, (grafico.clientWidth - 4) / caja.width), Math.max(.15, window.innerHeight * .6 / caja.height));
        Object.assign(svg.style, { width: caja.width * escala + "px", height: caja.height * escala + "px", minWidth: "0", minHeight: "0", maxWidth: "none" });
        salida.textContent = Math.round(escala * 100) + " %";
        grafico.dataset.escalaVisual = String(escala);
      };
      const cambiar = factor => { ajuste = false; escala = Math.max(.15, Math.min(3, escala * factor)); aplicar(); };
      boton("−", "Alejar " + ayuda[0], () => cambiar(1 / 1.2));
      boton("Ver todo", "Ajustar " + ayuda[0], () => { ajuste = true; aplicar(); grafico.scrollTo(0, 0); });
      barra.append(salida);
      boton("+", "Acercar " + ayuda[0], () => cambiar(1.2));
      new MutationObserver(aplicar).observe(grafico, { childList: true });
      new ResizeObserver(() => { if (grafico.clientWidth !== anchoAnterior) { anchoAnterior = grafico.clientWidth; aplicar(); } }).observe(grafico);
      window.addEventListener("resize", aplicar);
      aplicar();
    }
    boton("Cómo interpretar", "Cómo interpretar " + ayuda[0], () => {
      titulo.textContent = ayuda[0];
      contenido.replaceChildren(...ayuda.slice(1).map(texto => { const p = document.createElement("p"); p.textContent = texto; return p; }));
      dialogo.showModal();
    });
    grafico.before(barra);
  });
})();
