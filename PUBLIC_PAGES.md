# Páginas Públicas — LMFF Scoring

Descripción de las páginas visibles para los usuarios de la **Liga Metropolitana de Flag Football**.

---

## Navegación General

Todas las páginas públicas comparten un layout con:

- **Navbar superior** (fondo azul oscuro `#1B3C73`): logo de la LMFF + 4 enlaces de navegación (Inicio, Posiciones, Resultados, Estadísticas). En móvil se colapsa en un menú hamburguesa con drawer lateral. Si hay múltiples ligas disponibles, aparece un selector de liga.
- **Footer**: texto "Liga Metropolitana de Flag Football — Caracas, Venezuela © [Año]".

---

## 1. Inicio (`/`)

Página de bienvenida de la liga.

| Elemento | Detalle |
|----------|---------|
| **Título** | "Liga Metropolitana de Flag Football" |
| **Subtítulo** | "Caracas, Venezuela — Resultados, posiciones y más" |
| **Contenido** | Dos tarjetas centradas en un grid responsivo |

### Tarjetas de acceso rápido

| Tarjeta | Icono | Destino |
|---------|-------|---------|
| **Tabla de Posiciones** | `OrderedListOutlined` | `/standings` |
| **Resultados** | `TrophyOutlined` | `/results` |

Las tarjetas tienen efecto hover y al hacer clic navegan a la sección correspondiente. No carga datos del servidor; es enteramente estática.

---

## 2. Posiciones (`/standings`)

Muestra la tabla de clasificación de los equipos.

**Rutas disponibles:**
- `/standings` — Torneo activo por defecto
- `/standings/:tournamentId` — Torneo específico

### Filtros

| Filtro | Descripción |
|--------|-------------|
| **Selector de torneo** | Dropdown para elegir entre torneos disponibles |
| **Filtro por jornada** | Dropdown opcional para ver posiciones acumuladas hasta una jornada específica |

### Tabla de posiciones (Desktop)

| Columna | Significado |
|---------|-------------|
| `#` | Posición / Ranking |
| **Equipo** | Logo (avatar) + nombre del equipo |
| **JJ** | Juegos jugados |
| **JG** | Juegos ganados |
| **JE** | Juegos empatados |
| **JP** | Juegos perdidos |
| **PF** | Puntos a favor (solo desktop) |
| **PC** | Puntos en contra (solo desktop) |
| **Dif** | Diferencia de puntos (solo desktop) |
| **Pts** | Puntos de clasificación (resaltado en azul) |

### Vista Móvil

En pantallas pequeñas, la tabla se reemplaza por una **lista de tarjetas** que muestra la posición, equipo, puntos (badge) y estadísticas clave.

### Datos en tiempo real

La página se suscribe a Firestore para recibir **actualizaciones en tiempo real** de las posiciones.

---

## 3. Resultados (`/results`)

Muestra los resultados de partidos organizados por jornada.

**Rutas disponibles:**
- `/results` — Última jornada completada o en curso
- `/results/:tournamentId` — Torneo específico
- `/results/:tournamentId/:matchdayId` — Jornada específica

### Filtros y Navegación

| Control | Descripción |
|---------|-------------|
| **Selector de torneo** | Dropdown para cambiar de torneo |
| **Navegación de jornadas** | Flechas Anterior/Siguiente + selector de jornada |
| **Selector de jornada (desktop)** | Tags/chips inline con scroll horizontal |
| **Selector de jornada (móvil)** | Dropdown compacto |

> Al cambiar de torneo, la selección de jornada se reinicia automáticamente. Por defecto se selecciona la última jornada completada o en curso.

### Tarjetas de partido

Cada partido se muestra en una tarjeta centrada (max 600px) con el siguiente formato:

```
[ Equipo Local ]   Marcador   [ Equipo Visitante ]
   Avatar + Nombre    2 : 1      Avatar + Nombre
                    ✓ Final
```

| Estado | Badge | Color |
|--------|-------|-------|
| **Completado** | ✓ Final | Verde |
| **Programado** | ⏱ Programado | Azul |

Si no hay partidos para la jornada seleccionada, se muestra un estado vacío.

### Información por partido

- Nombre y logo de ambos equipos (local y visitante)
- Marcador (si el partido fue completado)
- Estado del partido
- Fecha, hora y sede (si aplica)

---

## 4. Estadísticas (`/stats`)

Muestra las estadísticas individuales de los jugadores en formato de tabla.

**Rutas disponibles:**
- `/stats` — Torneo activo
- `/stats/:tournamentId` — Torneo específico

### Filtros

| Filtro | Descripción |
|--------|-------------|
| **Selector de torneo** | Dropdown en el encabezado para cambiar de torneo |

### Tabla de estadísticas

Tabla de ancho completo (max 1100px) con scroll horizontal en móvil.

| Columna | Significado | Ordenable |
|---------|-------------|-----------|
| `#` | Posición (calculada) | — |
| **Jugador** | Avatar con número + nombre (negrita) + equipo (texto secundario) | — |
| **TDs** | Touchdowns totales (Pase + Recepción + Defensa) — tag dorado si > 0 | ✓ |
| **Comp** | Pases completados | ✓ |
| **Inc** | Pases incompletos | ✗ |
| **Cor** | Corridas (rushes) | ✓ |
| **Rec** | Recepciones | ✓ |
| **Flags** | Flag pulls (banderas arrancadas) | ✓ |
| **Sacks** | Capturas al QB | ✓ |
| **INT** | Intercepciones | ✓ |
| **PB** | Pases bloqueados | ✗ |

> Por defecto, la tabla se ordena por **TDs de mayor a menor**.

---

## Diseño y UX

| Aspecto | Implementación |
|---------|----------------|
| **Responsividad** | Mobile-first con breakpoints en `xs`, `sm`, `md` |
| **Estados de carga** | Spinner centrado (`<Spin>`) mientras se obtienen datos |
| **Estados vacíos** | Componente `<EmptyState>` cuando no hay datos |
| **Paleta de colores** | Azul oscuro primario (`#1B3C73`), verde (éxito), rojo (derrota) |
| **Navegación fluida** | Navbar sticky, layout persistente entre rutas |
| **Contexto compartido** | Torneo y liga seleccionados se mantienen al navegar entre páginas |
| **Lazy loading** | Todas las páginas se cargan bajo demanda con `Suspense` + spinner de fallback |
