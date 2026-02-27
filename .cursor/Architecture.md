# Architecture — @cristianm/react-import-sheet-ui-raw

Esquema de pasos y estado actual del proyecto. La librería se divide en **componentes atómicos/estructurales** (Raw, sin CSS) y un **orquestador** "llave en mano". Actualizar cuando cambien features o la estructura.

---

## Visión: Headless (cerebro) + UI Raw (nervios y músculos)

- **Engine:** `@cristianm/react-import-sheet-headless` — lógica (Parser → Convert → Sanitizer → Validator → Transform).
- **Esta lib:** solo estructura HTML correcta, eventos conectados al Core y **prop-getters** para que el consumidor aplique Tailwind/CSS.

**Entrada de configuración:** El usuario pasa el **layout objetivo** (SheetLayout) como parámetro — típicamente a **RawImporterRoot** — para definir el esquema de columnas/campos al que se mapean los datos del archivo. Opcionalmente también `engine`, `persist`, `persistKey`.

---

## Dos categorías de componentes

### 1. Componentes Atómicos / Estructurales (Librería "Raw")

Sin CSS. Objetivo: estructura HTML correcta y conexión de eventos con el Core.

| Fase | Componente | Responsabilidad breve |
|------|------------|------------------------|
| **Entrada (Upload & Mapping)** | **RawFilePicker** | Drag-and-drop + input file; expone `isDragging`. |
| | **RawMappingTable** | Tabla para asociar columnas detectadas (Parser) con campos del SheetLayout. |
| | **RawMappingRow** | Fila: Header Original → Selector campo destino → Estado (Válido/Maltrecho). |
| | **RawMappingSuggest** | Expone **porcentaje de coincidencia** cuando el Core detecta columna "similar" a un campo (fuzzy); badge/sugerencia (ej: "E-mail" 90% con "email"). Param para **desactivar fuzziness**. |
| | **RawImportAction** | Botón que ejecuta `processFile`; `disabled` si el mapeo es incompleto. |
| **Feedback (Progress & Status)** | **RawProgressDisplay** | Alto rendimiento: suscripción a EventTarget `importer-progress`, actualiza vía ref (sin re-renders). |
| | **RawStatusIndicator** | Estado actual (parsing, validating, success, error); en **error** expone **objeto de diagnóstico** (no solo texto) para mensajes como "Sin memoria". |
| | **RawAbortButton** | Botón que llama a `abort()` del core (detener Workers). |
| **Datos (Grid & Edit)** | **RawDataTable** | Contenedor principal; gestiona **Roaming Tabindex** (navegación con flechas). Edición activable/desactivable por param. |
| | **RawTableHead** | Cabeceras definidas en el Layout. |
| | **RawTableBody** | Cuerpo: **getRowProps** con **isRowLoading/isPlaceholder** para fila skeleton; virtualización por el consumidor. |
| | **RawTableRow** | Fila; **getRowProps({ index, style })** + **onKeyDown** inyectado para A11y; expone `row.errors`. |
| | **RawTableCell** | Lectura/Edición; **render prop** `(state) => ...` para input/datepicker/checkbox custom; optimistic update, `data-pending`, `aria-invalid`. |
| | **RawErrorBadge** | Slot para SheetError.code + función de traducción (I18n) del usuario. |
| **Errores / Telemetría** | **RawErrorBoundary** | Captura errores fatales (ej. Worker murió por falta de memoria); opcional telemetría vía **useImporter().metrics** (o wrapper useImporterMetrics()) para resumen (ej. "10.000 filas en 1,2s"). |
| **Navegación y Salida** | **RawPagination** | Siguiente/Anterior vinculados a `setPage`. |
| | **RawFilterToggle** | Switch entre `filterMode: 'all'` y `'errors-only'`. |
| | **RawExportButton** | Dispara `downloadCSV` o `downloadJSON`. |
| | **RawPersistenceBanner** | Recuperar/Limpiar sesión (cuando hay sesión recuperable). La acción "Limpiar" en la UI se documenta como **clearSession**; en el headless el método exportado es **clearPersistedState()** — la lib puede exponer un alias `clearSession` que llame a `clearPersistedState()`. |

### 2. Orquestador (Implementación "Todo construido")

Un solo componente de alto nivel que el usuario "rápido" puede usar arrastrando y soltando.

| Componente | Descripción |
|------------|-------------|
| **RawImporterWorkflow** | Gestiona la **máquina de estados** de la UI. Compone todos los Raw y decide qué mostrar en cada estado. |

**Estados y qué muestra RawImporterWorkflow:**

| Estado | Muestra |
|--------|---------|
| **IDLE** | RawFilePicker. |
| **MAPPING** | RawMappingTable (usuario asocia CSV ↔ Layout). |
| **PROCESSING** | RawProgressDisplay + RawAbortButton. |
| **RESULT** | Toolbar (RawFilterToggle + RawExportButton) + Grid (RawDataTable con edición) + Footer (RawPagination + RawPersistenceBanner). |

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

