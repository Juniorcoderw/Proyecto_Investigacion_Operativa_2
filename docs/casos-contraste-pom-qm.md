# Casos precargados y contraste con POM-QM

Los casos de práctica se transcribieron de las guías compartidas. Los ejemplos de contraste son demostrativos cuando no existe un desarrollo completo en los informes; su nombre no implica disponer de una captura externa.

## Selección para comprobación en vivo · 16 de octubre de 2026

| Módulo | Caso precargado | Fuente | Referencia principal |
|---|---|---|---|
| CPM | Problema 4 · Construcción de una casa | Práctica 03, pp. 9–11 | 35 días; A–B–F–I–L–N |
| PERT | Problema 5 · Terminar antes de un mes | Práctica 03, pp. 11–14 | 34 días; A–D–J–K–N; varianza 14 |
| EOQ | Caso 1 · Veinteluces | Práctica 04, pp. 4–5 | Q*=400; reorden=35; costo del modelo=USD 120 |
| EPQ | Ejemplo EPQ · Producción por lotes | Demostrativo, no pertenece a la práctica | Q*=1 154,7005; inventario máximo=866,0254 |
| Decisiones | Lanzamiento de un nuevo producto | Práctica 07, p. 3 | Producto grande; VME=S/ 43 750 |
| Decisiones | Contratación de proveedores | Práctica 07, p. 5 | Proveedor A; costo esperado=S/ 53 000 |

Los dos casos de Decisiones están disponibles tanto en tablas como en árboles. Los valores de información perfecta son comprobaciones adicionales de la matriz; no se atribuyen a las capturas de los árboles. La probabilidad PERT para un plazo de 30 días (aproximadamente 14,25 %) se obtiene mediante la aproximación normal, no de una captura de esa salida.

