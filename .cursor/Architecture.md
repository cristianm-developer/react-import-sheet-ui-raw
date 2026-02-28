# Architecture — @cristianm/react-import-sheet-ui-raw

Esquema de pasos y estado actual del proyecto. La librería es **hooks-first headless**: el producto principal son **hooks y getters** que traducen el Core a estado, acciones y contrato DOM; los "componentes" son opcionales y solo exponen esa lógica. Actualizar cuando cambien features o la estructura.

---

## Visión: Hooks-First Headless (lib de lógica, no de componentes)

- **Engine:** `@cristianm/react-import-sheet-headless` — lógica (Parser → Convert → Sanitizer → Validator → Transform).
- **Esta lib:** **solo lógica** — hooks que sincronizan estado del Core, mapean eventos a Workers y entregan **prop-getters** (contrato DOM: `role`, `aria-*`, `data-*`). Cero CSS; cero conflictos de estilos. Pensada para **extender después** a una capa UI (o para que el consumidor construya su propia UI con los hooks).

**Entrada de configuración:** El usuario pasa el **layout objetivo** (SheetLayout) — típicamente a **RawImporterRoot** (provider) — para definir el esquema de columnas/campos al que se mapean los datos. Opcionalmente `engine`, `persist`, `persistKey`.

---

## Los 3 pilares: qué entregan los hooks

Los hooks de esta lib actúan como **traductor** del Core al DOM: convierten estados complejos y Workers en algo que cualquier componente o markup puede consumir.

| Pilar        | Responsabilidad del hook/getter                                        | Ejemplo de lo que inyecta                                                                    |
| ------------ | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Estado**   | Sincronizar valor y errores con el Core.                               | `value`, `errors`, `isPending`, `isEditing`.                                                 |
| **Acciones** | Mapear eventos del usuario a hilos/Workers.                            | `onDoubleClick`, `onChange`, `onKeyDown`, `editCell`, `abort`.                               |
| **Contrato** | Asegurar que el navegador entienda qué es cada cosa (a11y, semántica). | `role="gridcell"`, `aria-invalid`, `data-pending`, getters que fusionan `className`/`style`. |

**Huella técnica:** No vendemos el "cuerpo" (el `<td>` o el `<div>`); vendemos el **sistema nervioso** (el objeto de configuración que hace que esos elementos funcionen con importación masiva y validación en Workers).

---

## Categorías: Hooks (núcleo) y Wrappers opcionales

### 1. Hooks y getters (núcleo de la lib)

La API principal son **hooks** que devuelven estado, acciones y prop-getters. El consumidor (o una futura lib de UI) usa estos hooks para configurar sus propios componentes — `<td>`, `<div>`, TanStack Virtual, Framer Motion, etc.

