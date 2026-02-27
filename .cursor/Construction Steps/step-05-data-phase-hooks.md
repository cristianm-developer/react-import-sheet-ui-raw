# Step 5 — Data Phase (hooks y prop-getters: grid y edición)

Plan para implementar los **hooks** que exponen la tabla de datos del resultado: cabeceras del Layout, filas con getRowProps (virtualización por el consumidor), celdas con getCellProps/getEditInputProps (lectura/edición, data-pending, aria-invalid), y slot para errores (SheetError + I18n). Roaming Tabindex (A11y) y **editingEnabled** desde contexto. Los wrappers (RawDataTable, RawTableHead, RawTableBody, RawTableRow, RawTableCell, RawErrorBadge) son opcionales y solo consumen estos hooks.

---

## 1. Objetivo

Implementar los **hooks** que forman la **tabla de datos** (vista RESULT); entregables principales son hooks con **prop-getters**:

| Hook                 | Responsabilidad                                                                                                                                                                     | Prop-getters / retorno                                                                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **useRawDataTable**  | Contenedor lógico; Roaming Tabindex (navegación con flechas). Parámetro **editingEnabled** (contexto/Root).                                                                         | Estado y contexto para useRawTableBody/useRawTableRow/useRawCell; no impone markup.                                                                        |
| **useRawTableHead**  | Cabeceras del **Layout** (ids y labels de columnas).                                                                                                                                | **headers** (array { id, label }) para que el consumidor renderice `<th>`.                                                                                 |
| **useRawTableBody**  | Cuerpo: **getRowProps({ index, style })** para virtualización por el consumidor; **totalRowCount**; **isRowLoading**/isPlaceholder para skeleton.                                   | **getRowProps**, **totalRowCount** (o getRows); **onNavigateToIndex?** para coordinar foco con virtualizador.                                              |
| **useRawTableRow**   | Por fila: **getRowProps** inyecta style, onKeyDown (A11y), data-has-errors, data-placeholder.                                                                                       | **getRowProps({ index, style })**, **row.errors**.                                                                                                         |
| **useRawCell**       | Lectura/edición: value, errors, isPending, **getCellProps** (data-pending, aria-invalid), **getEditInputProps**, **getErrorProps**; optimistic update. Respetar **editingEnabled**. | **value**, **errors**, **isPending**, **isEditing**, **getCellProps({ className?, style? })**, **getEditInputProps()**, **getErrorProps()**, **editCell**. |
| **useRawErrorBadge** | SheetError.code + params; slot para traducción (I18n).                                                                                                                              | **error** (code, params); **translateError?** o slot para el consumidor.                                                                                   |

La lib **no** integra @tanstack/react-virtual ni ninguna lib de virtualización; expone **getRowProps({ index, style })** para que el consumidor use la lib que prefiera. **getCellProps** devuelve **data-pending="true"** mientras valida y **aria-invalid** cuando hay error; el consumidor estiliza con CSS/Tailwind. Wrappers RawDataTable, RawTableCell, etc. son opcionales (solo llaman al hook y exponen render prop).

---

## 2. Contrato con el Headless

