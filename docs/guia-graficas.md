# Guía de gráficas del sistema
Investigación Operativa II | Guía de consulta | 16 de octubre de 2026

## 1. Controles y lectura general
La plataforma reúne siete vistas gráficas en tres módulos. Antes de interpretar una figura, compruebe el modelo, la unidad de tiempo, la moneda y los datos ingresados. Cambiar el zoom solo modifica la presentación: no cambia los resultados.

- **Ver todo / Ajustar:** recupera el panorama dentro del espacio disponible. En Gantt también compacta las filas.
- **Acercar (+) y alejar (-):** permiten pasar del panorama al detalle. Si aumenta el tamaño, desplácese dentro del visor.
- **Lectura:** en las vistas que lo incluyen, recupera un tamaño cómodo para consultar etiquetas.
- **Cómo interpretar:** abre la explicación específica de la figura. Cierre con el botón Cerrar o con Escape.
- **Selección:** los nodos de red y las barras de Gantt abren detalles; las curvas de costos permiten probar lotes. No todas las figuras tienen la misma acción.

## 2. Red de actividades (PERT-CPM)
**Para qué sirve.** Reconocer precedencias, actividades simultáneas y rutas que determinan la duración del proyecto. AON significa actividad en el nodo: cada tarjeta representa una actividad.

**Cómo leerla.** Avance de Inicio a Fin siguiendo las flechas. Consulte en cada nodo los tiempos tempranos y tardíos y la holgura. Use la leyenda para distinguir la ruta crítica.

**Cómo interpretarla.** Una actividad con holgura cero no admite retraso sin afectar la duración calculada, manteniendo los demás datos. Puede haber más de una ruta crítica. Las distancias entre nodos no representan días ni cantidades de trabajo.

**Cómo explorarla.** Use Ver todo para ubicar el proyecto y aumente el zoom para leer tiempos. Pulse un nodo para consultar su procedimiento. Si modifica precedencias o duraciones, vuelva a calcular antes de interpretar.

## 3. Diagrama de Gantt
**Para qué sirve.** Ver cuándo inicia y termina cada actividad y qué tareas se ejecutan a la vez.

**Cómo leerlo.** El eje horizontal es tiempo; cada fila es una actividad. El comienzo de la barra indica inicio y su longitud indica duración. El tramo rayado es margen disponible, no trabajo adicional.

**Cómo explorarlo.** Ver todo ajusta el cronograma; Lectura recupera detalle. Active Dependencias para ver relaciones y Solo críticas para concentrarse en las tareas determinantes. Pulse una barra para consultar tiempos y holgura.

**Precaución.** En PERT, cambiar entre escenarios optimista, más probable y pesimista cambia la programación y puede cambiar las actividades críticas. No compare dos capturas sin revisar el escenario y la unidad de tiempo.

<!-- pagina -->
## 4. Evolución del inventario
**Para qué sirve.** Visualizar el comportamiento del nivel de existencias durante los ciclos de reposición o producción.

**Cómo leerla.** El eje horizontal muestra días laborables y el vertical unidades. El selector Ciclos permite representar más o menos repeticiones de la política calculada.

- **EOQ, cantidad económica de pedido:** el lote llega de una vez y luego el nivel disminuye por consumo.
- **EPQ, cantidad económica de producción:** el inventario aumenta mientras se fabrica y disminuye cuando termina la producción.
- **Modelo con faltantes:** el tramo por debajo de cero representa demanda pendiente de atender, no existencias físicas negativas.

**Cómo interpretarla.** La marca de reorden ayuda a reconocer cuándo iniciar el pedido o la preparación considerando el plazo de entrega. Si supera el inventario máximo, puede haber pedidos simultáneos: no representa más existencias físicas.

**Cómo explorarla.** Comience con Ver todo y pocos ciclos. Acerque para revisar un ciclo. Cambiar la cantidad de ciclos no modifica la política óptima. La figura representa los supuestos del modelo, no una predicción de ventas reales.

## 5. Curvas de costos del inventario
**Para qué sirve.** Evaluar cómo cambia el costo anual al pedir o producir distintos tamaños de lote.