El [documento de comparación](https://docs.google.com/document/d/1nk48l1XG8mnhQM87JO287_r14me6HcoVKBGr3pOvxYw/edit) reúne enunciados, tablas editables y capturas originales extraídas de los informes. El EPQ está identificado como demostrativo y no tiene captura POM-QM aportada.

Use la misma cantidad de decimales en ambas herramientas. La aplicación conserva la precisión interna y redondea solo al mostrar.

## 1. PERT–CPM

### 1.1 CPM · Sistema informático — Práctica del curso, ejercicio 1

En POM-QM: `Project Management (PERT/CPM) > Single time estimate`.

| Actividad | Predecesoras | Duración |
|---|---|---:|
| A | — | 4 |
| B | A | 5 |
| C | A | 3 |
| D | B, C | 8 |
| E | D | 4 |
| F | E | 2 |

Comprobación: duración `23`, ruta crítica `A–B–D–E–F` y holgura de C `2`.

### 1.2 CPM · Laboratorio de cómputo — Práctica del curso, ejercicio 2

| Actividad | Predecesoras | Duración |
|---|---|---:|
| A | — | 3 |
| B | A | 6 |
| C | A | 8 |
| D | C | 5 |
| E | C, D | 4 |
| F | B, E | 3 |
| G | F | 2 |

Comprobación: duración `25` y ruta crítica `A–C–D–E–F–G`.

### 1.3 PERT · Software con incertidumbre — Práctica del curso, ejercicio 6

En POM-QM: `Project Management (PERT/CPM) > Triple time estimate`. Plazo de evaluación: `30` días.

| Actividad | Predecesoras | Optimista a | Más probable m | Pesimista b |
|---|---|---:|---:|---:|
| A | — | 2 | 4 | 6 |
| B | A | 3 | 5 | 9 |
| C | A | 2 | 3 | 4 |
| D | B, C | 5 | 8 | 11 |
| E | D | 2 | 4 | 6 |
| F | E | 1 | 2 | 3 |

Comprobación: duración esperada `23.3333`, ruta crítica `A–B–D–E–F`, varianza de la ruta `3`, desviación `1.7321`, `Z = 3.849` y probabilidad aproximada `99.99 %`.

### 1.4 PERT · Centro de transformación digital — Práctica del curso, ejercicio 10

Plazo de evaluación: `65` días.

| Act. | Actividad | Predecesoras | a | m | b |
|---|---|---|---:|---:|---:|
| A | Diagnóstico inicial | — | 4 | 6 | 10 |
| B | Diseño de solución | A | 5 | 7 | 11 |
| C | Evaluación presupuestal | A | 3 | 5 | 9 |
| D | Adquisición tecnológica | B, C | 7 | 10 | 15 |
| E | Adecuación de infraestructura | B | 6 | 8 | 12 |
| F | Instalación tecnológica | D, E | 5 | 7 | 11 |
| G | Configuración de sistemas | F | 4 | 6 | 10 |
| H | Integración de sistemas | G | 5 | 8 | 13 |
| I | Capacitación | H | 3 | 5 | 7 |
| J | Pruebas piloto | H | 4 | 6 | 9 |
| K | Correcciones | I, J | 3 | 5 | 8 |
| L | Puesta en producción | K | 2 | 3 | 5 |

Comprobación: duración esperada `60.5`, ruta crítica `A–B–D–F–G–H–J–K–L`, varianza de la ruta `10.1944`, desviación `3.1929` y probabilidad aproximada de cumplir 65 días `92.05 %`.

## 2. Inventarios EOQ — prácticas del curso

En POM-QM: `Inventory > Economic Order Quantity (EOQ) Model`.

### 2.1 Veinteluces

| Entrada POM-QM | Valor |
|---|---:|
| Demand rate | 1200 |
| Setup/ordering cost | 20 |
| Holding cost | 0.30 |
| Unit cost | 2 |
| Working days | 240 |
| Lead time | 7 |

Resultados: `Q = 400`, `N = 3`, ciclo `80`, reorden `35`, costo relevante `120` y costo total con compra `2520`.

### 2.2 R&B Beverage Company

El mantenimiento es `25 %` de un precio unitario de `3`, por lo que en POM-QM puede ingresarse `H = 0.75`.

| Entrada POM-QM | Valor |
|---|---:|
| Demand rate | 3600 |
| Setup/ordering cost | 20 |
| Holding cost | 0.75 |
| Unit cost | 3 |
| Working days | 250 |
| Lead time | 5 |

Resultados: `Q = 438.1780`, `N = 8.2158`, ciclo `30.4290`, reorden `72` y costo relevante `328.6335`.

### 2.3 Panda Auto

El mantenimiento es `20 %` de un precio unitario de `2.50`, por lo que `H = 0.50`.

| Entrada POM-QM | Valor |
|---|---:|
| Demand rate | 12000 |
| Setup/ordering cost | 25 |
| Holding cost | 0.50 |
| Unit cost | 2.50 |
| Working days | 250 |
| Lead time | 5 |

Resultados: `Q = 1095.4451`, `N = 10.9545`, ciclo `22.8218`, reorden `240` y costo relevante `547.7226`.

## 3. Inventarios EPQ — casos de contraste

Estos datos no proceden de una práctica completa encontrada en Drive. Se mantienen identificados como casos de contraste para `Inventory > Production Order Quantity Model`.

### 3.1 Producción por lotes

| Parámetro | Valor |
|---|---:|
| Demanda anual | 10000 |
| Tasa anual de producción | 40000 |
| Costo de preparación | 100 |
| Mantenimiento anual por unidad | 2 |
| Costo unitario | 10 |
| Días laborables | 250 |
| Tiempo de entrega | 2 |

Resultados: lote `1154.7005`, inventario máximo `866.0254`, pedidos `8.6603`, ciclo `28.8675`, reorden `80` y costo relevante `1732.0508`.

### 3.2 Taller de componentes

| Parámetro | Valor |
|---|---:|
| Demanda anual | 24000 |
| Tasa anual de producción | 60000 |
| Costo de preparación | 80 |
| Mantenimiento anual por unidad | 1.20 |
| Costo unitario | 6 |
| Días laborables | 300 |
| Tiempo de entrega | 4 |

Resultados: lote `2309.4011`, inventario máximo `1385.6406`, pedidos `10.3923`, ciclo `28.8675`, reorden `320` y costo relevante `1662.7688`.

## 4. Inventarios con faltantes — casos de contraste

Estos datos tampoco aparecen como ejercicios completos en la práctica disponible. En POM-QM use `Inventory > Back Order Inventory Model`.

### 4.1 Pedidos con espera planificada

| Parámetro | Valor |
|---|---:|
| Demanda anual | 2000 |
| Costo por pedido | 25 |
| Mantenimiento anual por unidad | 10 |
| Costo anual por unidad pendiente | 30 |
| Costo unitario | 50 |
| Días laborables | 250 |
| Tiempo de entrega | 5 |

Resultados: lote `115.4701`, inventario máximo `86.6025`, faltante máximo `28.8675`, pedidos `17.3205`, reorden neto `11.1325` y costo relevante `866.0254`.

### 4.2 Repuestos bajo pedido

| Parámetro | Valor |
|---|---:|
| Demanda anual | 5000 |
| Costo por pedido | 40 |
| Mantenimiento anual por unidad | 4 |
| Costo anual por unidad pendiente | 16 |
| Costo unitario | 20 |
| Días laborables | 250 |
| Tiempo de entrega | 4 |

Resultados: lote `353.5534`, inventario máximo `282.8427`, faltante máximo `70.7107`, pedidos `14.1421`, reorden neto `9.2893` y costo relevante `1131.3708`.

## 5. Tablas de decisión — prácticas del curso

En POM-QM: `Decision Analysis > Decision Tables` y seleccione maximización de beneficios.

### 5.1 Rifa

| Alternativa | Ganar | Perder |
|---|---:|---:|
| Comprar número | 4900 | -100 |
| No comprar | 0 | 0 |
| Probabilidad | 0.01 | 0.99 |

Resultados: valor esperado de comprar `-50`, no comprar `0`; decisión recomendada `No comprar`. Valor esperado con información perfecta `49` y EVPI `49`.

### 5.2 Inversión de 10 000 dólares

Los pagos son la ganancia o pérdida monetaria, no el capital final.

| Alternativa | Mercado alcista | Mercado bajista |
|---|---:|---:|
| Compañía A | 5000 | -2000 |
| Compañía B | 1500 | 500 |
| Probabilidad | 0.60 | 0.40 |

Resultados: valor esperado de A `2200`, de B `1100`; decisión recomendada `Compañía A`. Valor esperado con información perfecta `3200` y EVPI `1000`.

## 6. Árboles de decisión — prácticas del curso

En POM-QM: `Decision Analysis > Decision Trees (Graphical)`. Los valores de una rama se acumulan con los valores posteriores.

### 6.1 Rifa

```text
Decisión
├── Comprar número
│   └── Resultado de la rifa
│       ├── Ganar: p = 0.01; pago = 4900
│       └── Perder: p = 0.99; pago = -100
└── No comprar: pago = 0
```

El nodo de azar vale `-50`; al compararlo con `0`, la estrategia es no comprar.

### 6.2 Vacaciones en el extranjero

Objetivo: minimizar costos. Para los tres destinos, dólar alto `0.70` y bajo `0.30`.

| Destino | Costo con dólar alto | Costo con dólar bajo | P. soleado | P. lluvioso |
|---|---:|---:|---:|---:|
| México | 850 | 500 | 0.60 | 0.40 |
| Panamá | 900 | 400 | 0.80 | 0.20 |
| Venezuela | 750 | 450 | 0.40 | 0.60 |

Si está soleado, multiplique el costo base por `0.85`; si está lluvioso, sume `75`.

Pagos terminales:

| Destino | Alto/soleado | Alto/lluvioso | Bajo/soleado | Bajo/lluvioso |
|---|---:|---:|---:|---:|
| México | 722.50 | 925.00 | 425.00 | 575.00 |
| Panamá | 765.00 | 975.00 | 340.00 | 475.00 |
| Venezuela | 637.50 | 825.00 | 382.50 | 525.00 |

Resultados: México `707.95`, Panamá `675.00`, Venezuela `665.40`; elegir Venezuela.

## Protocolo de comparación

1. Abra el módulo de POM-QM indicado en cada sección.
2. Mantenga la misma interpretación de costos o beneficios.
3. Ingrese probabilidades como decimales y confirme que sumen uno.
4. En EOQ convierta el porcentaje anual de mantenimiento a costo monetario cuando POM-QM solicite `Holding cost`.
5. Configure cuatro decimales para revisar diferencias de redondeo.
6. Compare primero resultados intermedios y luego la recomendación final.
