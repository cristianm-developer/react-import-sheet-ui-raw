# Step 5 — Core Visual: Tabla de Datos (Grid & Edit)

Plan para implementar la **estructura de tabla** que muestra y edita los datos del resultado: contenedor, cabeceras, cuerpo virtualizado, filas, celdas y badge de errores. Basado en la propuesta Gemini: RawDataTable, RawTableHead, RawTableBody, RawTableRow, RawTableCell, RawErrorBadge.

---

## 1. Objetivo

Implementar la jerarquía de componentes Raw que forman la **tabla de datos** (vista RESULT):

| Componente | Responsabilidad |
|------------|-----------------|
| **RawDataTable** | Contenedor principal `<table>`. Gestiona **Roaming Tabindex** (navegación con flechas). Parámetro **editingEnabled** (desde contexto/Root) para activar/desactivar edición. |
| **RawTableHead** | Renderiza los headers definidos en el **Layout** (ids y labels de columnas). |
| **RawTableBody** | Cuerpo. **getRowProps** devuelve **isRowLoading/isPlaceholder** para fila skeleton; virtualización por el consumidor. |
| **RawTableRow** | Fila. **getRowProps({ index, style })** inyecta **style** + **onKeyDown** para A11y (ArrowDown/Up/Left/Right mueven el foco). Expone **row.errors**. |
| **RawTableCell** | Celda. **Render prop** **children: (state) => ReactNode** (state: isEditing, value, getEditInputProps, errors, pending) para input/datepicker/checkbox custom. Optimistic update, data-pending, aria-invalid. Si **editingEnabled** es false, solo lectura. |
| **RawErrorBadge** | Slot para SheetError.code + I18n. |

Estos componentes no definen estilos; solo estructura HTML, semántica y conexión con el Core. Siguen **prop-getters** donde aplique (p. ej. getCellProps, getErrorProps en RawTableCell). Se usan dentro del slot **renderResult** de RawStatusGuard (o en RawImporterWorkflow).

**Tu propia tabla:** El usuario puede prescindir de RawDataTable/RawTableBody/etc. y construir su propio grid usando los **hooks reexportados** (**useSheetData**, **getRows**, **useSheetEditor** con editCell). Los componentes Raw de esta fase son opcionales.

---

## 2. Contrato con el Headless

