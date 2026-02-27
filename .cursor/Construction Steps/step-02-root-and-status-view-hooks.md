# Step 2 — Root & Status View (hooks)

Plan para implementar los **hooks** que exponen la lógica del headless: inicialización del `ImporterProvider` (y configuración raíz) y el hook que deriva la **vista actual** a partir del status y de `convertResult`. La lib es **hooks-first**: el producto principal son hooks y getters; los wrappers (RawImporterRoot, RawStatusGuard) son opcionales y solo delegan en estos hooks.

---

## 1. Objetivo

- **useRawImporterRoot** (o equivalente): hook que devuelve **providerProps** (para `ImporterProvider` del headless) y **rootConfig** (fuzzyMatch, editingEnabled, stages) para inyectar en contexto. El usuario puede montar él mismo `<ImporterProvider {...providerProps}>` y un `RootConfigContext.Provider` con ese config, o usar un componente mínimo que solo haga eso.
- **useStatusView** (o **useRawStatusView**): hook que, dentro del árbol del provider, lee **status** (`useImporterStatus`) y **convertResult** (`useConvert`) y devuelve la **vista actual** (`'idle' | 'mapping' | 'process' | 'result' | 'error'`) más los datos necesarios para renderizar (status, progressEventTarget, convertResult, etc.). Respeta **stages** del root config para no exponer vistas deshabilitadas. Sin UI: el usuario decide qué renderizar según la vista.
- Opcionalmente, **wrappers mínimos** (RawImporterRoot, RawStatusGuard) que solo usan estos hooks y entregan el resultado por render props, para quien prefiera no orquestar el árbol a mano.

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

Por tanto, **useStatusView** (y opcionalmente RawStatusGuard) debe usar **`useImporterStatus()`** y **`useConvert()`** para la vista Mapeo. Definir en este proyecto un **mapeo estable** (status + convertResult) → vista en `src/shared/types/`: vistas **`'idle' | 'mapping' | 'process' | 'result' | 'error'`** para que useStatusView y el orquestador **RawImporterWorkflow** compartan la misma semántica.

---

## 3. Checklist de tareas

### 3.1 Estructura de carpetas

- [ ] Bajo **`src/hooks/`** crear:
  - [ ] **`useRawImporterRoot/`** — hook que devuelve providerProps + rootConfig (y opcionalmente contexto/Provider para root config).
  - [ ] **`useStatusView/`** (o **`useRawStatusView/`**) — hook que devuelve vista actual + datos para render (status, progressEventTarget, convertResult, etc.).
- [ ] Cada hook en su carpeta con al menos: `useX.ts`, `index.ts`, y opcionalmente `useX.test.ts`, tipos en `types.ts` si aplica.
- [ ] Opcional: bajo **`src/components/`** wrappers mínimos que solo consumen estos hooks (RawImporterRoot, RawStatusGuard); cada uno con `RawX.tsx`, `index.ts`, tests y reexport en `src/index.ts`.

### 3.2 useRawImporterRoot (hook principal)

- [ ] **Firma**: `useRawImporterRoot(options)` donde **options** incluye: **`layout?`** (SheetLayout), **`engine?`**, **`persist?`**, **`persistKey?`**; **`fuzzyMatch?`** (boolean, default true); **`editingEnabled?`** (boolean, default true); **`stages?`** (`{ mapping?: boolean; process?: boolean; result?: boolean }`).
- [ ] **Retorno**: `{ providerProps, rootConfig }` — **providerProps** son las props para **`ImporterProvider`** del headless (`children` se inyecta al renderizar); **rootConfig** es `{ fuzzyMatch, editingEnabled, stages }` para poner en un contexto propio (RootConfigContext) y que hooks como useStatusView lo lean.
- [ ] **Implementación**: el hook no renderiza nada; solo calcula providerProps (layout, engine, persist, persistKey) y rootConfig a partir de options. Exportar también **RootConfigContext** y un **RootConfigProvider** mínimo que reciba `rootConfig` y envuelva children, para que el usuario pueda hacer: `<ImporterProvider {...providerProps}><RootConfigProvider rootConfig={rootConfig}>{children}</RootConfigProvider></ImporterProvider>`.
- [ ] **Export**: desde `src/hooks/useRawImporterRoot/index.ts` y reexport en `src/index.ts`.

### 3.3 useStatusView (hook principal)