## Uso avanzado: hooks expuestos y funciones nativas

El usuario puede **prescindir de componentes Raw** y usar la lógica del Core por su cuenta. La librería debe **exponer (o reexportar) hooks** del headless para que pueda:

1. **No usar RawFilePicker**: importar el archivo por su cuenta (input nativo, otra lib, drag externo) y **pasarlo a la librería** llamando p. ej. a `processFile(file)` (o el método que exponga el headless). Sigue usando RawMappingTable / RawImportAction / etc. si quiere, o solo el flujo de datos.
2. **Construir su propia tabla**: usar **useSheetData()**, **getRows()**, **useSheetEditor()** (editCell) desde los hooks expuestos y renderizar su propio grid/table sin RawDataTable, RawTableRow, RawTableCell.
3. **Montar solo el provider y su UI**: usar **RawImporterRoot** con `layout` y, en lugar de RawImporterWorkflow o RawStatusGuard, leer **useImporterStatus()**, **useConvert()**, etc. y decidir qué pantalla mostrar y con qué componentes (propios o Raw).

**Contrato:** La lib reexporta o reexpone desde el headless los hooks y métodos necesarios (p. ej. `useImporterStatus`, `useConvert`, `useSheetData`, `useSheetEditor`, `processFile`, `abort`, `downloadCSV`, `downloadJSON`), de modo que el usuario pueda usar **solo** RawImporterRoot + esos hooks y construir toda la UI a mano. Los componentes Raw son **opcionales** y de conveniencia.

---

## Estrategia Prop-Getters (Raw)

Para que la lib sea fácil de estilizar con Tailwind o CSS, cada componente Raw sigue el patrón **prop-getters**: la librería entrega getters que el desarrollador aplica a sus nodos.

Ejemplo (API interna de una celda Raw):

```ts
const { getCellProps, getErrorProps } = useRawCell(cellContext);

return (
  <td {...getCellProps({ className: "tu-clase-tailwind" })}>
    {cell.value}
    {cell.errors && <span {...getErrorProps()} />}
  </td>
);
```

Cada componente Raw debe documentar en `ai-context.md` sus getters (p. ej. `getRootProps`, `getInputProps`, `getCellProps`, `getErrorProps`) y las props que aceptan (p. ej. `className`, `style`).

---

## Política de Slots y Render Props

Cuando el HTML por defecto no basta (p. ej. el usuario quiere un datepicker, checkbox o input custom en una celda), los componentes atómicos aceptan **children como función** (render prop).

**Regla:** Los componentes Raw que renderizan contenido variable (celda, fila de mapeo, etc.) pueden aceptar **children: (state) => ReactNode**. El Raw pasa un objeto **state** con getters, flags y datos; el consumidor devuelve lo que quiera (input nativo, componente custom, etc.).

**Ejemplo RawTableCell:**

```tsx
<RawTableCell>
  {(state) =>
    state.isEditing
      ? <MyCustomInput {...state.getEditInputProps()} />
      : <span>{state.value}</span>
  }
</RawTableCell>
```

`state` incluye al menos: `isEditing`, `value`, `getEditInputProps()`, `errors`, `pending`. Otros componentes (RawMappingRow, RawErrorBadge, etc.) siguen el mismo patrón donde tenga sentido. Si no se pasa children, el Raw usa un render por defecto (input nativo en celda, etc.).

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

| Paso | Componente Raw | Hook del Core |
|------|----------------|---------------|
| 1. Carga | RawFilePicker | `processFile` (registro de archivo) |
| 2. Mapeo | RawMappingTable / RawMappingRow | `useConvert` |
| 3. Proceso | RawProgressDisplay | `useImporterStatus` + EventTarget |
| 4. Revisión | RawDataTable | `useSheetData` |
| 5. Corrección | RawTableCell | `useSheetEditor` (`editCell`) |
| 6. Finalizar | RawExportButton | `useSheetView` / downloadCSV, downloadJSON |

---

## Estructura de archivos y Public API (index.ts selectivo)

Todo el código que se publica como librería vive bajo **`src/`**. El **`index.ts`** de la raíz debe ser **extremadamente selectivo**: solo lo que el consumidor necesita.

**Exportar únicamente:**

