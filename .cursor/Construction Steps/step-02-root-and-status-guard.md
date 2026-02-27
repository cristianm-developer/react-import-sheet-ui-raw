# Step 2 — Componentes de Conexión (Root & Context)

Plan para implementar el **wrapper global** y el **controlador de vistas**: inicialización del `ImporterProvider` del Core y el componente que decide qué pantalla mostrar según el status.

---

## 1. Objetivo

- **RawImporterRoot**: wrapper que inicializa el `ImporterProvider` del headless. Recibe el **layout objetivo** (SheetLayout) y opcionalmente `engine`, `persist`, `persistKey`. Parámetros de **customización**: **fuzzyMatch?** (boolean, default true — desactiva sugerencias fuzzy en mapeo), **editingEnabled?** (boolean — activa/desactiva edición en tabla RESULT), **stages?** (objeto para habilitar/deshabilitar etapas: mapping, process, result) para que el usuario pueda ocultar o forzar una fase.
- **RawStatusGuard**: componente "controlador" que, según el **status** del Core (y `convertResult`), decide qué vista mostrar: **IDLE**, **MAPPING**, **PROCESSING** o **RESULT**. Debe respetar **stages** si el Root los pasa (p. ej. no mostrar MAPPING si stages.mapping === false).

---

## 2. Contrato con el Headless (alineado con la implementación real)

