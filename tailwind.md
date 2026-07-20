# Guía de Referencia de Tailwind CSS

Manual de consulta para entender qué hace cada utilidad de Tailwind y cómo combinarlas correctamente al desarrollar.

---

## 1. Filosofía básica

Tailwind es **utility-first**: en vez de escribir CSS en un archivo aparte, compones clases pequeñas y de propósito único directamente en el `className`. Cada clase = una propiedad CSS (o un pequeño grupo de propiedades relacionadas).

```html
<div class="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md">
```

equivale a:

```css
display: flex;
align-items: center;
gap: 1rem;
padding: 1.5rem;
background-color: white;
border-radius: 0.5rem;
box-shadow: ...;
```

**Regla de oro:** el nombre de la clase casi siempre describe la propiedad CSS que aplica. Si sabes CSS, puedes adivinar la clase de Tailwind (`background-color` → `bg-`, `margin-top` → `mt-`, `font-size` → `text-`).

---

## 2. Anatomía de una clase

```
{prefijo-responsivo}:{prefijo-estado}:{utilidad}-{valor}
```

Ejemplo: `md:hover:bg-red-500`
- `md:` → aplica solo desde el breakpoint `md` (768px) hacia arriba
- `hover:` → aplica solo en estado hover
- `bg-red-500` → la utilidad y su valor

Los modificadores se pueden encadenar en cualquier combinación: `dark:md:hover:bg-red-500`.

---

## 3. Sistema de espaciado (spacing scale)

Casi todas las utilidades de tamaño (`p`, `m`, `gap`, `w`, `h`, `top`, `left`, etc.) comparten la misma escala numérica, basada en `rem` (1 unidad = 0.25rem = 4px):

| Clase | rem | px |
|---|---|---|
| `-0` | 0 | 0 |
| `-0.5` | 0.125rem | 2px |
| `-1` | 0.25rem | 4px |
| `-2` | 0.5rem | 8px |
| `-3` | 0.75rem | 12px |
| `-4` | 1rem | 16px |
| `-5` | 1.25rem | 20px |
| `-6` | 1.5rem | 24px |
| `-8` | 2rem | 32px |
| `-10` | 2.5rem | 40px |
| `-12` | 3rem | 48px |
| `-16` | 4rem | 64px |
| `-20` | 5rem | 80px |
| `-24` | 6rem | 96px |
| `-32` | 8rem | 128px |

Valores especiales: `px` = 1px exacto, `full` = 100%, `screen` = 100vw/100vh, `auto` = auto, `fit` = fit-content.

**Valores arbitrarios**: si ningún valor de la escala te sirve, usa corchetes: `w-[327px]`, `mt-[13px]`, `gap-[18px]`. Úsalo con moderación — rompe la consistencia del sistema de diseño.

---

## 4. Layout

### Display
```
block         → display: block
inline-block  → display: inline-block
inline        → display: inline
flex          → display: flex
inline-flex   → display: inline-flex
grid          → display: grid
inline-grid   → display: inline-grid
hidden        → display: none
contents      → display: contents
```

### Position
```
static | relative | absolute | fixed | sticky
top-0 / right-0 / bottom-0 / left-0 / inset-0
inset-x-0 (left+right) / inset-y-0 (top+bottom)
z-0 / z-10 / z-20 ... / z-50 / z-[valor]
```

### Overflow
```
overflow-auto | overflow-hidden | overflow-visible | overflow-scroll
overflow-x-auto / overflow-y-auto (por eje)
```

---

## 5. Flexbox

```
flex-row       → flex-direction: row (default)
flex-col       → flex-direction: column
flex-row-reverse / flex-col-reverse
flex-wrap      → permite salto de línea
flex-nowrap    → no permite salto de línea (default)

justify-start / justify-center / justify-end
justify-between / justify-around / justify-evenly
   → alinea en el eje principal (horizontal si flex-row)

items-start / items-center / items-end / items-stretch / items-baseline
   → alinea en el eje cruzado (vertical si flex-row)

gap-4          → espacio entre hijos (ambos ejes)
gap-x-4 / gap-y-4 → espacio por eje

flex-1         → flex: 1 1 0%  (crece y se encoge, ignora tamaño base)
flex-auto      → flex: 1 1 auto
flex-none      → flex: none (tamaño fijo, no crece ni encoge)
grow / grow-0  → flex-grow: 1 / 0
shrink / shrink-0 → flex-shrink: 1 / 0

self-start / self-center / self-end / self-stretch
   → alinea UN hijo individual, sobreescribe items-*
```

