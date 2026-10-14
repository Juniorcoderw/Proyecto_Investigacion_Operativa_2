# Casos de contraste con POM-QM

Estos casos permiten ingresar los mismos datos en POM-QM y en la aplicación. La comparación debe hacerse con los valores sin redondear o con la misma cantidad de decimales.

## 1. Inventarios — Economic Order Quantity Model

Datos:

| Parámetro | Valor |
|---|---:|
| Demanda anual | 3600 |
| Costo por pedido | 20 |
| Costo anual de mantenimiento por unidad | 0.75 |
| Días laborables | 250 |
| Tiempo de entrega | 5 |

Resultados esperados:

| Resultado | Valor |
|---|---:|
| Lote económico | 438.1780 |
| Pedidos por año | 8.2158 |
| Tiempo entre pedidos | 30.4290 días |
| Punto de reorden | 72 |
| Costo anual relevante | 328.6335 |

## 2. Inventarios — Production Order Quantity Model

Datos:

| Parámetro | Valor |
|---|---:|
| Demanda anual | 10000 |
| Tasa anual de producción | 40000 |
| Costo de preparación | 100 |
| Costo anual de mantenimiento por unidad | 2 |

Resultados esperados:

| Resultado | Valor |
|---|---:|
| Lote de producción | 1154.7005 |
| Inventario máximo | 866.0254 |
| Factor almacenado | 0.75 |
| Costo anual relevante | 1732.0508 |

## 3. Inventarios — Back Order Inventory Model

Datos:

| Parámetro | Valor |
|---|---:|
| Demanda anual | 2000 |
| Costo por pedido | 25 |
| Costo anual de mantenimiento por unidad | 10 |
| Costo anual por unidad pendiente | 30 |

Resultados esperados:

| Resultado | Valor |
|---|---:|
| Lote óptimo | 115.4701 |
| Inventario máximo | 86.6025 |
| Faltante máximo | 28.8675 |
| Costo anual relevante | 866.0254 |

## 4. Decisiones — Decision Tables

Objetivo: maximizar beneficios. Coeficiente de Hurwicz: 0.60.

| Alternativa | Demanda alta | Demanda media | Demanda baja |
|---|---:|---:|---:|
| Planta grande | 200 | 80 | -120 |
| Planta mediana | 140 | 90 | -20 |
| No ampliar | 40 | 40 | 40 |
| Probabilidad | 0.30 | 0.50 | 0.20 |

Resultados esperados:

| Resultado | Valor |
|---|---:|
| Valor esperado de planta grande | 76 |
| Valor esperado de planta mediana | 83 |
| Valor esperado de no ampliar | 40 |
| Alternativa por valor esperado | Planta mediana |
| Valor esperado con información perfecta | 113 |
| EVPI | 30 |
| Alternativa por minimax de arrepentimiento | Planta mediana |

## 5. Decisiones — Decision Trees (Graphical)

Objetivo: maximizar beneficios.

```text
Estrategia inicial
├── Desarrollar: -60
│   └── Resultado técnico
│       ├── Éxito: p = 0.65
│       │   └── Escala de lanzamiento
│       │       ├── Amplio: 220
│       │       └── Limitado: 150
│       └── Fallo: p = 0.35; valor = -30
└── Licenciar: 55
```

Resolución esperada:

1. En éxito, elegir lanzamiento amplio: `220`.
2. Valor de resultado técnico: `0.65(220) + 0.35(-30) = 132.50`.
3. Valor de desarrollar: `-60 + 132.50 = 72.50`.
4. Comparar desarrollar `72.50` con licenciar `55`.
5. Estrategia recomendada: desarrollar; si existe éxito, realizar lanzamiento amplio.

## Protocolo de comparación

1. Seleccione el modelo equivalente indicado en cada título.
2. Mantenga la misma interpretación de beneficios o costos.
3. Ingrese probabilidades como decimales y confirme que sumen uno.
4. Configure la misma cantidad de decimales en POM-QM.
5. Compare resultados intermedios antes del resultado final.
6. Si existe una diferencia menor, revise si POM-QM muestra valores redondeados aunque calcule con precisión interna.