1. **Componentes Raw** (RawFilePicker, RawMappingTable, RawMappingRow, RawMappingSuggest, RawImportAction, RawProgressDisplay, RawStatusIndicator, RawAbortButton, RawDataTable, RawTableHead, RawTableBody, RawTableRow, RawTableCell, RawErrorBadge, RawPagination, RawFilterToggle, RawExportButton, RawPersistenceBanner, RawImporterWorkflow, RawErrorBoundary).
2. **Prop-getters como hooks independientes** para uso avanzado: **useRawFilePicker**, **useRawTableCell**, etc. (los hooks que devuelven getRootProps, getCellProps, etc.), no los hooks **internos** usados para construir los componentes.
3. **Tipos públicos** (SheetLayout, SheetError, ImporterStatus, tipos de state de render props, etc.).

**No exportar:** Hooks internos que solo sirven para implementar los Raw (p. ej. lógica interna de RawTableBody). El consumidor que quiera control total usa los hooks del headless reexportados (useImporterStatus, useSheetData, etc.), no los internos de la lib.

| Ruta | Contenido |
|------|------------|
| **`src/`** | Código que se compila como lib (tsup/build). |
| **`src/shared/`** | Tipos públicos, reexport de hooks del headless, utilidades. Hooks internos en módulos no reexportados desde index. |
| **`src/components/`** | Componentes Raw atómicos y orquestador (uno por carpeta). |

Ejemplo de estructura:

```text
src/
  shared/
    types/
    hooks/          (reexport headless + hooks públicos useRaw*)
  components/
    RawFilePicker/
    RawMappingTable/
    RawMappingRow/
    RawMappingSuggest/
    RawImportAction/
    RawProgressDisplay/
    RawStatusIndicator/
    RawAbortButton/
    RawDataTable/
    RawTableHead/
    RawTableBody/
    RawTableRow/
    RawTableCell/
    RawErrorBadge/
    RawPagination/
    RawFilterToggle/
    RawExportButton/
    RawPersistenceBanner/
    RawImporterWorkflow/
    RawErrorBoundary/
  index.ts          (solo componentes, useRaw*, tipos públicos)
```

---

## Construction Steps

Plan de construcción por pasos. Ejecutar en orden. Cada step tiene su checklist en `Construction Steps/`.

| Step | Archivo | Descripción |
|------|---------|-------------|
| **1** | [step-01-settings.md](Construction%20Steps/step-01-settings.md) | Settings: stack, dependencias, ESLint, Prettier, Vitest, Storybook, Husky, lint-staged, Commitlint |
| **2** | [step-02-root-and-status-guard.md](Construction%20Steps/step-02-root-and-status-guard.md) | RawImporterRoot (layout, **fuzzyMatch**, **stages**, **editingEnabled**), RawStatusGuard, hooks reexport, **Public API** (index selectivo) |
| **3** | [step-03-input-phase-components.md](Construction%20Steps/step-03-input-phase-components.md) | Entrada: RawFilePicker, RawMappingTable, RawMappingRow, **RawMappingSuggest** (fuzzy + param off), RawImportAction |
| **4** | [step-04-feedback-phase-components.md](Construction%20Steps/step-04-feedback-phase-components.md) | Feedback: RawProgressDisplay, RawStatusIndicator (**errorDetail** alineado con headless), RawAbortButton; **RawErrorBoundary**; telemetría vía **useImporter().metrics** o wrapper useImporterMetrics() |
| **5** | [step-05-core-visual-data-table.md](Construction%20Steps/step-05-core-visual-data-table.md) | Datos: RawDataTable (**A11y** Roaming Tabindex, **editingEnabled**), RawTableBody (**isPlaceholder**), RawTableRow (onKeyDown), RawTableCell (**render prop**), RawErrorBadge |
| **6** | [step-06-view-phase-components.md](Construction%20Steps/step-06-view-phase-components.md) | Salida: RawPagination, RawFilterToggle, RawExportButton, RawPersistenceBanner |
| **7** | [step-07-orchestrator-workflow.md](Construction%20Steps/step-07-orchestrator-workflow.md) | Orquestador: RawImporterWorkflow (máquina de estados + composición de todos los Raw) |

---

## Estado actual

- **Step en curso:** según avance (Step 4 completado en componentes anteriores; nombres alineados con Gemini en esta arquitectura).
- **Componentes Raw:** seguir la tabla de "Componentes Atómicos" más arriba; el orquestador **RawImporterWorkflow** se implementa en Step 7.
- **Documentación:** `ai-context.md` (en raíz) se actualiza al finalizar cada componente para que librerías Tailwind/CSS sepan consumirlos vía prop-getters. La lib mantiene **compatibilidad estándar** (data-*, aria-*) y **no integra** librerías de virtualización ni de UI; el consumidor las añade si las necesita.

---

## Dependencia headless

- **Engine:** `@cristianm/react-import-sheet-headless`
- **Contrato:** https://github.com/cristianm-developer/react-import-sheet-headless/blob/main/ai-context.md

Pipeline en el Core: **Parser → Convert → Sanitizer → Validator → Transform**. Esta lib solo expone UI Raw (sin estilos); la lógica vive en el headless.