- [ ] **Firma**: `useStatusView()` — debe usarse dentro de `ImporterProvider` (y opcionalmente dentro de RootConfigProvider para leer stages).
- [ ] **Retorno**: `{ view, status, progressEventTarget, convertResult, ... }` donde **view** es `'idle' | 'mapping' | 'process' | 'result' | 'error'`; el resto son los datos del headless para que el usuario renderice lo que quiera.
- [ ] **Lógica**:
  - Usar **`useImporterStatus()`** del headless para **status** y **progressEventTarget**.
  - Usar **`useConvert()`** del headless para **convertResult**. Si **convertResult !== null** → **view = 'mapping'** (prioridad sobre status).
  - Si no, derivar **view** de **status** con la función **getViewFromState(status, convertResult)** definida en `src/shared/types/`. Si existe rootConfig.stages, respetarlo (p. ej. si stages.mapping === false y la vista bruta sería 'mapping', devolver la vista alternativa según diseño, o 'idle').
- [ ] **Sin UI**: el hook solo devuelve datos; el usuario usa `view` para decidir qué renderizar.
- [ ] **Export**: desde `src/hooks/useStatusView/index.ts` y reexport en `src/index.ts`.

### 3.4 Wrappers opcionales (contenedores de hooks)

- [ ] **RawImporterRoot** (opcional): wrapper mínimo que llama a **useRawImporterRoot**, renderiza **ImporterProvider** + **RootConfigProvider** y opcionalmente un `div` con ref, className, style y `data-ris-ui="raw-importer-root"`. Solo entrega el árbol de providers; la lógica está en el hook.
- [ ] **RawStatusGuard** (opcional): wrapper que llama a **useStatusView()** y renderiza el slot correspondiente (renderIdle, renderMapping, renderProcess, renderResult, renderError) pasando los datos del hook. Ref/identificación `data-ris-ui="raw-status-guard"` si aplica. La “cabeza” es el hook; el wrapper solo inyecta ese resultado en render props.

### 3.5 Tipos y mapeo (status + convertResult) → vista

- [ ] En **`src/shared/types/`** (p. ej. `status-views.ts`): definir el tipo de **vista** **`'idle' | 'mapping' | 'process' | 'result' | 'error'`** y una función **`getViewFromState(status, convertResult)`** que devuelva la vista actual. Regla: si **convertResult !== null** → **'mapping'**; si no, derivar de **status** (idle/loading/parsing → idle; validating/transforming → process; success → result; error/cancelled → idle o error).
- [ ] Reutilizar el tipo **`ImporterStatus`** del headless si se exporta desde el paquete; si no, declarar un tipo local con los mismos valores y documentar la correspondencia.

### 3.6 Tests

- [ ] **useRawImporterRoot**: test que verifique que devuelve `providerProps` con layout/engine/persist/persistKey correctos y `rootConfig` con fuzzyMatch, editingEnabled, stages.
- [ ] **useStatusView**: tests que, para cada combinación (status + convertResult) mockeada, comprueben que devuelve el **view** correcto (incluyendo 'mapping' cuando convertResult !== null).
- [ ] Si existen wrappers opcionales: tests mínimos de RawImporterRoot (renderiza provider + children) y RawStatusGuard (renderiza el slot según view).

### 3.7 Storybook

- [ ] Story de **useRawImporterRoot**: ejemplo que use el hook para montar ImporterProvider + RootConfigProvider y muestre un hijo (p. ej. un texto o un consumer de useStatusView).
- [ ] Story de **useStatusView**: con provider real o mock, mostrar el valor de **view** y datos devueltos según status (controls para simular status). Opcional: story de RawStatusGuard con slots para ver el flujo completo.

### 3.8 Hooks expuestos para uso avanzado

- [ ] **Reexportar** desde el paquete (p. ej. en `src/index.ts` o `src/hooks.ts`) los hooks del headless: **useImporterStatus**, **useConvert**, **useSheetData**, **useSheetEditor** (editCell), **processFile**, **abort**, **downloadCSV**, **downloadJSON**, etc. La lib es hooks-first: el usuario puede montar solo los providers (o RawImporterRoot) y construir toda la UI con hooks. Documentar en **ai-context.md** la API de "uso nativo" / "hooks-first".

### 3.9 Public API (index.ts selectivo)

- [ ] **index.ts** debe exportar: (1) **hooks propios** (useRawImporterRoot, useStatusView) como API principal; (2) wrappers Raw opcionales (RawImporterRoot, RawStatusGuard) si se implementan; (3) **hooks reexportados del headless** para uso avanzado; (4) tipos públicos (SheetLayout, SheetError, ImporterStatus, vista, etc.). No exportar hooks internos de implementación.

### 3.10 Documentación

- [ ] Actualizar **`ai-context.md`**: fichas de **useRawImporterRoot** (opciones, providerProps, rootConfig, RootConfigProvider) y **useStatusView** (retorno, view, ejemplo de uso); sección **Hooks-first** con ejemplos de UI construida solo con hooks; mencionar wrappers Raw como opcionales.
- [ ] Actualizar **Architecture.md**: estado "Step 2"; lista de **hooks** (useRawImporterRoot, useStatusView) como artefactos principales; wrappers como contenedores opcionales.

