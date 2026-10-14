# Investigación Operativa II — Métodos cuantitativos

Aplicación web académica para resolver y analizar modelos de Investigación Operativa II. Incluye módulos interactivos de PERT–CPM, inventarios y teoría de decisiones.

## Estado del proyecto

- PERT–CPM: módulo funcional con cálculo CPM y PERT, desarrollo matemático y red AON.
- Inventarios: módulo funcional con EOQ básico, EPQ y EOQ con faltantes planificados, además de costos, gráficos y comparación de escenarios.
- Teoría de decisiones: tablas de pago y árboles secuenciales con criterios clásicos, valor esperado, arrepentimiento, EVPI y resolución por retroceso.
- Pruebas realizadas: redes PERT–CPM, casos manuales EOQ, producción EPQ, faltantes planificados, capacidad, matrices de beneficios y costos, valor esperado, arrepentimiento, EVPI y árboles con decisiones y azar.

## Estructura

```text
.
├── index.html
├── estilos.css
├── metodos/
│   ├── pert-cpm/
│   │   ├── index.html
│   │   ├── estilos.css
│   │   └── pert-cpm.js
│   ├── inventarios/
│   │   ├── index.html
│   │   ├── estilos.css
│   │   ├── inventarios.js
│   │   ├── pruebas.html
│   │   └── pruebas.js
│   └── teoria-decisiones/
│       ├── index.html
│       ├── estilos.css
│       ├── decisiones.js
│       ├── arboles.html
│       ├── arboles.js
│       ├── pruebas.html
│       ├── pruebas.js
│       ├── pruebas-arboles.html
│       └── pruebas-arboles.js
└── docs/
    └── casos-contraste-pom-qm.md
```

## Cómo ejecutar

1. Descargue o clone el repositorio.
2. Inicie un servidor estático en la raíz del proyecto; por ejemplo, `python -m http.server 8765`.
3. Abra `http://127.0.0.1:8765` y seleccione el módulo que desea utilizar.

La aplicación utiliza HTML, CSS y JavaScript sin proceso de compilación. MathJax renderiza las expresiones matemáticas y Google Fonts proporciona las familias tipográficas de la interfaz.

## Módulo PERT–CPM

### Entradas

- Nombre único de cada actividad.
- Predecesoras inmediatas, separadas por comas.
- CPM: una duración por actividad.
- PERT: tiempos optimista, probable y pesimista.
- Pegado de rangos copiados desde Excel e importación o exportación CSV/TSV.

Los nombres de las actividades no pueden repetirse, las predecesoras deben existir y la red no puede contener ciclos.

### Cálculos

En CPM, el programa utiliza las duraciones ingresadas.

En PERT, calcula para cada actividad:

```text
Tiempo esperado = (optimista + 4 × probable + pesimista) / 6
Varianza = ((pesimista − optimista) / 6)²
```

A partir de la red de precedencias, ejecuta el recorrido hacia adelante y hacia atrás:

```text
Inicio temprano = máximo fin temprano de sus predecesoras
Fin temprano = inicio temprano + duración
Fin tardío = mínimo inicio tardío de sus sucesoras
Inicio tardío = fin tardío − duración
Holgura = inicio tardío − inicio temprano
```

Las actividades sin predecesoras comienzan en el instante cero. Las actividades sin sucesoras terminan, como fecha tardía de referencia, en la duración total del proyecto. Las actividades con holgura cero se clasifican como críticas.

### Resultados

El análisis se organiza en tres vistas: Red del proyecto, Gantt y Solución. Solución reúne el desarrollo paso a paso y los bloques desplegables de tabla de tiempos e interpretación.

- Duración calculada del proyecto.
- Actividades críticas.
- Tabla con inicios y fines tempranos y tardíos.
- Holgura por actividad.
- Enumeración de rutas críticas completas, incluidas rutas críticas múltiples.
- Probabilidad PERT para un plazo objetivo y análisis por ruta.
- Desarrollo de fórmulas PERT, recorridos y holguras renderizado con LaTeX.
- Interpretación académica automática del resultado.
- Red AON interactiva con nodos de seis casillas, conexiones y rutas críticas resaltadas.
- Diagrama de Gantt para CPM y para los escenarios PERT esperado, optimista, más probable y pesimista.

## Alcance estadístico

La red utiliza actividades en nodos (AON) y organiza las actividades por niveles de precedencia. Cada nodo muestra inicio temprano, duración, fin temprano, inicio tardío, holgura y fin tardío.

La probabilidad PERT se calcula mediante una aproximación normal para cada ruta crítica, sumando las varianzas de sus actividades. Cuando existen varias rutas críticas, sus duraciones pueden estar correlacionadas si comparten actividades; por eso el sistema informa las probabilidades por ruta y presenta una cota superior, no una probabilidad conjunta exacta.

El ejemplo precargado es demostrativo y puede reemplazarse mediante ingreso manual o pegado tabular.

## Organización del código

Cada nuevo método tendrá su propia carpeta con `index.html`, `estilos.css` y un archivo JavaScript propio. Se priorizan identificadores en español y se evitan dependencias o carpetas adicionales mientras no sean necesarias.

## Módulo de inventarios

EOQ calcula el lote económico con reposición instantánea. EPQ modela una producción gradual y exige que la tasa de producción supere la demanda. El modelo con faltantes planificados permite pedidos pendientes, calcula el inventario y faltante máximos y añade su penalización anual. Los tres modelos presentan ciclos, punto de reorden y costos; el mantenimiento puede ingresarse como costo por unidad o como porcentaje del precio.

La herramienta incluye una gráfica dinámica adaptada al tipo de reposición, curva de costos con simulador de lotes alternativos, desarrollo matemático con LaTeX, interpretación automática y una tabla compatible con datos pegados desde Excel para comparar escenarios. Los cálculos conservan su precisión interna y el redondeo se aplica únicamente en la presentación.

## Módulo de teoría de decisiones

La calculadora trabaja con alternativas en filas y estados de la naturaleza en columnas, de manera equivalente a `Decision Analysis → Decision Tables` de POM-QM. Acepta matrices de beneficios o costos, probabilidades en decimales o porcentajes, coeficiente de optimismo de Hurwicz e importación directa desde Excel.

Presenta Maximax o Minimin, Wald, Hurwicz, Laplace, Savage y valor esperado, además de la matriz de arrepentimiento, EVPI, gráfico comparativo y desarrollo matemático con LaTeX. El segundo modelo permite construir árboles con nodos de decisión, azar y resultados terminales, resolverlos por retroceso y destacar la estrategia óptima.

Los casos reproducibles para contrastar los tres modelos de inventario, las tablas y los árboles con POM-QM se encuentran en `docs/casos-contraste-pom-qm.md`.

## Preparación para despliegue

El proyecto es estático y puede desplegarse directamente desde la raíz del repositorio en Vercel, sin comando de compilación. Antes del despliegue final se debe verificar la carga de MathJax y Google Fonts desde la red de producción.

## Próximos pasos

1. Registrar capturas de la ejecución de los casos de contraste en POM-QM.
2. Realizar la revisión final de contenido y accesibilidad.
3. Desplegar la rama aprobada en Vercel.

## Referencia académica

El desarrollo está orientado a los modelos de gestión de proyectos PERT–CPM trabajados en Investigación Operativa II. La guía de POM-QM del curso se utilizará como referencia para contrastar los procedimientos y resultados, sin atribuir pruebas que todavía no se han ejecutado.
