# Sparrow

Sistema de memorización gamificada con diseño Duolingo dark theme. Entrena tu memoria con tarjetas interactivas, modo flashcard con comparación en tiempo real, y múltiples conjuntos de datos.

## Módulos

| Módulo | Descripción | Configurable |
|--------|-------------|:---:|
| **1-100** | Sistema mnemotécnico peg (número → palabra) | — |
| **Deck** | Baraja de 52 cartas con palabras asociadas por palo | Cantidad |
| **Numbers** | Dígitos aleatorios agrupados en pares | Cantidad, Desde, Hasta |
| **Binario** | Dígitos binarios (0/1) aleatorios agrupados en pares | Cantidad |
| **ABC** | Letras del abecedario español (27 letras) | — |
| **Cirilico** | Alfabeto ruso (33 letras) | — |
| **Cantidades** | Números cardinales | — |
| **Meses** | Meses del año | — |
| **Personal** | Importación de listas personalizadas (textarea) | Textarea |
| **Instrucciones** | Tabla del sistema fonético (0–9 → consonantes) | — |

## Modos de juego

- **Training**: ciclo continuo automático a la velocidad configurada
- **Recall**: modo flashcard interactivo
  - Muestra tarjeta → oculta con `?` → escribe tu respuesta → presiona **COMPARAR**
  - Comparación flexible (case-insensitive, ignora espacios)
  - Correcto: tarjeta verde + pausa automática
  - Incorrecto: tarjeta roja con respuesta correcta + tu respuesta
  - Botón unificado **COMPARAR / NEXT** según el estado

## Controles

- **Orden / Aleatorio**: secuencial o aleatorio
- **Training / Recall**: modo de juego
- **Velocidad**: input numérico con flechas (±0.10s por paso), rango 0.001s a 5m
- **Tamaño de fuente**: botones `−` `+` en pasos de 0.5em (0–14em)
- **Cronómetro**: `HH:MM:SS:CC` con centésimas de segundo
- **Reloj**: hora actual en tiempo real

## Instalación

Clona el repositorio y abre `memory-plus-plus.html` en cualquier navegador. No requiere dependencias, servidor ni build.

```
git clone <repo-url> Sparrow
cd Sparrow
open memory-plus-plus.html
```

## Estructura del proyecto

```
Sparrow/
├── memory-plus-plus.html   # HTML principal
├── css/
│   └── style.css           # Estilos Duolingo dark theme
├── js/
│   └── script.js           # Lógica de la aplicación
└── synaptic.svg            # Logo
```

## Stack

HTML5, CSS3 (custom properties, flexbox), JavaScript vanilla. Sin frameworks ni dependencias externas (excepto Google Fonts Nunito).