---

## 4. Orden sugerido de ejecución

1. Confirmar imports desde headless: `ImporterProvider`, `useImporterStatus`, `useConvert`, tipos `ImporterStatus` y `ImporterProviderProps` (si exportados).
2. Crear en `src/shared/types/` el mapeo (status + convertResult) → vista y la función `getViewFromState`.
3. Implementar **useRawImporterRoot** en `src/hooks/useRawImporterRoot/` (providerProps + rootConfig; RootConfigContext + RootConfigProvider) y exportarlo.
4. Implementar **useStatusView** en `src/hooks/useStatusView/` (view + datos del headless; respetar stages si existe rootConfig) y exportarlo.
5. **Reexportar hooks** del headless desde `src/index.ts` (o `src/hooks.ts`) para uso avanzado.
6. Añadir tests para **useRawImporterRoot** y **useStatusView**.
7. Añadir stories en Storybook para los hooks (ejemplo con layout, ejemplo de useStatusView con controls).
8. Opcional: implementar wrappers **RawImporterRoot** y **RawStatusGuard** como contenedores mínimos que usan estos hooks.
9. Actualizar `ai-context.md` (hooks como API principal, sección Hooks-first) e `Architecture.md`.

---

## 5. Notas

- La lib es **hooks-first**: el valor está en los hooks (useRawImporterRoot, useStatusView); los wrappers Raw son contenedores opcionales que solo entregan esa lógica al árbol (p. ej. vía render props). El usuario puede montar `ImporterProvider` + `RootConfigProvider` a mano y usar solo useStatusView para decidir qué renderizar.
- **useRawImporterRoot** no renderiza; devuelve lo necesario para que el usuario (o RawImporterRoot) monte el árbol. **useStatusView** no renderiza; devuelve la vista y los datos para que el usuario pinte la UI que quiera.
- **useStatusView** no contiene lógica de negocio del importador; solo lectura de status/convertResult y derivación de vista. Las vistas concretas (Carga, Mapeo, etc.) se implementan en steps posteriores con **hooks** (useRawFilePicker, useRawMappingTable, etc.); el usuario las consume según `view`.
- Si se implementan wrappers Raw, mantener convención: `forwardRef`, `data-ris-ui="..."`, `className` y `style`.
- Si el headless cambia la API de provider o status, actualizar hooks y `src/shared` (getViewFromState).

Cuando termines este step, el siguiente implementará los **hooks de la fase de entrada** (useRawFilePicker con getRootProps/getInputProps, useRawMappingTable, useRawMappingRow, useRawMappingSuggest, useRawImportAction); el **Step 7** ensamblará todo en **RawImporterWorkflow**.

---

## 6. Resumen de congruencia con el headless

| Aspecto         | Headless                                                                                                                                                 | Step 2 (Hooks Raw)                                                                                                                                             |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | --------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Layout**      | `layout` (SheetLayout) define el esquema destino de columnas/campos                                                                                      | **useRawImporterRoot** recibe **layout** en options y lo incluye en **providerProps**; el usuario (o RawImporterRoot) pasa esas props a ImporterProvider       |
| **Provider**    | `ImporterProvider({ children, layout?, engine?, persist?, persistKey? })`; sin nodo DOM propio                                                           | useRawImporterRoot devuelve **providerProps**; opcionalmente RawImporterRoot renderiza el provider y un `div` con `data-ris-ui="raw-importer-root"`            |
| **Status**      | `useImporterStatus()` → `{ status, progressEventTarget }`; `ImporterStatus`: idle, loading, parsing, validating, transforming, success, error, cancelled | **useStatusView** usa `useImporterStatus()` y devuelve **view** + status/progressEventTarget/convertResult; mapeo en `getViewFromState(status, convertResult)` |
| **Vista Mapeo** | No es un status; `useConvert()` devuelve `convertResult` cuando hay desajustes de cabeceras; el usuario aplica mapping con `applyMapping()`              | useStatusView usa `useConvert()`; si `convertResult !== null` → **view = 'mapping'** con prioridad sobre status                                                |
| **Vistas UI**   | —                                                                                                                                                        | Tipo **vista** `'idle'                                                                                                                                         | 'mapping' | 'process' | 'result' | 'error'`; el usuario renderiza según **view**; opcionalmente RawStatusGuard expone slots (renderIdle, renderMapping, etc.) |
| **Tipos**       | `ImporterStatus`, `ImporterProviderProps` (y otros) en el headless                                                                                       | Reutilizar tipos exportados del headless; en `src/shared/types/` definir vista y `getViewFromState(status, convertResult)`                                     |