| Fase                             | Hook / getter                                  | Responsabilidad breve                                                                                                          |
| -------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| **Entrada (Upload & Mapping)**   | **useRawFilePicker**                           | `isDragging`, getRootProps, getInputProps; conexión con `processFile`.                                                         |
|                                  | **useRawMappingTable** / **useRawMappingRow**  | Estado de mapeo CSV ↔ Layout; getters por fila (header original, selector destino, válido/maltrecho).                          |
|                                  | **useRawMappingSuggest**                       | Porcentaje de coincidencia fuzzy (matchScore, suggestedFieldId); param para desactivar fuzziness.                              |
|                                  | **useRawImportAction**                         | `disabled` si mapeo incompleto; acción que ejecuta `processFile`.                                                              |
| **Feedback (Progress & Status)** | **useRawProgress**                             | Suscripción a EventTarget `importer-progress`; ref/valor para barra sin re-renders.                                            |
|                                  | **useRawStatus**                               | Estado actual (parsing, validating, success, error); en error **objeto de diagnóstico** (no solo texto).                       |
|                                  | **useRawAbort**                                | Acción `abort()` del Core (detener Workers).                                                                                   |
| **Datos (Grid & Edit)**          | **useRawDataTable**                            | Roaming tabindex, getRowProps; edición activable por param.                                                                    |
|                                  | **useRawTableHead**                            | Cabeceras del Layout.                                                                                                          |
|                                  | **useRawTableBody**                            | getRowProps({ index, style }), isRowLoading/isPlaceholder para skeleton; compatible con virtualización externa.                |
|                                  | **useRawTableRow**                             | getRowProps, onKeyDown inyectado (a11y), `row.errors`.                                                                         |
|                                  | **useRawCell**                                 | Lectura/edición: value, errors, isPending, getCellProps, getEditInputProps, optimistic update, `data-pending`, `aria-invalid`. |
|                                  | **useRawErrorBadge**                           | SheetError.code + slot para traducción (I18n).                                                                                 |
| **Errores / Telemetría**         | **useRawErrorBoundary** (o lógica equivalente) | Captura errores fatales; opcional telemetría vía **useImporter().metrics**.                                                    |
| **Navegación y Salida**          | **useRawPagination**                           | Siguiente/Anterior vinculados a `setPage`.                                                                                     |
|                                  | **useRawFilterToggle**                         | filterMode: 'all'                                                                                                              | 'errors-only'. |
|                                  | **useRawExport**                               | Dispara `downloadCSV` / `downloadJSON`.                                                                                        |
|                                  | **useRawPersistence**                          | Recuperar/Limpiar sesión (recoverSession, clearSession → clearPersistedState).                                                 |

### 2. Wrappers opcionales (conveniencia)

Si se exponen "componentes" (RawTableCell, RawDataTable, etc.), son **contenedores mínimos** que solo llaman al hook y pasan el resultado por **render prop**; no definen markup obligatorio. El usuario elige si ese "cerebro" va a un `<td>`, a un `<div>` de un grid o a un canvas.

Ejemplo de anatomía:

```ts
// Lo que hace un "componente" Raw: solo entrega el hook al usuario
export const RawTableCell = ({ cell, children }) => {
  const cellLogic = useRawCell(cell);
  return children(cellLogic); // el usuario decide el cuerpo (td, div, etc.)
};
```

Lista de wrappers opcionales (alineados con la tabla de hooks): RawFilePicker, RawMappingTable, RawMappingRow, RawMappingSuggest, RawImportAction, RawProgressDisplay, RawStatusIndicator, RawAbortButton, RawDataTable, RawTableHead, RawTableBody, RawTableRow, RawTableCell, RawErrorBadge, RawPagination, RawFilterToggle, RawExportButton, RawPersistenceBanner, RawErrorBoundary.

### 3. Orquestador (opcional, "todo construido")

**RawImporterWorkflow** gestiona la **máquina de estados** y compone hooks (o sus wrappers) para cada pantalla. Pensado para el usuario que quiere una experiencia llave en mano sin montar cada hook a mano.

| Estado         | Muestra (hooks o wrappers)                                                                                        |
| -------------- | ----------------------------------------------------------------------------------------------------------------- |
| **IDLE**       | useRawFilePicker / RawFilePicker.                                                                                 |
| **MAPPING**    | useRawMappingTable, useRawMappingRow, useRawMappingSuggest / RawMappingTable, etc.                                |
| **PROCESSING** | useRawProgress, useRawAbort / RawProgressDisplay, RawAbortButton.                                                 |
| **RESULT**     | useRawFilterToggle, useRawExport, useRawDataTable, useRawPagination, useRawPersistence / Toolbar + Grid + Footer. |

---

## Layout como parámetro

El **layout objetivo** (SheetLayout) es la definición del esquema al que se mapean las columnas del archivo (ids de campos, labels, tipos). El usuario lo pasa como prop:

- **RawImporterRoot**: acepta **`layout`** (y opcionalmente `engine`, `persist`, `persistKey`). Se pasan al `ImporterProvider` del headless. Todo lo que esté dentro del Root usa ese layout.
- **RawImporterWorkflow**: se usa **dentro** de RawImporterRoot; el layout ya viene del contexto. Si el Workflow se documenta como punto de entrada único, se indica que el usuario envuelve con `<RawImporterRoot layout={miLayout}> <RawImporterWorkflow /> </RawImporterRoot>`.

