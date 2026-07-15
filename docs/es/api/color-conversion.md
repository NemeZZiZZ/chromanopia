# Conversión de color

Utilidades de parseo y conversión de color: parseo hex (3/4/6/8 dígitos), cadenas CSS `rgb()`/`rgba()`, conversiones de ida y vuelta HSL, y un coercer universal `toRgb()`.

Estas se exportan tanto para uso directo como porque las APIs de alto nivel ([`simulate()`](./simulate), [`simulatePalette()`](./simulate-palette), las [utilidades de accesibilidad](./accessibility)) aceptan cualquier forma de color al enrutarlas a través de `toRgb()`.

---

## toRgb()

Convierte (coerce) un color en cualquiera de las formas aceptadas a un objeto RGB. El punto de entrada universal utilizado por el resto de la API.

```ts
function toRgb(color: string | RGB | HSL): RGB
```

Acepta cadenas hex (`"#e63946"`, `"F00"`, `"#RRGGBBAA"`), cadenas CSS `rgb()`/`rgba()`, objetos HSL u objetos RGB (se devuelve como copia nueva).

### Ejemplos

```ts
import { toRgb } from 'chromanopia'

toRgb('#ff0000')                  // { r: 255, g: 0, b: 0 }
toRgb('rgb(230 57 70)')           // { r: 230, g: 57, b: 70 }
toRgb({ h: 120, s: 1, l: 0.5 })   // { r: 0, g: 255, b: 0 }
toRgb({ r: 10, g: 20, b: 30 })    // { r: 10, g: 20, b: 30 } (copia, no alias)
```

::: tip
Los objetos RGB se devuelven como copias, nunca la misma referencia, por lo que mutar el resultado es seguro.
:::

---

## parseCssColor()

Parsea una cadena de color CSS en un objeto RGB. De más bajo nivel que `toRgb()` — solo acepta cadenas.

```ts
function parseCssColor(css: string): RGB
```

Admite hex (3/4/6/8 dígitos, con o sin `#`) y `rgb()` / `rgba()` tanto en la sintaxis heredada con comas (`rgba(230, 57, 70, 0.5)`) como en la sintaxis moderna con espacios (`rgb(230 57 70 / 0.5)`). Los canales en porcentaje (`rgb(100%, 0%, 0%)`) son compatibles. El componente alfa se parsea pero no se devuelve (`RGB` no tiene alfa).

### Ejemplos

```ts
import { parseCssColor } from 'chromanopia'

parseCssColor('#e63946ff')              // { r: 230, g: 57, b: 70 } (8 dígitos, alfa descartado)
parseCssColor('rgb(230, 57, 70)')       // { r: 230, g: 57, b: 70 }
parseCssColor('rgba(230 57 70 / 0.5)')  // { r: 230, g: 57, b: 70 }
parseCssColor('rgb(100%, 0%, 0%)')      // { r: 255, g: 0, b: 0 }
```

Lanza un error en formatos no soportados (colores con nombre como `"red"`, cadenas `hsl()`, etc. no se admiten — conviértelos vía `hslToRgb()` primero para HSL).

---

## hexToRgb()

Parsea una cadena de color hex en un objeto RGB.

```ts
function hexToRgb(hex: string): RGB
```

Acepta `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA` (con o sin el `#` inicial). El componente alfa se parsea pero se descarta.

### Ejemplos

```ts
import { hexToRgb } from 'chromanopia'

hexToRgb('#e63946')   // { r: 230, g: 57, b: 70 }
hexToRgb('e63946')    // { r: 230, g: 57, b: 70 } (# opcional)
hexToRgb('#F00')      // { r: 255, g: 0, b: 0 }   (3 dígitos)
hexToRgb('#e63946ff') // { r: 230, g: 57, b: 70 } (8 dígitos, alfa descartado)
```

Lanza un `Error` con entrada inválida — se valida la cadena completa, por lo que cadenas parcialmente válidas como `#12gggg` se rechazan (sin parseo silencioso de prefijo vía `parseInt`).

---

## rgbToHex()

Convierte un objeto RGB en una cadena hex de 6 dígitos con prefijo `#`.

```ts
function rgbToHex(rgb: RGB): string
```

Los valores de los canales se ajustan a [0, 255] y se redondean.

### Ejemplos

```ts
import { rgbToHex } from 'chromanopia'

rgbToHex({ r: 230, g: 57, b: 70 }) // '#e63946'
rgbToHex({ r: 0, g: 0, b: 0 })     // '#000000'
rgbToHex({ r: 300, g: -5, b: 0 })  // '#ff0000' (ajustado)
rgbToHex({ r: 127.6, g: 0, b: 0 }) // '#800000' (redondeado)
```

---

## rgbToHsl()

Convierte un color RGB a HSL.

```ts
function rgbToHsl(rgb: RGB): HSL
```

Devuelve `{ h, s, l }` donde `h` es el tono en grados [0, 360) y `s`/`l` son la saturación y la luminosidad como fracciones en [0, 1].

### Ejemplos

```ts
import { rgbToHsl } from 'chromanopia'

rgbToHsl({ r: 255, g: 0, b: 0 })   // { h: 0,   s: 1, l: 0.5 } (rojo)
rgbToHsl({ r: 0, g: 255, b: 0 })   // { h: 120, s: 1, l: 0.5 } (verde)
rgbToHsl({ r: 0, g: 0, b: 255 })   // { h: 240, s: 1, l: 0.5 } (azul)
rgbToHsl({ r: 128, g: 128, b: 128 }) // { h: 0, s: 0, l: 0.5 } (gris → s: 0)
```

---

## hslToRgb()

Convierte un color HSL a RGB.

```ts
function hslToRgb(hsl: HSL): RGB
```

Un `h` fuera de rango se normaliza módulo 360; `s` y `l` se ajustan a [0, 1].

### Ejemplos

```ts
import { hslToRgb } from 'chromanopia'

hslToRgb({ h: 0,   s: 1, l: 0.5 }) // { r: 255, g: 0,   b: 0   } (rojo)
hslToRgb({ h: 120, s: 1, l: 0.5 }) // { r: 0,   g: 255, b: 0   } (verde)
hslToRgb({ h: 480, s: 1, l: 0.5 }) // { r: 0,   g: 255, b: 0   } (480° ≡ 120°)
hslToRgb({ h: 0,   s: 0, l: 0.5 }) // { r: 128, g: 128, b: 128 } (gris)
```

`rgbToHsl` y `hslToRgb` hacen una conversión de ida y vuelta exacta (error de canal en el peor de los casos: 0 dentro de la precisión de 8 bits).