**Cómo leerlas.** El eje horizontal es el tamaño de lote Q; el vertical es costo anual. La leyenda identifica pedidos o preparación, mantenimiento y, cuando corresponde, faltantes. La curva total combina los componentes pertinentes del modelo.

**Cómo interpretarlas.** El punto Q* identifica el mínimo calculado. Un lote menor o mayor puede incrementar el costo por motivos diferentes. El total de estas curvas no incluye la compra anual; el desglose distingue costo del modelo y total con compra.

**Cómo explorarlas.** Mueva el cursor para consultar valores y pulse sobre la curva para probar otro lote. También puede escribir el Lote propuesto o mover su deslizador. La prueba no sustituye los parámetros originales ni el óptimo calculado. Los botones de zoom conservan el detalle al redibujarse la figura.

## 6. Comparación de escenarios de inventario
**Para qué sirve.** Contrastar el costo anual relevante de las filas de la tabla de escenarios.

**Cómo leerla.** Cada barra corresponde a un escenario. Una barra menor representa menos costo con los parámetros de esa fila; el valor numérico permite comparar sin depender de la escala visual.

**Cómo usarla.** Edite las filas o pegue una tabla y revise sus unidades, periodos y componentes de costo. La vista es adaptable al ancho disponible y se complementa con los valores de la tabla.

**Precaución.** Si cambian la demanda o la producción, los escenarios no equivalen a proveedores comparados en igualdad de condiciones. La figura no busca automáticamente una política entre modelos distintos.

<!-- pagina -->
## 7. Valor esperado por alternativa
**Para qué sirve.** Comparar alternativas de la tabla de decisiones cuando se han definido probabilidades para los estados posibles.

**Cómo leerla.** Cada barra representa una alternativa y su altura corresponde a su valor monetario esperado. La línea de cero permite separar valores positivos y negativos. Consulte el nombre y el valor con el cursor o mediante el foco del teclado.

**Cómo interpretarla.** La alternativa resaltada depende del objetivo: mayor valor para beneficios o menor valor para costos. Por eso la barra más alta no siempre es la recomendada. Compruebe el objetivo antes de explicar la selección.

**Cómo explorarla.** Use Ver todo para comparar el conjunto y acerque para leer etiquetas. Revise las probabilidades: deben sumar 1 o 100 %, según el formato de entrada. Si modifica datos, vuelva a calcular.

**Precaución.** El valor esperado no es un pago garantizado. La gráfica no sustituye los criterios de incertidumbre. EVPI es el valor esperado de la información perfecta y no el valor esperado de la alternativa seleccionada.

## 8. Árbol de decisión
**Para qué sirve.** Representar decisiones sucesivas, eventos inciertos y resultados finales en una estructura de ramas.

**Cómo leerlo.** Recorra el árbol desde el nodo inicial hacia los resultados para entender las opciones. La evaluación se realiza en sentido inverso: los eventos de azar combinan los resultados con sus probabilidades y las decisiones conservan la mejor opción según el objetivo.

**Cómo interpretarlo.** La estrategia resaltada indica qué elegir en los nodos de decisión. Incluye los posibles eventos de la opción elegida, no un único futuro asegurado. La recomendación depende de los valores y probabilidades ingresados.

**Cómo explorarlo.** Ajustar permite ubicar el conjunto; los controles + y - permiten consultar o alejar los nodos. Seleccione un nodo para editarlo o reutilizar ramas. Las copias de ramas son independientes. Las probabilidades de cada nodo de azar deben sumar 1 o 100 %.

## 9. Comprobaciones antes de presentar
- Verifique que el caso y el modelo correspondan al problema.
- Confirme unidades, moneda, periodo y objetivo de maximizar o minimizar.
- Calcule después de modificar los datos y atienda los mensajes de validación.
- Muestre primero el panorama; acerque después para explicar un resultado.
- Apoye la lectura visual en la tabla y los valores numéricos, no solo en colores.

Las tablas de pagos, arrepentimiento y resultados complementan las figuras; no son gráficas adicionales. La probabilidad PERT se presenta como resultado numérico: el sistema no incluye una curva de distribución normal. Esta guía describe el software y no sustituye el estudio de los supuestos de cada modelo.

Acceso al sistema: https://io2modelos.vercel.app/