Ejemplo mínimo:

```tsx
<RawImporterRoot layout={mySheetLayout} engine="auto">
  <RawImporterWorkflow />
</RawImporterRoot>
```

---

## Consumo: hooks primero; wrappers y orquestador opcionales

La forma principal de uso es **RawImporterRoot + hooks**. El usuario (o una futura lib de UI) usa los hooks para configurar sus propios nodos; los wrappers (RawFilePicker, RawTableCell, etc.) y RawImporterWorkflow son opcionales.

1. **UI 100 % propia:** RawImporterRoot con `layout` + `useRawFilePicker`, `useRawCell`, `useSheetData`, `useSheetEditor`, `processFile`, `abort`, etc. Sin ningún componente Raw; el consumidor pinta `<td>`, `<div>`, lo que quiera.
2. **Híbrido:** Usar algunos hooks (p. ej. `useRawCell`) y algunos wrappers (p. ej. RawMappingTable) según convenga.
3. **Llave en mano:** RawImporterRoot + RawImporterWorkflow; el Workflow usa internamente los hooks (o sus wrappers) y la máquina de estados.

**Contrato:** La lib reexporta los hooks del headless que hagan falta (`useImporterStatus`, `useConvert`, `useSheetData`, `useSheetEditor`, `processFile`, `abort`, `downloadCSV`, `downloadJSON`) y expone los **useRaw\*** como API principal. Los wrappers tipo RawTableCell son **opcionales** y de conveniencia; quien quiera control total usa solo hooks.

---

## Estrategia Prop-Getters (hooks)

Los hooks devuelven **prop-getters** que el consumidor aplica a sus nodos; así la lib no impone CSS ni estructura. Cada hook (useRawCell, useRawFilePicker, etc.) documenta los getters que retorna y las props que aceptan (p. ej. `className`, `style`).

Ejemplo (consumo directo del hook, sin wrapper):

```ts
const { getCellProps, getErrorProps, value, errors } = useRawCell(cellContext);

return (
  <td {...getCellProps({ className: "tu-clase-tailwind" })}>
    {value}
    {errors?.length ? <span {...getErrorProps()} /> : null}
  </td>
);
```

En `ai-context.md` se documentan los getters por hook (`getRootProps`, `getInputProps`, `getCellProps`, `getErrorProps`, etc.) y sus parámetros.

---

## Render props en wrappers opcionales

Cuando existan wrappers (p. ej. RawTableCell), aceptan **children como función** `(state) => ReactNode` para que el consumidor decida el markup (datepicker, checkbox, input custom). El wrapper solo llama al hook y pasa el resultado; no impone HTML.

**Ejemplo con wrapper RawTableCell:**

```tsx
<RawTableCell cell={cell}>
  {(state) =>
    state.isEditing ? <MyCustomInput {...state.getEditInputProps()} /> : <span>{state.value}</span>
  }
</RawTableCell>
```

Quien use **solo el hook** no necesita render prop: tiene `useRawCell(cell)` y con eso pinta lo que quiera. El objeto que devuelve el hook (state) incluye al menos: `isEditing`, `value`, `getEditInputProps()`, `getCellProps()`, `errors`, `isPending`.

---

## Customización: fases, edición y fuzzy

El usuario debe poder **activar o desactivar** comportamientos por parámetro (sin tocar código interno):

- **Fuzziness en mapeo:** Parámetro (p. ej. en RawImporterRoot o en RawMappingTable) **`fuzzyMatch?: boolean`** (default `true`). Si `false`, el Core no sugiere coincidencias aproximadas; solo mapeo exacto. La UI no muestra RawMappingSuggest / badges de porcentaje.
- **Edición en tabla:** Parámetro **`editingEnabled?: boolean`** (p. ej. en RawDataTable o RawImporterWorkflow). Si `false`, la tabla es solo lectura; no se muestra modo edición ni editCell.
- **Etapas del proceso:** Posibilidad de **habilitar/deshabilitar una etapa** (p. ej. saltar MAPPING si el archivo ya coincide, o ocultar la fase de proceso). Definir en Root o Workflow props como **`stages?: { mapping?: boolean; process?: boolean; result?: boolean }`** o equivalente para que el consumidor pueda ocultar o forzar una vista.