**Cuándo usar flex:** listas horizontales/verticales de elementos, navbars, filas de botones, centrar contenido.

---

## 6. Grid

```
grid-cols-1 ... grid-cols-12   → número de columnas iguales
grid-cols-[2fr_1fr_1fr]        → columnas arbitrarias con fracciones custom
grid-rows-1 ... grid-rows-6

col-span-1 ... col-span-12     → cuántas columnas ocupa un hijo
col-start-2 / col-end-4        → posición exacta

row-span-2
row-start-1 / row-end-3

gap-4 / gap-x-4 / gap-y-4      → igual que en flex

place-items-center             → align-items + justify-items juntos
place-content-center           → align-content + justify-content juntos
```

**Cuándo usar grid:** layouts bidimensionales (tarjetas en cuadrícula, dashboards, formularios con columnas), cuando necesitas controlar filas Y columnas a la vez.

---

## 7. Responsive design (breakpoints)

Tailwind es **mobile-first**: una clase sin prefijo aplica a TODOS los tamaños; los prefijos aplican desde ese ancho **hacia arriba** (min-width).

| Prefijo | Ancho mínimo | Uso típico |
|---|---|---|
| (ninguno) | 0px | Base, siempre aplica — diseña primero para móvil |
| `sm:` | 640px | Móvil grande / phablet |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Laptop |
| `xl:` | 1280px | Desktop |
| `2xl:` | 1536px | Pantallas grandes |

```html
<div class="flex flex-col md:flex-row gap-4 p-4 md:p-8">
```
→ columna apilada y padding chico en móvil; fila horizontal y padding grande desde tablet.

**Regla práctica:** escribe siempre la clase base (móvil) primero, y ve agregando prefijos solo donde algo deba cambiar. No repitas valores iguales en cada breakpoint.

También existe el prefijo inverso `max-*` (ej. `max-md:hidden`) para aplicar algo SOLO por debajo de un breakpoint, aunque es menos común.

---

## 8. Tipografía

```
text-xs   → 0.75rem (12px)
text-sm   → 0.875rem (14px)
text-base → 1rem (16px)     ← default
text-lg   → 1.125rem (18px)
text-xl   → 1.25rem (20px)
text-2xl  → 1.5rem (24px)
text-3xl  → 1.875rem (30px)
text-4xl  → 2.25rem (36px)
... hasta text-9xl

font-thin / font-light / font-normal / font-medium
font-semibold / font-bold / font-extrabold / font-black

italic / not-italic
underline / line-through / no-underline
uppercase / lowercase / capitalize / normal-case

leading-none / leading-tight / leading-snug / leading-normal
leading-relaxed / leading-loose
   → line-height (interlineado)

tracking-tighter / tracking-tight / tracking-normal
tracking-wide / tracking-wider / tracking-widest
   → letter-spacing (espaciado entre letras)

text-left / text-center / text-right / text-justify

truncate         → corta texto con "..." en una línea
line-clamp-2      → limita a N líneas con "..." al final
break-words       → permite cortar palabras largas
whitespace-nowrap → evita que el texto salte de línea
```

**Tipografía fluida sin breakpoints**: `clamp()` en un valor arbitrario permite que el tamaño escale suavemente según el ancho de pantalla sin necesitar `sm:`/`md:`/`lg:` repetidos:
```html
<h1 class="text-[clamp(2rem,5vw,4rem)]">
```

---

## 9. Colores

Todos los colores de la paleta siguen el patrón `{utilidad}-{color}-{intensidad}`, con intensidad de `50` (casi blanco) a `950` (casi negro):

```
bg-blue-500      → background-color
text-blue-500    → color (texto)
border-blue-500  → border-color
fill-blue-500    → fill (SVG)
stroke-blue-500  → stroke (SVG)
ring-blue-500    → color del ring (outline simulado)
```

Colores base incluidos: `slate, gray, zinc, neutral, stone, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose`, más `black`, `white`, `transparent`, `current`.