Referencia: [ai-context del headless](https://github.com/cristianm-developer/react-import-sheet-headless/blob/main/ai-context.md) y código en `react-import-sheet-headless/src`.

### 2.1 ImporterProvider

- **Props** (`ImporterProviderProps`): **`children`** (ReactNode), **`layout?`** (SheetLayout | null), **`engine?`** ('xlsx' | 'csv' | 'auto' | null), **`persist?`** (boolean), **`persistKey?`** (string). No existe un objeto `config`; se pasan `layout` y `engine` (y opcionalmente `persist`, `persistKey`) como props directas.
- **Uso**: `<ImporterProvider layout={…} engine="auto">{children}</ImporterProvider>`. El provider no renderiza un nodo DOM propio; solo `<ImporterContext.Provider value={…}>{children}</ImporterContext.Provider>`.

### 2.2 Estado y status

- **Hook de status**: **`useImporterStatus()`** — retorna `{ status, progressEventTarget }`. Debe usarse dentro de `ImporterProvider`.
- **Tipo de status** (exportado como **`ImporterStatus`** en el headless):
  - `'idle'` | `'loading'` | `'parsing'` | `'validating'` | `'transforming'` | `'success'` | `'error'` | `'cancelled'`.
- **Progreso**: eventos en `progressEventTarget` (`importer-progress`, `importer-aborted`); ver ai-context del headless.

### 2.3 Vista "Mapeo" (no es un status)

En el headless **no hay un status "mapping"**. La pantalla de mapeo de columnas corresponde a cuando **`convert()`** (de **`useConvert()`**) devuelve **`convertResult`** (hay desajustes de cabeceras). Es decir: **convertResultData** en el contexto está definido y el usuario debe reordenar/renombrar y llamar a **`applyMapping()`**.

- **IDLE (Carga)**: `status` ∈ `'idle' | 'loading' | 'parsing'` y no hay que mostrar mapeo.
- **MAPPING (Mapeo)**: `convertResult !== null` (de **`useConvert()`**), independientemente del status. Suele darse tras parsing cuando el layout no coincide con las cabeceras del archivo.
- **PROCESSING (Proceso)**: `status` ∈ `'validating' | 'transforming'`.
- **RESULT (Tabla Final)**: `status === 'success'` (y `result` disponible vía **`useSheetData()`**).
- **Error / cancelado**: `status` ∈ `'error' | 'cancelled'`; se puede tratar como IDLE (reintentar) o vista de error según diseño.

Por tanto, **RawStatusGuard** debe usar **`useImporterStatus()`** y, para la vista Mapeo, **`useConvert()`** (o acceso al contexto que exponga **convertResultData** / **convertResult**). Definir en este proyecto un **mapeo estable** (status + convertResult) → vista en `src/shared/types/`: vistas **`'idle' | 'mapping' | 'process' | 'result' | 'error'`** para que RawStatusGuard y el orquestador **RawImporterWorkflow** compartan la misma semántica.

---

## 3. Checklist de tareas

### 3.1 Estructura de carpetas

- [ ] Bajo `src/components/` crear:
  - [ ] **`RawImporterRoot/`** — wrapper + provider.
  - [ ] **`RawStatusGuard/`** — controlador de vistas.
- [ ] Cada componente en su carpeta con al menos: `RawX.tsx`, `index.ts`, y opcionalmente `RawX.test.tsx`, tipos en `types.ts` si aplica.

### 3.2 RawImporterRoot

- [ ] **Props**: las mismas que **`ImporterProvider`** del headless: **`children`**, **`layout?`** (SheetLayout — layout objetivo), **`engine?`**, **`persist?`**, **`persistKey?`**; más **`className?`**, **`style?`**. **Customización**: **`fuzzyMatch?`** (boolean, default true — si false, no se usan sugerencias fuzzy en mapeo); **`editingEnabled?`** (boolean, default true — si false, tabla en solo lectura); **`stages?`** (p. ej. `{ mapping?: boolean; process?: boolean; result?: boolean }` — permite ocultar una etapa). Reexportar o extender `ImporterProviderProps`; documentar en JSDoc.
- [ ] **Implementación**: renderizar **`ImporterProvider`** del headless (pasando `layout`, `engine`, `persist`, `persistKey`, `children`). Los params **fuzzyMatch**, **editingEnabled**, **stages** deben estar disponibles en el árbol (contexto propio o pasados a RawStatusGuard/RawImporterWorkflow vía contexto) para que los componentes hijos los respeten. Opcionalmente envolver en un **`div`** con ref, className, style y `data-ris-ui="raw-importer-root"`.
- [ ] **Contrato Raw**: si se añade un `div` wrapper, ref a ese `div`, `className` y `style` en él, e identificación única. Si no se añade wrapper, documentar que el nodo raíz es el provider (sin DOM propio) y que ref/className/style no aplican al root.
- [ ] **Identificación**: `data-ris-ui="raw-importer-root"` en el elemento raíz (el `div` wrapper si existe).
- [ ] **Export**: desde `src/components/RawImporterRoot/index.ts` y reexport en `src/index.ts`.

### 3.3 RawStatusGuard

- [ ] **Props**:
  - `className?: string`, `style?: React.CSSProperties` (obligatorios por convención Raw).
  - Slots por vista: **`renderIdle?`** (Carga), **`renderMapping?`** (Mapeo), **`renderProcess?`** (Proceso), **`renderResult?`** (Tabla Final), y opcionalmente **`renderError?`** para `error`/`cancelled`. Cada uno recibe opcionalmente datos útiles (status, progressEventTarget, convertResult, etc.) si se usa render props.
- [ ] **Lógica**:
  - Usar **`useImporterStatus()`** del headless para **`status`** (y **`progressEventTarget`** si se quiere mostrar progreso).
  - Usar **`useConvert()`** del headless para **`convertResult`**: si **`convertResult !== null`** → vista **Mapeo** (independiente del status).
  - Para el resto: mapear **status** a vista (idle/loading/parsing → idle; validating/transforming → process; success → result; error/cancelled → idle o error). Aplicar el mapeo definido en `src/shared/types/` (status + convertResult → vista).
- [ ] **Sin UI propia**: renderizar solo el slot correspondiente a la vista decidida. Si no hay slot para esa vista, `null` o fallback configurable.
- [ ] **Ref, identificación**: `forwardRef` al contenedor raíz; `data-ris-ui="raw-status-guard"`.
- [ ] **Export**: desde `src/components/RawStatusGuard/index.ts` y reexport en `src/index.ts`.

### 3.4 Tipos y mapeo (status + convertResult) → vista

- [ ] En **`src/shared/types/`** (p. ej. `status-views.ts`): definir el tipo de **vista** **`'idle' | 'mapping' | 'process' | 'result' | 'error'`** y una función **`getViewFromState(status, convertResult)`** que devuelva la vista actual. Regla: si **convertResult !== null** → **'mapping'**; si no, derivar de **status** (idle/loading/parsing → idle; validating/transforming → process; success → result; error/cancelled → idle o error).
- [ ] Reutilizar el tipo **`ImporterStatus`** del headless si se exporta desde el paquete; si no, declarar un tipo local con los mismos valores y documentar la correspondencia.

### 3.5 Tests

- [ ] **RawImporterRoot**: test que verifique que se renderiza `ImporterProvider` y que los children se muestran (mock del provider si hace falta); que la prop `layout` se pasa al provider.
- [ ] **RawStatusGuard**: tests que, para cada combinación (status + convertResult) mockeada, comprueben que se renderiza el slot correcto (incluyendo vista Mapeo cuando `convertResult !== null`).

### 3.6 Storybook

- [ ] Story de **RawImporterRoot**: ejemplo mínimo con provider y un hijo (p. ej. un texto o un RawStatusGuard con slots placeholder).
- [ ] Story de **RawStatusGuard**: con mock del hook de status (o provider real si Storybook lo permite), mostrar el cambio de vista según status (controls para simular status).

### 3.7 Hooks expuestos para uso avanzado (sin componentes Raw)

- [ ] **Reexportar** desde el paquete (p. ej. en `src/index.ts` o `src/hooks.ts`) los hooks y métodos del headless que permitan al usuario usar la lógica sin componentes Raw: **useImporterStatus**, **useConvert**, **useSheetData**, **useSheetEditor** (editCell), **processFile** (o el método de registro de archivo), **abort**, **downloadCSV**, **downloadJSON**, y los que el headless exporte (filterMode/setPage, etc.). Así el usuario puede: (1) no usar RawFilePicker e importar el archivo por su cuenta y pasar el `File` a la lib vía processFile; (2) construir su propia tabla con useSheetData/getRows; (3) montar solo RawImporterRoot + hooks y su propia UI. Documentar en **ai-context.md** esta API de "uso nativo" o "uso avanzado".

### 3.8 Public API (index.ts selectivo)

- [ ] **index.ts** de la raíz debe exportar **solo**: (1) componentes Raw (RawImporterRoot, RawStatusGuard, etc.); (2) **prop-getters como hooks independientes** (useRawFilePicker, useRawTableCell, …) para uso avanzado, **no** los hooks internos usados para construir los Raw; (3) tipos públicos (SheetLayout, SheetError, ImporterStatus, tipos de state de render props). **No** exportar hooks internos de implementación.

### 3.9 Documentación

- [ ] Actualizar **`ai-context.md`**: fichas de RawImporterRoot (layout, **fuzzyMatch**, **editingEnabled**, **stages**, props, slots) y RawStatusGuard (props, slots, ejemplo de uso); sección **Uso avanzado** con hooks reexportados y ejemplos.
- [ ] Actualizar **Architecture.md**: estado "Step 2" y lista de componentes Raw (RawImporterRoot, RawStatusGuard).

---

## 4. Orden sugerido de ejecución

1. Confirmar imports desde headless: `ImporterProvider`, `useImporterStatus`, `useConvert`, tipos `ImporterStatus` y `ImporterProviderProps` (si exportados).
2. Crear en `src/shared/types/` el mapeo (status + convertResult) → vista y la función `getViewFromState`.
3. Implementar **RawImporterRoot** (wrapper del provider; **layout** como prop de entrada) y exportarlo.
4. Implementar **RawStatusGuard** (lectura de status + render por slot) y exportarlo.
5. **Reexportar hooks** del headless (useImporterStatus, useConvert, useSheetData, useSheetEditor, processFile, abort, downloadCSV, downloadJSON, etc.) desde `src/index.ts` o `src/hooks.ts` para uso avanzado sin componentes Raw.
6. Añadir tests para ambos componentes.
7. Añadir stories en Storybook (incluir ejemplo con `layout` pasado como prop).
8. Actualizar `ai-context.md` (layout como parámetro, sección Uso avanzado con hooks) e `Architecture.md`.

---

## 5. Notas

- **RawImporterRoot** es el único lugar donde se monta `ImporterProvider`; el usuario pasa el **layout objetivo** (y opcionalmente engine, persist, persistKey). Todo lo que dependa del estado del importador debe estar dentro de este árbol.
- **Hooks reexportados**: el usuario puede no usar componentes Raw y en su lugar usar los hooks expuestos (processFile para pasar un archivo importado por su cuenta, useSheetData/getRows para construir su propia tabla, etc.). Los componentes Raw son opcionales.
- **RawStatusGuard** no debe contener lógica de negocio del importador; solo lectura de status y elección de vista. Las vistas concretas (Carga, Mapeo, etc.) se implementan en steps posteriores y se inyectan vía slots.
- Mantener la convención de componentes Raw: `forwardRef`, `data-ris-ui="..."`, `className` y `style` en props.
- Si el headless cambia la API de provider o status, actualizar aquí y en `src/shared` el mapeo.

Cuando termines este step, el siguiente podrá implementar las **vistas concretas** (IDLE, MAPPING, PROCESSING, RESULT) que se inyectan en los slots de `RawStatusGuard`; el **Step 7** ensamblará todo en **RawImporterWorkflow**.

---

## 6. Resumen de congruencia con el headless

| Aspecto | Headless | Step 2 (UI Raw) |
|--------|----------|-----------------|
| **Layout** | `layout` (SheetLayout) define el esquema destino de columnas/campos | El usuario pasa **layout** como prop a RawImporterRoot (**layout objetivo**); se reenvía al ImporterProvider |
| **Provider** | `ImporterProvider({ children, layout?, engine?, persist?, persistKey? })`; sin nodo DOM propio | RawImporterRoot pasa esas props al provider; opcionalmente envuelve en un `div` con ref/className/style y `data-ris-ui="raw-importer-root"` |
| **Status** | `useImporterStatus()` → `{ status, progressEventTarget }`; `ImporterStatus`: idle, loading, parsing, validating, transforming, success, error, cancelled | RawStatusGuard usa `useImporterStatus()` y mapea status a vista (idle / process / result / error) |
| **Vista Mapeo** | No es un status; `useConvert()` devuelve `convertResult` cuando hay desajustes de cabeceras; el usuario aplica mapping con `applyMapping()` | RawStatusGuard usa `useConvert()`; si `convertResult !== null` → vista **mapping** con prioridad sobre status |
| **Vistas UI** | — | `'idle' | 'mapping' | 'process' | 'result' | 'error'`; slots **renderIdle**, **renderMapping**, **renderProcess**, **renderResult**, **renderError** |
| **Tipos** | `ImporterStatus`, `ImporterProviderProps` (y otros) en el headless | Reutilizar tipos exportados del headless; en `src/shared/types/` definir vista y `getViewFromState(status, convertResult)` |