---

## Virtualización: manejando el infinito (sin dependencias externas)

Con 100.000 filas, renderizar 100.000 `<tr>` colapsa el navegador. La solución: **solo renderizar las filas que caben en pantalla** (p. ej. 20–30) y reutilizarlas al hacer scroll.

**Principio:** La librería Raw **no integra** @tanstack/react-virtual ni ninguna otra lib de virtualización. Proporciona **prop-getters** estándar para que el consumidor las use con la lib que prefiera (o con su propia lógica).

- **RawTableBody** no itera sobre un array gigante. Expone **getRowProps** (y acceso a **getRows** / **totalRowCount** del Core) para que el consumidor itere con su virtualizador.
- **getRowProps({ index, style })**:
  - **index**: el Raw lo usa para pedir esa fila al Core (p. ej. `getRows(index, 1)` o equivalente).
  - **style**: el consumidor pasa los estilos de posicionamiento que su lib de virtualización calcula (`height`, `transform: translateY(...)`). El getter los fusiona y aplica al `<tr>`.
  - **isRowLoading** o **isPlaceholder** (booleano): cuando el Core tarda unos ms en entregar la fila (scroll muy rápido en 100k filas), el getter devuelve `true` para que la UI pinte una **fila skeleton** (esqueleto) y evite saltos visuales. El consumidor puede usar `[data-placeholder="true"]` en Tailwind.

Ejemplo de uso en la lib de estilos (el consumidor usa @tanstack/react-virtual por su cuenta):

```ts
virtualRows.map(virtualRow => (
  <RawTableRow
    key={virtualRow.key}
    {...getRowProps({
      index: virtualRow.index,
      style: {
        height: `${virtualRow.size}px`,
        transform: `translateY(${virtualRow.start}px)`,
      },
    })}
  />
))
```

La lógica de errores y selección de fila sigue intacta en el Raw; solo el posicionamiento y el índice vienen del consumidor.

---

## Accesibilidad de teclado (A11y Grid)

Una tabla de datos profesional debe poder **navegarse con las flechas del teclado** (Roaming Tabindex), como AG Grid o DataGrid.

**Responsabilidad Raw:** RawDataTable o RawTableBody gestionan la navegación por teclado. **getRowProps** o **getCellProps** deben inyectar **onKeyDown** (o un handler que el Raw registra) para que, al presionar ArrowDown / ArrowUp / ArrowLeft / ArrowRight, el foco se mueva a la celda correspondiente. El Raw no define estilos; solo asegura que el foco se mueva correctamente y que el consumidor pueda aplicar estilos al foco (outline, etc.) vía atributos data o clase. Documentar en ai-context el comportamiento esperado (tabindex, orden de celdas) para que la UI sea accesible.

**Fine-tuning (foco en celdas virtualizadas):** Cuando el usuario navega con las flechas y **llega al borde de la ventana virtual**, la siguiente fila (o celda) puede **no existir aún en el DOM** porque el virtualizador solo renderiza las filas visibles. RawTableBody debe asegurarse de **disparar el scroll** (o notificar al virtualizador del consumidor) para que esa fila se renderice y pueda **recibir el foco**. Como el Raw maneja el **onKeyDown**, ese evento debe poder **comunicarse con el virtualizador** del consumidor: por ejemplo, el Raw puede invocar un callback **onNavigateToIndex?(index)** que el consumidor pasa al montar el cuerpo y que hace scroll a ese índice en su lib de virtualización; o el Raw expone una ref/API para que el virtualizador registre una función "scrollToIndex". Documentar en Step 5 y en ai-context esta coordinación Raw ↔ virtualizador.

---

## Mapping Experience (Fuzzy Matching UI)