Referencia: [ai-context del headless](https://github.com/cristianm-developer/react-import-sheet-headless/blob/main/ai-context.md).

- **SheetLayout**: estructura (ids de columnas, labels, tipos) para cabeceras y alinear columnas con celdas.
- **Datos**: **useSheetData()** (o equivalente) — resultado final; acceso a filas y valores.
- **Virtualización**: **getRows(offset, limit)** o **getRows(index, 1)** y **totalRowCount** desde el Core. La Raw no implementa la ventana de scroll; expone getRowProps para que el consumidor use su lib.
- **Edición**: **editCell** (useSheetEditor() o similar): actualizar valor por (rowIndex, fieldId o colIndex). Validación asíncrona (Worker); la Raw soporta estado **pending** (data-pending) y **error** (aria-invalid).
- **Errores**: **row.errors** (o equivalente por fila/celda); tipo **SheetError** (code, params) para fila y badge (I18n).

Definir en `src/shared/types/` los tipos que reflejen ese contrato.

---

## 3. Checklist de tareas

### 3.1 Estructura de carpetas

- [ ] Bajo **`src/hooks/`** crear:
  - [ ] **`useRawDataTable/`** — contexto/estado para tabla; Roaming Tabindex; editingEnabled.
  - [ ] **`useRawTableHead/`** — headers desde SheetLayout.
  - [ ] **`useRawTableBody/`** — getRowProps({ index, style }), totalRowCount, isPlaceholder/isRowLoading; onNavigateToIndex opcional.
  - [ ] **`useRawTableRow/`** — getRowProps, row.errors, onKeyDown inyectado.
  - [ ] **`useRawCell/`** — value, errors, isPending, getCellProps, getEditInputProps, getErrorProps, editCell.
  - [ ] **`useRawErrorBadge/`** — error (SheetError) + translateError/slot.
- [ ] Opcional: bajo **`src/components/`** wrappers (RawDataTable, RawTableHead, RawTableBody, RawTableRow, RawTableCell, RawErrorBadge) que solo llaman al hook y exponen render prop.

### 3.2 useRawDataTable

- [ ] Proporcionar contexto/estado para navegación (Roaming Tabindex) y **editingEnabled** (desde rootConfig). Sin markup; el consumidor (o RawDataTable) renderiza `<table>` y aplica la lógica. Documentar en ai-context el comportamiento de tabindex y orden de celdas.

### 3.3 useRawTableHead

- [ ] **Retorno**: **headers** (array de { id, label } desde SheetLayout) para que el consumidor renderice `<thead>` y `<th>`. Export desde `src/hooks/useRawTableHead/index.ts`.

### 3.4 useRawTableBody

- [ ] **Retorno**: **getRowProps({ index: number, style?: React.CSSProperties })**: devuelve props para `<tr>` (o equivalente): fusiona **style** (height, transform); usa **index** para pedir la fila al Core; inyecta **onKeyDown** para A11y. Incluir **isRowLoading** o **isPlaceholder** (boolean) para fila skeleton. **totalRowCount** (o getTotalCount()). Opcional **onNavigateToIndex?(index)** para que el consumidor haga scroll al índice en su virtualizador cuando el foco llega al borde de la ventana virtual.
- [ ] **Principio**: La Raw **no** itera sobre un array gigante ni integra virtualización. El consumidor hace: `virtualRows.map(virtualRow => <tr key={...} {...getRowProps({ index: virtualRow.index, style: { height: ..., transform: ... } })} />)`.
- [ ] **Export**: desde `src/hooks/useRawTableBody/index.ts`. Documentar en ai-context ejemplo con @tanstack/react-virtual (consumidor).

### 3.5 useRawTableRow

- [ ] **Firma**: `useRawTableRow({ index, style?, row? })` o recibe lo que devuelve getRowProps.
- [ ] **Retorno**: **getRowProps** (o props ya calculadas) con style, onKeyDown, data-has-errors, data-placeholder; **row.errors**. Permitir merge de className/style del consumidor.
- [ ] **Export**: desde `src/hooks/useRawTableRow/index.ts`.

### 3.6 useRawCell (hook principal)

- [ ] **Firma**: `useRawCell(cellContext)` — cellContext incluye rowIndex, fieldId (o colIndex), etc.
- [ ] **Retorno**: **value**, **errors**, **isPending**, **isEditing**, **getCellProps({ className?, style? })** (data-pending, aria-invalid), **getEditInputProps()**, **getErrorProps()**, **editCell**. Respetar **editingEnabled**: si false, solo lectura (no entrar en edición). Optimistic update al editar.
- [ ] **Export**: desde `src/hooks/useRawCell/index.ts`. Documentar getters en ai-context; ejemplo: `<td {...getCellProps({ className: "tu-clase" })}>{value}</td>`.

### 3.7 useRawErrorBadge

- [ ] **Retorno**: **error** (SheetError: code, params); **translateError?** (code, params) => string; slot opcional que recibe { code, params } para I18n. Sin UI obligatoria; el consumidor pinta el mensaje.
- [ ] **Export**: desde `src/hooks/useRawErrorBadge/index.ts`.

### 3.8 Wrappers opcionales

- [ ] **RawDataTable**: contenedor `<table>` que usa useRawDataTable y proporciona contexto; children (RawTableHead + RawTableBody o custom). data-ris-ui="raw-data-table".
- [ ] **RawTableHead**, **RawTableBody**, **RawTableRow**: wrappers que llaman al hook y aplican getRowProps/getCellProps a `<thead>`, `<tbody>`, `<tr>`.
- [ ] **RawTableCell**: llama a useRawCell; **children** como función **(state) => ReactNode** (state: isEditing, value, getEditInputProps, errors, pending). data-ris-ui="raw-cell".
- **RawErrorBadge**: wrapper que llama a useRawErrorBadge y expone slot. data-ris-ui="raw-error-badge".

### 3.9 Tests

- [ ] useRawTableBody: getRowProps devuelve props con index y style; totalRowCount; isPlaceholder cuando aplica.
- [ ] useRawTableRow: row.errors expuesto.
- [ ] useRawCell: modo lectura muestra value; modo edición llama editCell y actualización optimista; getCellProps devuelve data-pending cuando pending y aria-invalid cuando hay error; getErrorProps.
- [ ] useRawErrorBadge: error (code, params); translateError o slot.

### 3.10 Storybook

- [ ] useRawDataTable/useRawTableBody: story con getRowProps e índices/estilos simulados (virtualización).
- [ ] useRawCell: lectura; edición con optimistic update; estado pending (data-pending) y error (aria-invalid); ejemplo de getCellProps con Tailwind `[data-pending="true"]`.
- [ ] useRawErrorBadge: SheetError de ejemplo; slot y translateError.

### 3.11 Documentación

- [ ] Actualizar **ai-context.md**: useRawDataTable (A11y Roaming Tabindex, editingEnabled), useRawTableHead, useRawTableBody (getRowProps con isPlaceholder, totalRowCount, virtualización, onNavigateToIndex), useRawTableRow (onKeyDown, data-placeholder), useRawCell (**getCellProps**, **getEditInputProps**, **getErrorProps**, data-pending, aria-invalid), useRawErrorBadge. Wrappers opcionales. Ejemplo consumo directo del hook sin wrapper.
- [ ] Actualizar **Architecture.md**: Step 5; lista de **hooks** de datos como artefactos principales.

---

## 4. Orden sugerido de ejecución

1. Confirmar en el headless: SheetLayout, getRows(page, limit), useSheetData, useSheetEditor (editCell), row.errors, SheetError. Tipos en src/shared/types/.
2. Implementar useRawTableHead (headers desde layout) y useRawDataTable (contexto Roaming Tabindex, editingEnabled).
3. Implementar useRawTableBody: getRowProps({ index, style }), totalRowCount, isPlaceholder; sin iterar arrays gigantes.
4. Implementar useRawTableRow (getRowProps, row.errors) y useRawCell (value, getCellProps, getEditInputProps, getErrorProps, editCell, data-pending, aria-invalid).
5. Implementar useRawErrorBadge (error + translateError/slot).
6. Tests, Storybook, ai-context.md y Architecture.md.
7. Opcional: wrappers RawDataTable, RawTableHead, RawTableBody, RawTableRow, RawTableCell, RawErrorBadge.

---

## 5. Notas

- **Virtualización**: La Raw **no** integra @tanstack/react-virtual. useRawTableBody expone **getRowProps** y **totalRowCount** para que el **consumidor** integre la virtualización. getRowProps acepta **index** y **style** (height, transform); el hook solo fusiona y aplica.
- **Optimistic UI y pending**: useRawCell expone el valor de forma optimista. Mientras el Worker valida, **getCellProps** devuelve **data-pending="true"**; al terminar **data-pending="false"** y **aria-invalid** si hay error. El consumidor estiliza con CSS/Tailwind.
- **RawTableCell wrapper**: render prop children(state) para input/datepicker/checkbox custom; state incluye isEditing, value, getEditInputProps, errors, pending.
- **Foco en celdas virtualizadas**: documentar coordinación Raw ↔ virtualizador (onNavigateToIndex o scrollToIndex) cuando el usuario navega con flechas al borde de la ventana virtual.
- Convención Raw en wrappers: forwardRef, data-ris-ui, className y style.