**Opacidad de color** con barra `/`:
```
bg-black/50      → background-color: black con 50% de opacidad
text-white/80    → texto blanco al 80% de opacidad
border-red-500/30
```

**Colores custom del proyecto**: se definen en `globals.css` (Tailwind v4, con `@theme`) o en `tailwind.config.ts` (v3), y luego se usan igual que los de la paleta: `bg-mi-color`, `text-mi-color`.

---

## 10. Bordes y radios

```
border          → border-width: 1px en los 4 lados
border-2 / border-4 / border-8
border-t / border-r / border-b / border-l  → un solo lado
border-x / border-y                          → dos lados opuestos

border-solid / border-dashed / border-dotted / border-none

rounded-none | rounded-sm | rounded | rounded-md
rounded-lg | rounded-xl | rounded-2xl | rounded-3xl | rounded-full

rounded-t-lg / rounded-r-lg / rounded-b-lg / rounded-l-lg  → esquinas por lado
rounded-tl-lg / rounded-tr-lg / etc.                        → esquina individual
```

---

## 11. Sombras y efectos

```
shadow-sm / shadow / shadow-md / shadow-lg / shadow-xl / shadow-2xl
shadow-inner   → sombra hacia adentro
shadow-none

opacity-0 ... opacity-100 (pasos de 5 o 10)

blur-sm / blur / blur-md / blur-lg    → filter: blur()
backdrop-blur-sm / backdrop-blur-md    → blur del fondo detrás del elemento (glassmorphism)

grayscale / grayscale-0
brightness-50 / brightness-100 / brightness-150
```

---

## 12. Transiciones y animaciones

```
transition            → transiciona propiedades comunes (color, bg, border, opacity, shadow, transform)
transition-all         → transiciona TODO (más costoso en rendimiento)
transition-colors       → solo colores
transition-transform    → solo transform
transition-opacity      → solo opacidad

duration-150 / duration-200 / duration-300 / duration-500 / duration-700 / duration-1000
   → duración en ms

ease-linear / ease-in / ease-out / ease-in-out
delay-100 / delay-200 ...

animate-spin    → rotación infinita (loaders)
animate-ping    → pulso expansivo
animate-pulse   → parpadeo suave
animate-bounce  → rebote
```

Se usan casi siempre junto con estados (`hover:`, `focus:`) para crear transiciones suaves:
```html
<button class="bg-blue-500 hover:bg-blue-700 transition-colors duration-200">
```

---

## 13. Transform

```
scale-95 / scale-100 / scale-105 / scale-110  → escala uniforme
scale-x-100 / scale-y-100                       → escala por eje

rotate-0 / rotate-45 / rotate-90 / rotate-180
translate-x-4 / translate-y-4 / -translate-x-4 (negativo)
skew-x-6 / skew-y-6

origin-center / origin-top / origin-bottom-left  → punto de origen de la transformación
```

Requieren la clase `transform` en Tailwind v2; en v3+ se activan automáticamente al usar cualquier utilidad `scale-*`, `rotate-*`, etc.

---

## 14. Estados e interactividad (modificadores)

Se anteponen a la utilidad con `:`:

```
hover:bg-blue-700        → al pasar el mouse
focus:ring-2              → al enfocar (inputs, botones)
focus-visible:outline-none → foco solo por teclado
active:scale-95            → mientras se hace click
disabled:opacity-50        → cuando el elemento está disabled
visited:text-purple-600    → link visitado

group-hover:opacity-100   → hijo reacciona al hover del padre (padre necesita clase `group`)
peer-checked:block         → un elemento reacciona al estado de su "hermano" (hermano necesita clase `peer`)

first:mt-0 / last:mb-0 / odd:bg-gray-50 / even:bg-white
   → según posición entre hermanos

dark:bg-gray-900 / dark:text-white
   → cuando el modo oscuro está activo (según configuración: por clase o por preferencia del sistema)
```

Ejemplo de patrón `group`:
```html
<div class="group">
  <img class="opacity-0 group-hover:opacity-100 transition-opacity" />
</div>
```

---

## 15. Tamaño y contenedores