Cuando el Core detecta que una columna del CSV **se parece** a un campo del Layout pero no es idéntica, la UI debe poder mostrar una **sugerencia** con porcentaje de coincidencia.

- **RawMappingSuggest** (o getter en RawMappingRow): expone **matchScore** (0–100) y **suggestedFieldId** cuando el Core devuelve una coincidencia fuzzy. La UI puede mostrar un badge tipo "Columna 'E-mail' coincide 90% con campo 'email'".
- **Desactivar fuzziness:** Parámetro **fuzzyMatch?: boolean** (en Root o en la fase de mapeo). Si `false`, el Core no aplica fuzzy matching; solo coincidencias exactas. RawMappingSuggest no muestra sugerencias (o no se usa).

---

## Telemetría y errores fatales

- **Errores fatales:** Si el Worker falla (p. ej. falta de memoria), el usuario de la UI debe poder mostrar un mensaje útil ("Tu navegador se quedó sin memoria"), no solo "Error". **RawStatusIndicator** en estado `error` debe exponer un **objeto de diagnóstico** (`errorDetail`) para que la UI decida el texto. La forma de `errorDetail` debe alinearse con lo que exporte el headless: típicamente **SheetError** (`code`, `params?`, `level?`, `message?`) o un tipo específico para errores fatales/Worker si el headless lo define. Opcionalmente **RawErrorBoundary** que envuelve el flujo y captura errores fatales de React + Worker, mostrando un slot o fallback.
- **Telemetría:** El headless expone **`useImporter().metrics`** (tipo **PipelineMetrics**: timings, totalMs, rowCount, etc.) tras un run completo. La UI Raw debe **reexportar** ese acceso: ya sea un wrapper **`useImporterMetrics()`** que devuelva `useImporter().metrics`, o documentar en ai-context que el usuario obtiene la telemetría vía el hook reexportado `useImporter()`. No es obligatorio un componente Raw; puede ser solo hook + slot en renderResult.

---

## Corrección de errores: Optimistic UI y estado pending

En RESULT el usuario edita una celda para corregir un error. La validación ocurre en un **Web Worker** (asíncrona), así que hay latencia entre escribir y que el sistema responda "está bien".

**Comportamiento estándar (compatibilidad vía data/aria; sin librerías):**

1. **Optimistic update:** RawTableCell muestra el **nuevo valor de inmediato** en pantalla al editar, antes de que el Worker responda.
2. **Estado "validando":** Mientras el Worker valida, **getCellProps** devuelve **`data-pending="true"`**. La librería de estilos del consumidor (p. ej. Tailwind) puede usar `[data-pending="true"]` para poner la celda en gris o mostrar un spinner.
3. **Cuando el Worker termina:** el Core actualiza el estado; **data-pending** pasa a `false`. Si hay error de validación, el getter expone **`aria-invalid`** (y opcionalmente el slot de error con RawErrorBadge).

La Raw no integra spinners ni librerías; solo atributos estándar (`data-pending`, `aria-invalid`) para que el consumidor estilice con CSS/Tailwind.

---

## Flujo de negocio en la UI (resumen)

| Paso          | Hook de esta lib                      | Hook / API del Core                        |
| ------------- | ------------------------------------- | ------------------------------------------ |
| 1. Carga      | useRawFilePicker                      | `processFile` (registro de archivo)        |
| 2. Mapeo      | useRawMappingTable / useRawMappingRow | `useConvert`                               |
| 3. Proceso    | useRawProgress / useRawStatus         | `useImporterStatus` + EventTarget          |
| 4. Revisión   | useRawDataTable                       | `useSheetData`                             |
| 5. Corrección | useRawCell                            | `useSheetEditor` (`editCell`)              |
| 6. Finalizar  | useRawExport                          | `useSheetView` / downloadCSV, downloadJSON |

(Wrappers RawFilePicker, RawTableCell, etc. son opcionales y solo delegan en estos hooks.)

---

## Estructura de archivos y Public API (index.ts selectivo)

Todo el código que se publica como librería vive bajo **`src/`**. El **`index.ts`** prioriza **hooks** como API principal; wrappers y orquestador son opcionales.

