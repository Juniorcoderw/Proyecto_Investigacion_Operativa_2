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

En POM-QM abra `Decision Analysis > Decision Tables`. Indique si la matriz contiene beneficios o costos antes de ingresar los valores.

### 4.1. Expansión de capacidad

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

### 4.2. Selección de proveedor

Objetivo: minimizar costos. Coeficiente de Hurwicz: 0.55.

| Alternativa | Exigencia alta | Exigencia normal | Exigencia baja |
|---|---:|---:|---:|
| Proveedor A | 175 | 120 | 95 |
| Proveedor B | 155 | 123 | 108 |
| Producción interna | 210 | 115 | 80 |
| Probabilidad | 0.25 | 0.50 | 0.25 |

Resultados esperados:

| Resultado | Valor |
|---|---:|
| Costo esperado del proveedor A | 127.50 |
| Costo esperado del proveedor B | 127.25 |
| Costo esperado de producción interna | 130.00 |
| Alternativa por valor esperado | Proveedor B |
| Costo esperado con información perfecta | 116.25 |
| EVPI | 11.00 |
| Alternativa por minimax de arrepentimiento | Proveedor A |

### 4.3. Lanzamiento comercial

Objetivo: maximizar beneficios. Coeficiente de Hurwicz: 0.65.

| Alternativa | Muy favorable | Favorable | Estable | Adverso |
|---|---:|---:|---:|---:|
| Lanzamiento nacional | 260 | 150 | 55 | -110 |
| Lanzamiento regional | 170 | 115 | 70 | -25 |
| Prueba piloto | 90 | 80 | 60 | 25 |
| Probabilidad | 0.15 | 0.35 | 0.30 | 0.20 |

Resultados esperados:

| Resultado | Valor |
|---|---:|
| Valor esperado del lanzamiento nacional | 86.00 |
| Valor esperado del lanzamiento regional | 81.75 |
| Valor esperado de la prueba piloto | 64.50 |
| Alternativa por valor esperado | Lanzamiento nacional |
| Valor esperado con información perfecta | 117.50 |
| EVPI | 31.50 |
| Alternativa por minimax de arrepentimiento | Lanzamiento regional |

## 5. Decisiones — Decision Trees (Graphical)

En POM-QM abra `Decision Analysis > Decision Trees (Graphical)`. Registre primero las decisiones, después los eventos inciertos y finalmente sus pagos. Los valores escritos sobre una rama se acumulan con los valores posteriores.

### 5.1. Desarrollo y licencia

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

### 5.2. Reparar o reemplazar

Objetivo: minimizar costos.

```text
Decisión de mantenimiento
├── Reparar: 18
│   └── Resultado de la reparación
│       ├── Funciona: p = 0.70; costo adicional = 12
│       └── Falla nuevamente: p = 0.30; costo adicional = 48
└── Reemplazar: 52
```

Resolución esperada:

1. Costo esperado después de reparar: `0.70(12) + 0.30(48) = 22.80`.
2. Costo total de reparar: `18 + 22.80 = 40.80`.
3. Comparar reparar `40.80` con reemplazar `52.00`.
4. Estrategia recomendada: reparar.

### 5.3. Estudio de mercado

Objetivo: maximizar beneficios.

```text
Decisión inicial
├── Realizar estudio: -8
│   └── Resultado del estudio
│       ├── Favorable: p = 0.60
│       │   └── Lanzar: 120 / Abandonar: 0
│       └── Desfavorable: p = 0.40
│           └── Lanzar: -50 / Abandonar: 0
└── Omitir estudio
    └── Mercado
        ├── Alto: p = 0.45; beneficio = 100
        └── Bajo: p = 0.55; beneficio = -35
```

Resolución esperada:

1. Con informe favorable, elegir lanzar: `120`.
2. Con informe desfavorable, elegir abandonar: `0`.
3. Valor del estudio: `-8 + 0.60(120) + 0.40(0) = 64.00`.
4. Valor de omitir el estudio: `0.45(100) + 0.55(-35) = 25.75`.
5. Estrategia recomendada: realizar el estudio; lanzar solo si el resultado es favorable.

## Protocolo de comparación

1. Seleccione el modelo equivalente indicado en cada título.
2. Mantenga la misma interpretación de beneficios o costos.
3. Ingrese probabilidades como decimales y confirme que sumen uno.
4. Configure la misma cantidad de decimales en POM-QM.
5. Compare resultados intermedios antes del resultado final.
6. Si existe una diferencia menor, revise si POM-QM muestra valores redondeados aunque calcule con precisión interna.