```
w-full / w-screen / w-fit / w-min / w-max
h-full / h-screen / h-fit / h-min / h-max
min-w-0 / min-h-screen
max-w-xs / max-w-sm / max-w-md / max-w-lg / max-w-xl / max-w-2xl ... max-w-7xl
max-w-full / max-w-screen-lg
max-w-prose   → ancho óptimo para lectura de texto largo (~65 caracteres)

container     → ancho máximo que cambia según el breakpoint activo, centrado con mx-auto
```

Patrón típico para centrar contenido con márgenes laterales responsivos:
```html
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
```

---

## 16. Espaciado entre hijos sin flex/grid

```
space-x-4   → margin-left entre elementos hermanos horizontales (excepto el primero)
space-y-4   → margin-top entre elementos hermanos verticales (excepto el primero)
divide-y     → agrega border-top entre hermanos (útil para listas)
divide-gray-200
```
Nota: en layouts modernos, `gap-*` dentro de `flex`/`grid` suele ser preferible a `space-*` porque `gap` no dejó de comprimirse raro en `flex-wrap`.

---

## 17. Sizing y aspect ratio

```
aspect-square   → aspect-ratio: 1/1
aspect-video    → aspect-ratio: 16/9
aspect-[4/3]    → ratio arbitrario
object-cover / object-contain / object-fill / object-none
   → cómo se ajusta una imagen/video dentro de su contenedor (junto con w-* h-*)
```

---

## 18. Accesibilidad y utilidades especiales

```
sr-only          → oculta visualmente pero visible para lectores de pantalla
not-sr-only       → revierte sr-only
pointer-events-none / pointer-events-auto
select-none        → evita que el usuario seleccione texto
cursor-pointer / cursor-not-allowed / cursor-wait
```

---

## 19. Valores arbitrarios (escape hatch)

Cuando la escala de Tailwind no tiene lo que necesitas, usa corchetes `[]` con cualquier valor CSS válido:

```
w-[327px]
bg-[#1a2b3c]
text-[15px]
grid-cols-[repeat(3,minmax(0,1fr))]
top-[calc(100%-1rem)]
```

También funciona con propiedades CSS arbitrarias completas si Tailwind no tiene utilidad para algo:
```
[mask-type:luminance]
```

**Úsalo como último recurso** — abusar de valores arbitrarios pierde la consistencia que da la escala predefinida (por eso siempre que puedas, prefiere `p-4` sobre `p-[17px]`).

---

## 20. Organización recomendada de clases

Orden sugerido al escribir un `className` largo (no es obligatorio, pero mejora la lectura):

1. Layout (`flex`, `grid`, `block`)
2. Posicionamiento (`relative`, `absolute`, `inset-*`, `z-*`)
3. Box model (`w-*`, `h-*`, `p-*`, `m-*`, `gap-*`)
4. Tipografía (`text-*`, `font-*`, `leading-*`, `tracking-*`)
5. Fondo y bordes (`bg-*`, `border-*`, `rounded-*`)
6. Efectos (`shadow-*`, `opacity-*`)
7. Transiciones (`transition-*`, `duration-*`)
8. Estados (`hover:`, `focus:`, `disabled:`)
9. Responsive (`sm:`, `md:`, `lg:`) — normalmente se intercalan junto a la utilidad que modifican, no al final

---

## 21. Buenas prácticas generales

- **Mobile-first siempre**: escribe primero cómo se ve en el celular, agrega breakpoints solo cuando algo deba cambiar en pantallas más grandes.
- **Prefiere la escala sobre valores arbitrarios** para mantener consistencia visual en todo el proyecto.
- **`gap` en vez de márgenes manuales** entre elementos de un `flex`/`grid`.
- **Extrae componentes repetidos**, no clases repetidas: si el mismo combo de 15 clases se repite en 5 lugares, conviene un componente reutilizable (React/Vue/etc.) en vez de copiar el `className`.
- **`clamp()` para tipografía/espaciados que deban escalar suavemente** sin saltos bruscos entre breakpoints.
- **No mezcles `style={{}}` con Tailwind para lo mismo** — si algo se puede expresar en clases, hazlo en clases; reserva `style` inline para valores calculados dinámicamente en JS o CSS que Tailwind no cubre (gradientes muy complejos, `clip-path`, animaciones con keyframes custom).