**Exportar (en este orden de importancia):**

1. **Hooks useRaw\*** — useRawFilePicker, useRawMappingTable, useRawMappingRow, useRawMappingSuggest, useRawImportAction, useRawProgress, useRawStatus, useRawAbort, useRawDataTable, useRawTableHead, useRawTableBody, useRawTableRow, useRawCell, useRawErrorBadge, useRawPagination, useRawFilterToggle, useRawExport, useRawPersistence, etc. (cada uno devuelve estado, acciones y prop-getters).
2. **Reexport de hooks del headless** — useImporterStatus, useConvert, useSheetData, useSheetEditor, processFile, abort, downloadCSV, downloadJSON, etc., para consumo sin wrappers.
3. **RawImporterRoot** (provider con layout) y, opcionalmente, **wrappers** (RawFilePicker, RawTableCell, …) y **RawImporterWorkflow** (orquestador).
4. **Tipos públicos** (SheetLayout, SheetError, ImporterStatus, tipos de retorno de los hooks, etc.).

**No exportar:** Hooks internos que solo implementan los wrappers. El consumidor que quiera control total usa los useRaw\* y los hooks del headless reexportados.

| Ruta                  | Contenido                                                                                             |
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| **`src/`**            | Código que se compila como lib (tsup/build).                                                          |
| **`src/shared/`**     | Tipos públicos, reexport de hooks del headless, utilidades.                                           |
| **`src/hooks/`**      | Hooks públicos **useRaw\*** (núcleo de la lib).                                                       |
| **`src/components/`** | Wrappers opcionales (uno por carpeta) que usan los hooks y exponen render props; RawImporterWorkflow. |

Ejemplo de estructura:

```text
src/
  shared/
    types/
    (reexport headless)
  hooks/
    useRawFilePicker.ts
    useRawCell.ts
    useRawTableBody.ts
    ...
  components/        (opcionales; cada uno usa el hook correspondiente)
    RawFilePicker/
    RawTableCell/
    RawDataTable/
    ...
    RawImporterWorkflow/
  index.ts           (hooks primero, luego provider, wrappers, tipos)
```

---

## Construction Steps

Plan de construcción por pasos. Ejecutar en orden. Cada step tiene su checklist en `Construction Steps/`. Enfoque **hooks y prop-getters**; wrappers opcionales.

| Step  | Archivo                                                                                             | Descripción                                                                                                                                                                       |
| ----- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | [step-01-settings.md](Construction%20Steps/step-01-settings.md)                                     | Settings: stack, dependencias, ESLint, Prettier, Vitest, Storybook, Husky, lint-staged, Commitlint                                                                                |
| **2** | [step-02-root-and-status-view-hooks.md](Construction%20Steps/step-02-root-and-status-view-hooks.md) | Root & Status View: useRawImporterRoot, useStatusView; reexport headless; Public API; opcional RawImporterRoot, RawStatusGuard                                                    |
| **3** | [step-03-input-phase-hooks.md](Construction%20Steps/step-03-input-phase-hooks.md)                   | Entrada: useRawFilePicker (getRootProps, getInputProps), useRawMappingTable, useRawMappingRow, useRawMappingSuggest, useRawImportAction; wrappers opcionales                      |
| **4** | [step-04-feedback-phase-hooks.md](Construction%20Steps/step-04-feedback-phase-hooks.md)             | Feedback: useRawProgress, useRawStatus (errorDetail), useRawAbort; RawErrorBoundary; useImporter().metrics; wrappers opcionales                                                   |
| **5** | [step-05-data-phase-hooks.md](Construction%20Steps/step-05-data-phase-hooks.md)                     | Datos: useRawDataTable, useRawTableHead, useRawTableBody (getRowProps), useRawTableRow, useRawCell (getCellProps, getEditInputProps), useRawErrorBadge; A11y; wrappers opcionales |
| **6** | [step-06-view-phase-hooks.md](Construction%20Steps/step-06-view-phase-hooks.md)                     | Salida: useRawPagination, useRawFilterToggle, useRawExport, useRawPersistence; wrappers opcionales                                                                                |
| **7** | [step-07-orchestrator-workflow.md](Construction%20Steps/step-07-orchestrator-workflow.md)           | Orquestador: RawImporterWorkflow (compone hooks o wrappers por vista: IDLE → FilePicker; MAPPING → Mapping; PROCESSING → Progress + Abort; RESULT → Toolbar + Grid + Footer)      |

