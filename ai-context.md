# Guía de consumo — @cristianm/react-import-sheet-ui-raw

**Propósito:** Referencia para integradores (IA o desarrolladores) y para **librerías de presentación** (Tailwind, CSS, etc.) que consuman esta librería. Usar solo la API pública descrita aquí.

---

## Qué es esta lib: Hooks-First Headless

Esta librería es **lógica, no componentes**. El producto principal son **hooks** (`useRawCell`, `useRawFilePicker`, etc.) que devuelven **estado**, **acciones** y **prop-getters** (contrato DOM: `role`, `aria-*`, `data-*`). Con esos hooks el consumidor (o una futura lib de UI) configura sus propios nodos — `<td>`, `<div>`, grid custom, TanStack Virtual, etc. — sin conflictos de estilos ni markup impuesto.

Opcionalmente se exponen **wrappers** (RawTableCell, RawFilePicker, …) que solo llaman al hook y pasan el resultado por render prop; son conveniencia, no obligatorios.

---

## Cómo usar esta lib

1. Esta librería depende de **@cristianm/react-import-sheet-headless**. Configura primero el **ImporterProvider** (vía **RawImporterRoot** con `layout`) según el [ai-context del headless](https://github.com/cristianm-developer/react-import-sheet-headless/blob/main/ai-context.md).
2. **Forma principal:** Usar **hooks** (`useRawCell`, `useRawFilePicker`, …). Cada hook devuelve getters y estado; el consumidor aplica los getters a sus nodos y aplica sus propias clases/estilos.
3. **Forma opcional:** Usar los **wrappers** (RawTableCell, RawProgressMonitor, etc.) cuando convenga; siguen siendo sin estilos y exponen render props.

### Contrato con el headless (telemetría y persistencia)

- **Telemetría:** El headless no exporta un hook `useImporterMetrics`; la telemetría está en **`useImporter().metrics`** (tipo **PipelineMetrics**). Esta lib reexporta `useImporter()` y puede exponer un wrapper **`useImporterMetrics()`** que devuelva ese valor, para resúmenes de rendimiento (ej. "10.000 filas en 1,2s").
- **Persistencia:** El headless expone **hasRecoverableSession**, **recoverSession()** y **clearPersistedState()**. En la UI Raw la acción "Limpiar sesión" se documenta como **clearSession**; en la implementación debe llamar a **clearPersistedState()** del headless (o la lib puede exportar un alias `clearSession` que invoque `clearPersistedState()`).

---

## Hooks (API principal)

_(Actualizar al finalizar cada hook: nombre, retorno (estado, acciones, getters), y ejemplo de uso.)_

### Ejemplo de ficha por hook

```markdown
### useRawCell(cellContext)

- **Retorno:** value, errors, isPending, isEditing, getCellProps(options?), getEditInputProps(), getErrorProps()
- **Contrato DOM:** getCellProps aplica role="gridcell", aria-invalid, data-pending; acepta className, style
- **Ejemplo:** const state = useRawCell(cell); return <td {...state.getCellProps({ className: "..." })}>...</td>;
```

---

## Índice: hooks y wrappers opcionales

| Hook / Wrapper                               | Descripción                                                                    | Estado |
| -------------------------------------------- | ------------------------------------------------------------------------------ | ------ |
| **useRawImporterRoot** / RawImporterRoot     | providerProps + rootConfig; monta ImporterProvider + RootConfigProvider.       | Step 2 |
| **useStatusView** / RawStatusGuard           | Vista actual (idle \| mapping \| process \| result \| error) + datos headless. | Step 2 |
| **useRawFilePicker** / RawFilePicker         | isDragging, getRootProps, getInputProps; conexión con processFile.             | Step 3 |
| **useRawMappingTable** / RawMappingTable     | Filas de mapeo (useConvert); datos por fila para useRawMappingRow.             | Step 3 |
| **useRawMappingRow** / RawMappingRow         | Por fila: headerOriginal, options, value, onChange, mappingStatus.             | Step 3 |
| **useRawMappingSuggest** / RawMappingSuggest | matchScore (0–100), suggestedFieldId/Label; solo si fuzzyMatch.                | Step 3 |
| **useRawImportAction** / RawImportAction     | disabled (mapeo incompleto), runImport (applyMapping).                         | Step 3 |
| **useRawProgress** / RawProgressDisplay      | Progreso vía EventTarget; progressRef (sin re-renders); opcional onProgress.   | Step 4 |
| **useRawStatus** / RawStatusIndicator        | status + errorDetail (objeto diagnóstico en error).                            | Step 4 |
| **useRawAbort** / RawAbortButton             | Acción `abort()` del Core; wrapper: botón que la invoca.                       | Step 4 |
| **RawErrorBoundary**                         | Error Boundary; fallback y onError opcional.                                   | Step 4 |
| **useRawDataTable** / RawDataTableProvider   | Roaming Tabindex, editingEnabled; contexto para tabla.                         | Step 5 |
| **useRawTableHead**                          | Cabeceras (headers) desde SheetLayout.                                         | Step 5 |
| **useRawTableBody**                          | getRowProps({ index, style }), totalRowCount, isPlaceholder.                   | Step 5 |
| **useRawTableRow**                           | getRowProps, row.errors.                                                       | Step 5 |
| **useRawCell**                               | value, getCellProps, getEditInputProps, getErrorProps, editCell; data-pending. | Step 5 |
| **useRawErrorBadge**                         | error (SheetError) + message/translateError para I18n.                         | Step 5 |

---

### useRawImporterRoot (hook principal)

- **Opciones:** `layout?`, `engine?`, `persist?`, `persistKey?`, `fuzzyMatch?` (default true), `editingEnabled?` (default true), `stages?` (`{ mapping?, process?, result? }`).
- **Retorno:** `{ providerProps, rootConfig }` — **providerProps** son las props para **ImporterProvider** del headless (layout, engine, persist, persistKey); **rootConfig** es `{ fuzzyMatch, editingEnabled, stages }` para inyectar en **RootConfigContext**.
- **RootConfigProvider:** componente que recibe `rootConfig` y envuelve `children`; debe usarse dentro de ImporterProvider para que useStatusView lea stages.
- **Ejemplo (solo hooks):** el usuario monta `<ImporterProvider {...providerProps}><RootConfigProvider rootConfig={rootConfig}>{children}</RootConfigProvider></ImporterProvider>`.

```tsx
const { providerProps, rootConfig } = useRawImporterRoot({
  layout: mySheetLayout,
  engine: 'auto',
  stages: { mapping: true, process: true, result: true },
});
return (
  <ImporterProvider {...providerProps}>
    <RootConfigProvider rootConfig={rootConfig}>
      <MyContent />
    </RootConfigProvider>
  </ImporterProvider>
);
```

---

### useStatusView (hook principal)

- **Uso:** Dentro de `ImporterProvider` (y opcionalmente dentro de **RootConfigProvider** para respetar `stages`).
- **Retorno:** `{ view, status, progressEventTarget, convertResult }` — **view** es `'idle' | 'mapping' | 'process' | 'result' | 'error'`; el resto son datos del headless para renderizar.
- **Lógica:** Si `convertResult !== null` → view = `'mapping'`; si no, se deriva de **status** (idle/loading/parsing → idle; validating/transforming → process; success → result; error/cancelled → error). Si `rootConfig.stages` deshabilita una vista (p. ej. `stages.mapping === false`), se devuelve `'idle'` en lugar de `'mapping'`.
- **Sin UI:** el hook solo devuelve datos; el consumidor usa `view` para decidir qué renderizar.

```tsx
const { view, status, convertResult } = useStatusView();
if (view === 'idle') return <FilePicker />;
if (view === 'mapping') return <MappingTable convertResult={convertResult} />;
if (view === 'process') return <ProgressBar />;
if (view === 'result') return <DataGrid />;
if (view === 'error') return <ErrorMessage />;
```

---

### RawImporterRoot (wrapper opcional)

- **Props:** las mismas que **useRawImporterRoot** (layout, engine, persist, persistKey, fuzzyMatch, editingEnabled, stages) más `children`, `className?`, `style?`.
- **Comportamiento:** llama a useRawImporterRoot, renderiza **ImporterProvider** + **RootConfigProvider** y un `div` con ref, className, style y `data-ris-ui="raw-importer-root"`.
- **Uso:** punto de entrada rápido; la lógica está en el hook.

```tsx
<RawImporterRoot layout={myLayout} engine="auto">
  <RawStatusGuard
    renderIdle={() => <FilePicker />}
    renderMapping={({ convertResult }) => <MappingTable data={convertResult} />}
    renderProcess={() => <ProgressBar />}
    renderResult={() => <DataGrid />}
    renderError={() => <ErrorMessage />}
  />
</RawImporterRoot>
```

---

### RawStatusGuard (wrapper opcional)

- **Props:** `renderIdle?`, `renderMapping?`, `renderProcess?`, `renderResult?`, `renderError?` (cada uno `(data: UseStatusViewReturn) => ReactNode`), `className?`, `style?`.
- **Comportamiento:** llama a **useStatusView()** y renderiza el slot correspondiente al **view** actual; `data-ris-ui="raw-status-guard"`.
- **Uso:** dentro de RawImporterRoot (o del árbol ImporterProvider + RootConfigProvider).

---

### useRawFilePicker (hook principal)

- **Opciones:** `accept?` (p. ej. `.xlsx,.csv`).
- **Retorno:** `{ isDragging, getRootProps, getInputProps }`. **getRootProps({ className?, style? })** devuelve props para el contenedor drop: ref, onDragOver, onDragLeave, onDrop, role, aria-dropzone; acepta merge de className/style. **getInputProps()** devuelve ref, type="file", onChange, accept. En onChange/onDrop se llama a **processFile** del Core.
- **Uso:** dentro de ImporterProvider. El consumidor aplica getters a sus nodos: `<div {...getRootProps({ className: '...' })}><input {...getInputProps()} /></div>`.

```tsx
const { isDragging, getRootProps, getInputProps } = useRawFilePicker({ accept: '.csv' });
return (
  <div {...getRootProps({ className: 'drop-zone' })}>
    <input {...getInputProps()} />
    {isDragging ? 'Drop here' : 'Drag or click'}
  </div>
);
```

---

### useRawMappingTable (hook principal)

- **Retorno:** `{ rows, hasMappingData }` — **rows** es la lista de contextos por columna (headerOriginal, columnIndex) para iterar con **useRawMappingRow**; **hasMappingData** true cuando hay convertResult con columnas. No guarda estado de mapeo en la UI; todo en el Core (useConvert). Respetar **fuzzyMatch** del rootConfig: si false, las sugerencias fuzzy no se usan.
- **Uso:** dentro de ImporterProvider (y LayoutProvider, que RawImporterRoot monta). Cuando view === 'mapping', iterar rows y por cada uno usar useRawMappingRow({ rowContext }).

---

### useRawMappingRow (hook principal)

- **Opciones:** `rowContext` (headerOriginal, columnIndex) — típicamente cada elemento de useRawMappingTable().rows.
- **Retorno:** **headerOriginal**, **options** (LayoutFieldOption[]: id, label), **value** (fieldId seleccionado o null), **onChange(fieldId)**, **mappingStatus** ('valid' | 'invalid' | 'unmapped'). Conecta con convertResult.renameColumn del Core.
- **Uso:** por cada fila de la tabla de mapeo; el consumidor pinta un selector con options y value/onChange.

---

### useRawMappingSuggest (hook principal)

- **Opciones:** `columnContext` (fileHeader, columnIndex). Solo activo si **fuzzyMatch** es true (rootConfig).
- **Retorno:** **matchScore** (0–100), **suggestedFieldId**, **suggestedFieldLabel** cuando hay coincidencia fuzzy; si fuzzyMatch es false, matchScore 0 y suggested\* null. Sin UI; el consumidor pinta el badge.
- **Uso:** opcional, para mostrar "Columna 'E-mail' coincide 90% con campo 'email'".

---

### useRawImportAction (hook principal)

- **Retorno:** **disabled** (true si mapeo incompleto — convertResult con mismatches — o ya procesando) y **runImport** (acción que llama a convertResult.applyMapping()). Sin UI; el consumidor aplica a un botón.
- **Uso:** en la vista de mapeo, botón "Importar" con disabled y onClick={runImport}.

```tsx
const { disabled, runImport } = useRawImportAction();
return (
  <button type="button" disabled={disabled} onClick={runImport}>
    Run import
  </button>
);
```

---

### Wrappers opcionales (Step 3)

- **RawFilePicker:** children como función `(state) => ReactNode` con state = { isDragging, getRootProps, getInputProps }; `data-ris-ui="raw-file-picker"`.
- **RawMappingTable:** children(state) con state = { rows, hasMappingData }; `data-ris-ui="raw-mapping-table"`.
- **RawMappingRow:** rowContext + children(state) con state de useRawMappingRow; `data-ris-ui="raw-mapping-row"`.
- **RawMappingSuggest:** columnContext + children(state) con matchScore, suggestedFieldId, suggestedFieldLabel; `data-ris-ui="raw-mapping-suggest"`.
- **RawImportAction:** children(state) con disabled, runImport; `data-ris-ui="raw-import-action"`.

Todos aceptan className, style y forwardRef.

---

## Hooks-first: uso nativo con headless

La lib reexporta hooks del headless para que el usuario pueda montar solo los providers (o RawImporterRoot) y construir toda la UI con hooks:

- **useImporter()** — `processFile`, `abort`, `metrics`, `registerValidator`, `registerSanitizer`, `registerTransform`.
- **useImporterStatus()** — `status`, `progressEventTarget`.
- **useConvert()** — `convert`, `convertedSheet`, `convertResult` (y `applyMapping` vía convertResult).
- **useSheetData()**, **useSheetEditor()**, **useSheetView()** — datos, edición y export (exportToCSV, exportToJSON).

Ejemplo sin wrappers: `<ImporterProvider {...providerProps}><RootConfigProvider rootConfig={rootConfig}><MyUI /></RootConfigProvider></ImporterProvider>` donde MyUI usa useStatusView, useConvert, useSheetData, etc.

---

### useRawProgress (hook principal)

- **Opciones:** `onProgress?(detail)` — opcional; si se pasa, se invoca en cada evento `importer-progress` (para que el consumidor haga setState si lo desea).
- **Retorno:** `{ progressRef, onProgress? }` — **progressRef** (RefObject&lt;ImporterProgressDetail | null&gt;) se actualiza en cada evento sin re-renders. Leer `progressRef.current` (p. ej. en requestAnimationFrame) para pintar la barra.
- **Uso:** Dentro de ImporterProvider; típicamente en el slot `renderProcess` de RawStatusGuard.

```tsx
const { progressRef } = useRawProgress();
// Opción 1: leer ref en animación
requestAnimationFrame(function tick() {
  const p = progressRef.current?.globalPercent ?? 0;
  barRef.current?.style.setProperty('width', `${p}%`);
  requestAnimationFrame(tick);
});
// Opción 2: onProgress para setState
const { progressRef, onProgress } = useRawProgress({
  onProgress: (d) => setPercent(d.globalPercent ?? 0),
});
```

### RawProgressDisplay (wrapper opcional)

- **Props:** `children(state)` con state = `{ progressRef, onProgress? }`; `className?`, `style?`, `onProgress?`.
- **Contrato:** `data-ris-ui="raw-progress-display"`.

---

### useRawStatus (hook principal)

- **Retorno:** `{ status, errorDetail? }` — **status** es ImporterStatus del Core; **errorDetail** (objeto de diagnóstico tipo SheetError: code, params, level, message) cuando `status === 'error'`. Permite mensajes contextuales (ej. "Tu navegador se quedó sin memoria"). Cuando el headless exponga lastError se conectará aquí.
- **Uso:** Para mostrar estado actual y mensaje de error en la vista de error.

```tsx
const { status, errorDetail } = useRawStatus();
if (status === 'error' && errorDetail) {
  return <p>{errorDetail.message ?? errorDetail.code}</p>;
}
```

### RawStatusIndicator (wrapper opcional)

- **Props:** `children({ status, errorDetail })`; `className?`, `style?`.
- **Contrato:** `data-ris-ui="raw-status-indicator"`.

---

### useRawAbort (hook principal)

- **Retorno:** `{ abort }` — función que llama a `abort()` del Core (detiene Workers). Sin UI; el consumidor la asocia a un botón.
- **Uso:** En la vista de proceso, botón "Cancelar" con `onClick={abort}`.

### RawAbortButton (wrapper opcional)

- **Props:** `children?`, `className?`, `style?`, `disabled?`, `aria-label?`. Por defecto se deshabilita cuando el status no es de proceso (loading/parsing/validating/transforming).
- **Contrato:** `<button type="button">`, `data-ris-ui="raw-abort-button"`.

```tsx
<RawAbortButton className="btn-cancel" aria-label="Cancel import">
  Cancelar
</RawAbortButton>
```

---

### RawErrorBoundary (opcional)

- **Props:** `children`, **fallback** (ReactNode o `(error, errorInfo) => ReactNode`), **onError?(error, errorInfo)**.
- **Comportamiento:** Error Boundary que captura errores fatales (Worker murió, error de React). No sustituye useRawStatus (errorDetail para errores de flujo).
- **Contrato:** `data-ris-ui="raw-error-boundary"`.

---

## Hooks fase Datos (Step 5 — Grid y edición)

Usar dentro de **RawImporterRoot** (o ImporterProvider + RootConfigProvider + LayoutProvider). Para la tabla de resultado (vista RESULT) se necesita **RawDataTableProvider** (o inyectar el valor de **useRawDataTable()** en **DataTableContext**) para que useRawTableRow/useRawCell tengan Roaming Tabindex y **editingEnabled**.

### useRawDataTable (hook principal — contexto tabla)

- **Opciones:** `onNavigateToIndex?(index)` — opcional; se invoca cuando el foco se mueve con flechas a una fila fuera de la ventana virtual (para que el consumidor haga scrollToIndex en su virtualizador).
- **Retorno:** `editingEnabled`, `headerIds`, `totalRowCount`, `focusedRowIndex`, `focusedCellKey`, `setFocused`, `pendingCell`, `setPendingCell`, `getKeyDownHandler`, `onNavigateToIndex`, `headers` (array { id, label }).
- **Uso:** Proporcionar contexto para la tabla (Roaming Tabindex, edición). El consumidor envuelve la tabla con **RawDataTableProvider** (que usa useRawDataTable por dentro) o hace `<DataTableContext.Provider value={useRawDataTable({ onNavigateToIndex })}>...</DataTableContext.Provider>`.

### RawDataTableProvider (opcional)

- **Props:** `children`, `onNavigateToIndex?(index)`.
- **Comportamiento:** Llama a useRawDataTable y proporciona **DataTableContext**. Debe usarse dentro de ImporterProvider + LayoutProvider + RootConfigProvider (p. ej. dentro de RawImporterRoot).

### useRawTableHead (hook principal)

- **Retorno:** `{ headers }` — array de `{ id, label }` desde SheetLayout para renderizar `<thead>` y `<th>`.
- **Uso:** Dentro de ImporterProvider (LayoutContext). No requiere DataTableContext.

### useRawTableBody (hook principal)

- **Retorno:** `totalRowCount`, **getRowProps({ index, style? })**, **isPlaceholder(index)**.
- **getRowProps:** Devuelve props para `<tr>`: `key`, `data-row-index`, `data-has-errors`, `data-placeholder`, `style`, `role="row"`, `aria-rowindex`. El consumidor pasa `index` y el `style` que calcula su virtualizador (height, transform).
- **Principio:** La Raw no itera arrays gigantes ni integra virtualización. El consumidor hace por ejemplo: `virtualRows.map(vr => <tr key={vr.key} {...getRowProps({ index: vr.index, style: { height: ..., transform: ... } })} />)`.
- **Uso:** Dentro de ImporterProvider. Opcionalmente con **onNavigateToIndex** (desde useRawDataTable) para coordinar foco con virtualizador.

### useRawTableRow (hook principal)

- **Opciones:** `{ index, style?, row? }` (RawTableRowContext).
- **Retorno:** **getRowProps(merge?)** (fusiona con className/style del consumidor), **row** (ValidatedRow o undefined), **rowErrors** (errores de fila).
- **Uso:** Por cada fila que se renderiza (típicamente dentro del map del virtualizador).

### useRawCell (hook principal)

- **Opciones:** `{ rowIndex, fieldId }` (RawCellContext).
- **Retorno:** **value**, **errors**, **isPending**, **isEditing**, **getCellProps({ className?, style? })**, **getEditInputProps()**, **getErrorProps()**, **editCell**.
- **Contrato DOM:** **getCellProps** aplica `role="gridcell"`, `tabIndex` (0 si enfocado, -1 si no), **data-pending="true"** mientras valida, **aria-invalid** cuando hay error; acepta merge de className/style. **getEditInputProps()** para el input en modo edición (value, onChange, etc.). **getErrorProps()** para el slot de error (role="alert", aria-live).
- **editingEnabled:** Si el RootConfig tiene `editingEnabled: false`, la celda es solo lectura (no entra en edición).
- **Optimistic update:** Al editar se muestra el valor de forma optimista; **data-pending** true hasta que el Worker responde.
- **Uso:** Por cada celda. Ejemplo: `<td {...getCellProps({ className: '...' })}>{value}</td>`; si isEditing, mostrar input con getEditInputProps().

### useRawErrorBadge (hook principal)

- **Opciones:** `{ error: SheetError | null, translateError?(code, params) => string }`.
- **Retorno:** **error** (code, params), **message** (traducido si hay translateError; si no, error.message o code), **translateError** (opcional, para slot custom).
- **Uso:** Slot para mostrar un error de celda/fila con I18n. Sin UI obligatoria; el consumidor pinta el mensaje.

---

### Telemetría

- **useImporter().metrics** (PipelineMetrics: timings, totalMs, rowCount) — reexportado del headless. Mostrar en renderResult (ej. "10.000 filas en 1,2s").
- **useImporterMetrics()** — wrapper que devuelve `useImporter().metrics`.

---

Cuando se añada o cambie un **hook** o un wrapper, actualizar este archivo (getters, estado, acciones) para que integradores y libs de UI sepan consumir la lib vía hooks.