Referencia: [ai-context del headless](https://github.com/cristianm-developer/react-import-sheet-headless/blob/main/ai-context.md).

- **SheetLayout**: estructura (ids de columnas, labels, tipos) para RawTableHead y alinear columnas con RawTableCell.
- **Datos**: **useSheetData()** (o equivalente) — resultado final; acceso a filas y valores.
- **Virtualización**: **getRows(offset, limit)** o **getRows(index, 1)** (o API equivalente) y **totalRowCount** desde el Core. La Raw **no** implementa la ventana de scroll; expone getRowProps para que el consumidor use su propia lib (ej. @tanstack/react-virtual).
- **Edición**: **editCell** (de **useSheetEditor()** o similar): actualizar valor por (rowIndex, fieldId o colIndex). Validación asíncrona (Worker); la Raw soporta estado **pending** (data-pending) y **error** (aria-invalid) sin integrar librerías.
- **Errores**: **row.errors** (o equivalente por fila/celda); tipo **SheetError** (code, params) para RawTableRow (estado de fila) y RawErrorBadge (contenido para I18n).

Definir en `src/shared/types/` los tipos que reflejen ese contrato.

---

## 3. Checklist de tareas

### 3.1 Estructura de carpetas

- [ ] Bajo `src/components/` crear:
  - [ ] **`RawDataTable/`** — contenedor `<table>`.
  - [ ] **`RawTableHead/`** — cabeceras desde SheetLayout.
  - [ ] **`RawTableBody/`** — cuerpo que expone getRowProps + getRows/totalRowCount para virtualización por el consumidor (sin libs propias).
  - [ ] **`RawTableRow/`** — fila; row.errors.
  - [ ] **`RawTableCell/`** — celda lectura/edición + editCell.
  - [ ] **`RawErrorBadge/`** — slot SheetError.code + I18n.
- [ ] Cada componente en su carpeta con: `RawX.tsx`, `index.ts`; opcionalmente `RawX.test.tsx`, `types.ts`.

### 3.2 RawDataTable

- [ ] **Props**: `className?`, `style?`; **children** (ReactNode: RawTableHead + RawTableBody). Opcionalmente **layout** si no lo leen del contexto. Respetar **editingEnabled** del contexto (Root): si false, tabla solo lectura (no modo edición).
- [ ] **A11y (Roaming Tabindex)**: RawDataTable o RawTableBody gestionan la navegación por teclado; **getRowProps** o **getCellProps** inyectan **onKeyDown** para que ArrowDown/Up/Left/Right muevan el foco a la celda correspondiente. Documentar en ai-context el comportamiento (tabindex, orden de celdas).
- [ ] **Semántica**: `<table>` como raíz. `data-ris-ui="raw-data-table"`. forwardRef al `<table>`.
- [ ] **Export**: desde RawDataTable/index.ts y reexport en src/index.ts.

### 3.3 RawTableHead

- [ ] **Props**: `className?`, `style?`; **layout** opcional si no se obtiene del contexto. Slot opcional por celda de cabecera.
- [ ] **Comportamiento**: renderizar `<thead>` y una fila con `<th>` por cada columna del **SheetLayout** (id, label).
- [ ] **Identificación**: `data-ris-ui="raw-table-head"`. Ref al `<thead>`.
- [ ] **Export**: desde RawTableHead/index.ts y reexport en src/index.ts.

### 3.4 RawTableBody

- [ ] **Principio:** La Raw **no** itera sobre un array gigante ni integra @tanstack/react-virtual ni ninguna lib de virtualización. Expone un **contrato estándar** para que el consumidor integre la virtualización que prefiera.
- [ ] **Props**: `className?`, `style?`; **children** (render prop o nodos). Opcional **onNavigateToIndex?(index: number)** (o ref/API para que el consumidor registre `scrollToIndex`) para que el Raw, al manejar onKeyDown en el borde de la ventana virtual, pueda pedir al virtualizador del consumidor que haga scroll a ese índice y así la siguiente fila se renderice y reciba el foco. Exponer desde un hook o contexto del cuerpo:
  - **getRowProps({ index: number, style?: React.CSSProperties })**: devuelve props para `<RawTableRow>` (o `<tr>`): fusiona **style** (height, transform); usa **index** para pedir la fila al Core; inyecta **onKeyDown** para A11y. Debe devolver también **isRowLoading** o **isPlaceholder** (boolean): cuando el Core tarda en entregar la fila (scroll rápido), el consumidor puede pintar fila skeleton (`[data-placeholder="true"]`). Incluir **data-ris-ui**, ref, etc.
  - **totalRowCount** (o **getTotalCount()**): número total de filas (desde el Core).
  - **getRow(index)** (opcional): exponer getRows del Core o wrapper.
- [ ] **Comportamiento**: RawTableBody es un contenedor `<tbody>` (o equivalente) que **no** hace map sobre todas las filas. El consumidor hace algo como: `virtualRows.map(virtualRow => <RawTableRow key={...} {...getRowProps({ index: virtualRow.index, style: { height: ..., transform: ... } })} />)`. El getter inyecta los estilos de posicionamiento y mantiene la lógica de errores/selección intacta.
- [ ] **Foco en celdas virtualizadas (fine-tuning)**: Cuando el usuario navega con flechas y **llega al borde de la ventana virtual**, la siguiente fila puede no existir aún en el DOM. RawTableBody debe asegurarse de **disparar el scroll** (o notificar al virtualizador) para que esa fila se renderice y reciba el foco. El **onKeyDown** inyectado por el Raw debe poder **comunicarse con el virtualizador del consumidor**: p. ej. callback **onNavigateToIndex?(index)** que el consumidor pasa y que hace scroll a ese índice en su lib (react-virtual, etc.), o una ref/API para que el virtualizador registre `scrollToIndex`. Documentar en ai-context esta coordinación.
- [ ] **Identificación**: `data-ris-ui="raw-table-body"`. Ref al `<tbody>` o contenedor.
- [ ] **Export**: desde RawTableBody/index.ts y reexport en src/index.ts.
- [ ] **Documentar en ai-context.md**: ejemplo de uso con @tanstack/react-virtual (o similar) en el lado del consumidor; la lib no incluye esa dependencia.

### 3.5 RawTableRow

- [ ] **Props**: puede recibir **row** y **rowIndex**, o todo vía **getRowProps({ index, style })** de RawTableBody. **getRowProps** debe inyectar **onKeyDown** para navegación con teclado (ArrowDown/Up/Left/Right) — Roaming Tabindex; el Raw gestiona el movimiento del foco entre celdas.
- [ ] **Comportamiento**: renderizar `<tr>`. **getRowProps** inyecta: **style** (height, transform), **onKeyDown** (A11y), **data-has-errors** según row.errors, **data-placeholder** si isPlaceholder/isRowLoading. Permitir merge de className/style del consumidor.
- [ ] **Identificación**: `data-ris-ui="raw-table-row"`. Ref al `<tr>`.
- [ ] **Export**: desde RawTableRow/index.ts y reexport en src/index.ts.

### 3.6 RawTableCell

- [ ] **Render prop (política de Slots)**: aceptar **children** como función **(state) => ReactNode**. **state** incluye: **isEditing**, **value**, **getEditInputProps()**, **errors**, **pending**. Si el usuario pasa children, renderizar el resultado (p. ej. input custom, datepicker, checkbox); si no, usar render por defecto (input nativo en edición, span en lectura). Ejemplo: `<RawTableCell>{(state) => state.isEditing ? <MyCustomInput {...state.getEditInputProps()} /> : <span>{state.value}</span>}</RawTableCell>`.
- [ ] **Props**: `className?`, `style?`; **value**; **rowIndex**, **fieldId**; **editCell** (Core); **errors** opcional; **pending?**. Respetar **editingEnabled** del contexto: si false, solo modo lectura (no entrar en edición).
- [ ] **Prop-getters**: **getCellProps({ className?, style? })** para el `<td>`: **data-pending="true"** cuando validando, **aria-invalid** cuando hay error; **getErrorProps()** para RawErrorBadge. **getEditInputProps()** para el input (cuando se usa render prop custom).
- [ ] **Optimistic update**: al editar, mostrar el nuevo valor de inmediato; llamar a editCell; exponer pending en getCellProps.
- [ ] **Identificación**: `data-ris-ui="raw-cell"`. Ref al `<td>` o al input en edición.
- [ ] **Export**: desde RawTableCell/index.ts y reexport en src/index.ts. Sin integrar spinners; solo data-pending, aria-invalid.

### 3.7 RawErrorBadge

- [ ] **Props**: `className?`, `style?`; **error** (SheetError: **code** + params); **translateError?** (función (code, params) => string) para I18n del usuario. **children** o slot opcional que recibe **{ code, params }** para que el consumidor renderice el mensaje.
- [ ] **Comportamiento**: slot pequeño que expone **SheetError** (code y params). Si se pasa **translateError**, puede mostrarse el texto traducido; si no, solo estructura/datos para que el consumidor use children/slot. No incluir textos fijos; solo estructura y datos.
- [ ] **Identificación**: `data-ris-ui="raw-error-badge"`.
- [ ] **Export**: desde RawErrorBadge/index.ts y reexport en src/index.ts.

### 3.8 Tests

- [ ] RawDataTable / RawTableHead / RawTableBody: render con layout; RawTableBody expone getRowProps y totalRowCount; test donde el consumidor simula virtualRows y usa getRowProps({ index, style }).
- [ ] RawTableRow: row.errors expuesto en atributo/dato.
- [ ] RawTableCell: modo lectura muestra value; modo edición llamada a editCell y actualización optimista; getCellProps devuelve data-pending cuando pending y aria-invalid cuando hay error; getErrorProps; errores con RawErrorBadge.
- [ ] RawErrorBadge: render con error (code, params); translateError o slot reciben code y params.

### 3.9 Storybook

- [ ] RawDataTable: story con RawTableHead + RawTableBody, pocas filas; otra donde el consumidor usa getRowProps con índices/estilos simulados (ej. virtualización) para muchas filas.
- [ ] RawTableCell: lectura; edición con actualización optimista; estado pending (data-pending) y error (aria-invalid); ejemplo de prop-getters y Tailwind `[data-pending="true"]`.
- [ ] RawErrorBadge: SheetError de ejemplo; slot y translateError.

### 3.10 Documentación

- [ ] Actualizar **ai-context.md**: RawDataTable (A11y Roaming Tabindex, editingEnabled), RawTableHead, RawTableBody (getRowProps con isPlaceholder, totalRowCount, virtualización), RawTableRow (onKeyDown, data-placeholder), RawTableCell (**render prop** children(state), getCellProps, getEditInputProps, data-pending, aria-invalid), RawErrorBadge. Ejemplo render prop y placeholder/skeleton.
- [ ] Actualizar **Architecture.md**: Step 5 y lista de componentes Raw de la tabla.

---

## 4. Orden sugerido de ejecución

1. Confirmar en el headless: SheetLayout, getRows(page, limit), useSheetData, useSheetEditor (editCell), row.errors, SheetError. Tipos en src/shared/types/.
2. Implementar RawDataTable y RawTableHead (estructura estática con layout).
3. Implementar RawTableBody: exponer getRowProps({ index, style }), totalRowCount (y/o getRows) desde el Core; sin iterar arrays gigantes ni integrar libs de virtualización.
4. Implementar RawTableRow (getRowProps inyecta style + index → fila del Core; row.errors).
5. Implementar RawTableCell (lectura; edición con optimistic update, pending → data-pending, error → aria-invalid; getCellProps/getErrorProps).
6. Implementar RawErrorBadge (SheetError + translateError/slot).
7. Tests, Storybook, ai-context.md y Architecture.md.

---

## 5. Notas

- **Virtualización**: La Raw **no** integra @tanstack/react-virtual ni ninguna librería. RawTableBody expone **getRowProps** y **totalRowCount** (o getRows) para que el **consumidor** integre la virtualización. getRowProps acepta **index** (para pedir la fila al Core) y **style** (height, transform) que el consumidor calcula con su lib; el Raw solo fusiona y aplica. Compatibilidad estándar sin dependencias.
- **Optimistic UI y pending**: RawTableCell muestra el valor de forma optimista al editar. Mientras el Worker valida, el Core (o el estado local) indica "pending" y getCellProps devuelve **data-pending="true"**; al terminar, **data-pending="false"** y **aria-invalid** si hay error. El consumidor estiliza con CSS/Tailwind (p. ej. `[data-pending="true"]`); la Raw no incluye spinners ni librerías.
- **RawTableCell**: **render prop** children(state) para input/datepicker/checkbox custom; state incluye isEditing, value, getEditInputProps, errors, pending. Si no se pasa children, render por defecto. getCellProps (data-pending, aria-invalid), getErrorProps. Respetar **editingEnabled** (solo lectura si false).
- **Placeholder/skeleton**: getRowProps devuelve **isPlaceholder** o **isRowLoading** para fila skeleton mientras llegan datos; el consumidor usa `[data-placeholder="true"]` en Tailwind.
- **RawErrorBadge**: no traduce por defecto; el consumidor pasa **translateError** o usa el slot con { code, params } para I18n.
- **Fine-tuning A11y + virtualización**: Al implementar el Step 5 (A11y Grid), tener en cuenta el **foco en celdas virtualizadas**. Cuando el usuario navega con flechas y llega al **borde de la ventana virtual**, la siguiente fila puede no existir aún en el DOM. RawTableBody debe asegurarse de disparar el scroll (o que el consumidor pueda hacerlo) para que esa fila se renderice y reciba el foco. El **onKeyDown** del Raw debe poder **comunicarse con el virtualizador del consumidor** (p. ej. callback **onNavigateToIndex(index)** o API/ref para `scrollToIndex`). Documentar en ai-context la coordinación Raw ↔ virtualizador.
- Convención Raw: forwardRef, data-ris-ui, className y style en todos los componentes.