---

## Estado actual

- **Step completado:** **Step 6** (View Phase). Implementados **useRawPagination** (page, pageSize, totalRows, setPage, setPageSize), **useRawFilterToggle** (filterMode, setFilterMode), **useRawExport** (downloadCSV, downloadJSON), **useRawPersistence** (hasRecoverableSession, recoverSession, clearSession); **ViewPhaseContext**, **RawViewPhaseProvider**; tipo **FilterMode** en `src/shared/types/view-phase.ts`. Los cuatro hooks leen del mismo contexto (una sola llamada a useSheetView del headless). Siguiente: Step 7 (orchestrator).
- **Artefactos Step 2:** hooks **useRawImporterRoot**, **useStatusView**; tipos **StatusView**, **getViewFromState** en `src/shared/types/`; wrappers **RawImporterRoot**, **RawStatusGuard**.
- **Artefactos Step 3:** hooks **useRawFilePicker**, **useRawMappingTable**, **useRawMappingRow**, **useRawMappingSuggest**, **useRawImportAction**; tipos **LayoutFieldOption**, **MappingStatus**, **RawMappingRowContext**, **RawMappingSuggestContext**, **getLayoutFieldOptions**; utilidad **getSimilarity** en `src/shared/utils/fuzzy-similarity.ts`; wrappers RawFilePicker, RawMappingTable, RawMappingRow, RawMappingSuggest, RawImportAction.
- **Artefactos Step 4:** hooks **useRawProgress**, **useRawStatus**, **useRawAbort**, **useImporterMetrics**; componente **RawErrorBoundary**; wrappers RawProgressDisplay, RawStatusIndicator, RawAbortButton.
- **Artefactos Step 5:** hooks **useRawDataTable**, **useRawTableHead**, **useRawTableBody**, **useRawTableRow**, **useRawCell**, **useRawErrorBadge**; **DataTableContext**, **RawDataTableProvider**; tipos en `src/shared/types/data-phase.ts`. Wrappers RawDataTable, RawTableHead, RawTableBody, RawTableRow, RawTableCell, RawErrorBadge son opcionales (no implementados en este step).
- **Artefactos Step 6:** hooks **useRawPagination**, **useRawFilterToggle**, **useRawExport**, **useRawPersistence**; **ViewPhaseContext**, **RawViewPhaseProvider**; tipo **FilterMode** en `src/shared/types/view-phase.ts`. Wrappers RawPagination, RawFilterToggle, RawExportButton, RawPersistenceBanner son opcionales (no implementados en este step).
- **Prioridad:** Implementar y documentar los **hooks useRaw\*** como núcleo (getRootProps, getInputProps, getCellProps, getRowProps, etc.); los wrappers (RawFilePicker, RawTableCell, etc.) son capa opcional que usa esos hooks. El orquestador **RawImporterWorkflow** (Step 7) compone hooks (o wrappers) por vista.
- **Documentación:** `ai-context.md` se actualiza por **hook** (getters, estado, acciones) para que integradores y futuras libs de UI sepan consumir la lib solo con hooks. La lib mantiene **contrato estándar** (data-_, aria-_) y **no integra** virtualización ni UI; el consumidor aplica estilos e integraciones.

---

## Dependencia headless

- **Engine:** `@cristianm/react-import-sheet-headless`
- **Contrato:** https://github.com/cristianm-developer/react-import-sheet-headless/blob/main/ai-context.md

Pipeline en el Core: **Parser → Convert → Sanitizer → Validator → Transform**. Esta lib solo expone UI Raw (sin estilos); la lógica vive en el headless.
