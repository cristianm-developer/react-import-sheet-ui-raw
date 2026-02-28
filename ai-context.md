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
| **useRawProgress** / RawProgressMonitor      | Progreso vía EventTarget; ref/valor para barra sin re-renders; phase actual.   | Step 4 |
| **useRawAbort** / RawAbortController         | Acción `abort()` del Core; wrapper: botón que la invoca.                       | Step 4 |

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

### useRawProgress / RawProgressMonitor (wrapper opcional)

- **Hook useRawProgress:** retorna `{ phase, progressRef, aborted, onProgress? }` — `progressRef` actualizado en cada evento sin re-renders; ideal para barra de progreso.
- **Wrapper RawProgressMonitor:** usa el hook y expone render prop `children({ phase, progressRef, aborted })`; props `className?`, `style?`, `onProgress?`.
- **Contrato:** ref al contenedor raíz (`div`), `data-ris-ui="raw-progress-monitor"`.
- **Uso:** Dentro de RawImporterRoot; típicamente en el slot `renderProcess` de RawStatusGuard. No re-renderiza con cada %; usar `progressRef.current` o `onProgress` para la barra.

```tsx
<RawProgressMonitor onProgress={(d) => setPercent(d.globalPercent ?? 0)} className="my-progress">
  {({ phase, progressRef, aborted }) => (
    <>
      <span>{phase || 'Processing...'}</span>
      <div role="progressbar" aria-valuenow={progressRef.current?.globalPercent ?? 0}>
        {/* barra con estilos propios */}
      </div>
      {aborted && <span>Cancelled</span>}
    </>
  )}
</RawProgressMonitor>
```

---

### useRawAbort / RawAbortController (wrapper opcional)

- **Hook useRawAbort:** retorna `{ abort, getButtonProps(options?) }` — `abort()` llama al Core; getter aplica onClick y contrato al botón.
- **Wrapper RawAbortController:** usa el hook; props `className?`, `style?`, `children?`, `disabled?`, `aria-label?`. Al click invoca `abort()`.
- **Contrato:** ref al `<button>`, `data-ris-ui="raw-abort-controller"`, `type="button"`.
- **Uso:** Dentro de RawImporterRoot; típicamente junto a RawProgressMonitor en la vista de Proceso.

```tsx
<RawAbortController className="btn-cancel" aria-label="Cancel import">
  Cancelar
</RawAbortController>
```

---

Cuando se añada o cambie un **hook** o un wrapper, actualizar este archivo (getters, estado, acciones) para que integradores y libs de UI sepan consumir la lib vía hooks.
