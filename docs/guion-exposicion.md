# Guion de exposición del software
Investigación Operativa II | Duración orientativa: 5 a 7 minutos

## 1. Presentación y propósito | 40 segundos
**En pantalla: portada del sistema.**

Buenos días. Presentaremos el sistema web de Investigación Operativa II. Su propósito es reunir en una misma plataforma tres áreas de trabajo: planificación de proyectos, inventarios y teoría de decisiones. Permite ingresar los datos de un problema, calcular sus resultados y examinarlos mediante tablas y gráficas. En esta parte mostraremos el funcionamiento del software; el desarrollo de las fórmulas se explicará por separado.

La plataforma está disponible desde un navegador web en io2modelos.vercel.app. No requiere instalar un programa de escritorio ni crear una cuenta para utilizar sus módulos.

## 2. Acceso y navegación | 40 segundos
**En pantalla: sección Métodos y menú lateral.**

Para acceder necesitamos conexión a internet y un navegador actualizado, como Chrome, Edge o Firefox. Conviene trabajar en una computadora para ingresar tablas extensas; las vistas también se adaptan a pantallas más pequeñas.

Desde la portada podemos abrir cualquiera de los tres módulos. El botón Métodos permite cambiar de área sin regresar al inicio. La sección Recursos reúne el manual, la presentación y los documentos de apoyo. Si usamos el guardado local, debemos recordar que corresponde a este navegador, no a una cuenta compartida en la nube.

## 3. Planificación de proyectos | 1 minuto
**En pantalla: PERT-CPM. Cargar el Problema 4 de construcción de una casa y calcular.**

Este módulo organiza actividades y sus dependencias. Podemos escribir los datos, pegar una tabla o cargar un caso de práctica. Elegimos el método y la unidad de tiempo, revisamos las precedencias y pulsamos Calcular proyecto. Si la tabla es extensa, el botón de ampliar facilita la edición.

El resultado presenta la duración y la ruta crítica. En la red observamos qué tareas dependen de otras; en Gantt vemos su distribución en el tiempo. Ver todo permite mostrar el conjunto y el zoom ayuda a revisar detalles. Al seleccionar un nodo o una barra consultamos sus tiempos sin perder el contexto.

También está disponible PERT con tres estimaciones por actividad. Esas estimaciones se ingresan como datos; el sistema obtiene los resultados derivados. Podemos definir un plazo objetivo y consultar la probabilidad estimada de cumplirlo, siempre bajo los supuestos del modelo.

<!-- pagina -->
## 4. Inventarios | 1 minuto
**En pantalla: Inventarios. Cargar Veinteluces, calcular y abrir Política y Costos.**

En Inventarios buscamos cuánto pedir o producir y cuándo iniciar la reposición. El módulo incluye pedido económico, producción y faltantes. Seleccionamos el modelo y registramos demanda, costos y tiempos, revisando que sus periodos sean compatibles.

Las tarjetas reúnen los resultados principales. La gráfica de inventario representa los ciclos y el punto de reorden; la pestaña Costos muestra cómo cambia el costo al variar el lote. Podemos probar otra cantidad con el campo o el deslizador y comparar su efecto, sin reemplazar el óptimo. Para explicar el costo debemos distinguir el costo del modelo del total que incluye compra.

## 5. Teoría de decisiones | 1 minuto
**En pantalla: Decisiones. Mostrar una tabla calculada y después un árbol precargado.**

Este módulo ofrece dos formas de organizar un problema: tablas y árboles. En las tablas registramos alternativas, estados y pagos o costos. Elegimos si buscamos maximizar beneficios o minimizar costos. Cuando hay probabilidades, la gráfica permite comparar los valores esperados; sin ellas, los criterios de incertidumbre ofrecen otras perspectivas.

El árbol representa decisiones sucesivas y eventos posibles. Podemos editar sus nodos y ramas y calcular la estrategia recomendada. El ajuste de vista sirve para comprender el conjunto y el zoom para revisar un nodo. La recomendación depende de los datos ingresados: no garantiza que ocurra un resultado concreto.

## 6. Interacción, verificación y cierre | 1 minuto
**En pantalla: abrir Cómo interpretar en una gráfica y cerrar; terminar en Recursos.**

Las gráficas incluyen ayuda de interpretación y controles de visualización. El zoom cambia el tamaño, no los cálculos. Antes de presentar un resultado debemos comprobar los datos, la unidad, el objetivo y los mensajes de validación. Después de editar, calculamos nuevamente.

La interfaz utiliza HTML, CSS y JavaScript; las figuras se representan con SVG y la notación matemática utiliza MathJax. El código se administra en GitHub y la publicación se realiza en Vercel. Estos componentes permiten acceder al mismo sistema mediante un enlace web. Se necesita conexión para cargar la plataforma y sus recursos externos; no se ofrece un funcionamiento sin conexión garantizado.

En resumen, el software permite pasar de los datos a una representación organizada de los resultados, explorar escenarios y preparar una explicación con apoyo visual. Su función es apoyar el análisis, no reemplazar el criterio de quien interpreta el problema. Con esto concluye el recorrido del sistema y damos paso a la explicación de los modelos y sus fundamentos.

## Lista breve para preparar la demostración
- Abrir el sistema y comprobar la conexión antes de empezar.
- Tener preparados un caso de proyecto, uno de inventarios y uno de decisiones.
- Mostrar primero el resultado general y después una interacción por módulo.
- Evitar editar muchas filas durante la exposición; usar los casos precargados.
- Cerrar con el manual y mantener las fórmulas para la siguiente parte.
