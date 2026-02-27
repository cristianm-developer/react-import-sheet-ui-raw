# Step 4 — Componentes de Feedback (Progress & Status)

Plan para implementar los **componentes atómicos** de la fase de feedback: visualización de progreso de alto rendimiento (sin re-renders por cada %), indicador de estado y botón de cancelación. Basado en la propuesta Gemini: RawProgressDisplay, RawStatusIndicator, RawAbortButton.

---

## 1. Objetivo

Implementar tres componentes Raw que cubren la **fase de feedback** del flujo:

| Componente | Responsabilidad |
|------------|-----------------|
| **RawProgressDisplay** | Componente de **alto rendimiento**. Se suscribe al EventTarget (**importer-progress**) y actualiza un elemento vía **ref** (sin re-renders de React). El consumidor puede pintar la barra leyendo el ref (p. ej. requestAnimationFrame) o usar un callback opcional. |
| **RawStatusIndicator** | Muestra el estado actual: **parsing**, **validating**, **success**, **error**. En estado **error** expone un **objeto de diagnóstico** (**errorDetail**) para que la UI muestre mensajes útiles ("Tu navegador se quedó sin memoria"). La forma de **errorDetail** debe alinearse con lo que exporte el headless: **SheetError** (code, params, level, message) o un tipo específico para errores fatales/Worker si existe. |
| **RawAbortButton** | Botón vinculado a **abort()** del core para detener los Workers. |
| **RawErrorBoundary** | Envuelve el flujo e intercepta **errores fatales** (Worker murió, React error). Muestra un slot o fallback configurable; opcionalmente expone el error para logging. |
| **Telemetría** | El headless expone **useImporter().metrics** (PipelineMetrics: timings, totalMs, rowCount, etc.), no un hook `useImporterMetrics`. Reexportar **useImporter()** y opcionalmente un wrapper **useImporterMetrics()** que devuelva `useImporter().metrics` para que el usuario muestre el resumen en renderResult. |

Estos componentes no definen estilos; solo estructura, semántica y conexión con el Core. Se usan típicamente dentro del slot **renderProcess** de RawStatusGuard (o en RawImporterWorkflow).

---

## 2. Contrato con el Headless

Referencia: [ai-context del headless](https://github.com/cristianm-developer/react-import-sheet-headless/blob/main/ai-context.md).

- **Progreso**
  - **useImporterStatus()** devuelve **{ status, progressEventTarget }**.
  - Eventos en `progressEventTarget`: **importer-progress** (detail: **ImporterProgressDetail**), **importer-aborted**.
  - **ImporterProgressDetail**: `phase?`, `globalPercent?`, `localPercent?`, `currentRow?`, `totalRows?`, `rowsProcessed?`.
  - El headless exporta **IMPORTER_PROGRESS_EVENT**, **IMPORTER_ABORTED_EVENT**, tipo **ImporterProgressDetail**.
- **Cancelación**
  - **useImporter()** (o equivalente) devuelve **abort()**. Al llamarla: worker.terminate(), status → 'cancelled', se dispara **importer-aborted** en el EventTarget.

---

## 3. Checklist de tareas

### 3.1 Estructura de carpetas

- [ ] Bajo `src/components/` crear:
  - [ ] **`RawProgressDisplay/`** — suscripción a EventTarget + actualización vía ref (sin re-renders).
  - [ ] **`RawStatusIndicator/`** — muestra status; en **error** expone **errorDetail** (objeto de diagnóstico del Core).
  - [ ] **`RawAbortButton/`** — botón que llama a abort().
  - [ ] **`RawErrorBoundary/`** — Error Boundary que captura errores fatales (Worker, React); slot/fallback para UI.
- [ ] Cada componente en su carpeta con: `RawX.tsx`, `index.ts`; opcionalmente `RawX.test.tsx`, `types.ts`.

### 3.2 RawProgressDisplay

- [ ] **Props**:
  - `className?`, `style?` (convención Raw).
  - **children**: render prop **({ progressRef: RefObject<ImporterProgressDetail | null> })** para que el consumidor pinte la barra leyendo `progressRef.current` (p. ej. en requestAnimationFrame). Opcionalmente **onProgress?(detail)** para que el consumidor haga setState y re-renderice si lo desea (el componente no guarda percent en estado para evitar re-renders).
- [ ] **Comportamiento**:
  - Usar **useImporterStatus()** para **progressEventTarget**.
  - Suscribirse a **importer-progress** y **importer-aborted** en useEffect; cleanup al desmontar.
  - **No guardar percent en estado**. Mantener un **ref** que se actualice con el último ImporterProgressDetail en cada evento; exponer ese ref al consumidor (progressRef). Opcionalmente invocar **onProgress(detail)** en cada evento.
  - Objetivo: alto rendimiento; el consumidor decide si re-renderizar (onProgress) o solo leer el ref.
- [ ] **Identificación**: `data-ris-ui="raw-progress-display"`. Ref al contenedor raíz.
- [ ] **Export**: desde `RawProgressDisplay/index.ts` y reexport en `src/index.ts`.

### 3.3 RawStatusIndicator

- [ ] **Props**:
  - `className?`, `style?`.
  - **children**: render prop **({ status: ImporterStatus, errorDetail?: ErrorDetail })** o slot. Cuando **status === 'error'**, pasar **errorDetail** alineado con lo que exporte el headless (p. ej. **SheetError**: code, params, level, message; o tipo específico para errores fatales/Worker si el headless lo define) para que la UI muestre mensajes contextuales (ej. "Tu navegador se quedó sin memoria").
  - Opcionalmente labels por status: **labelParsing?**, **labelValidating?**, **labelSuccess?**, **labelError?** para un fallback por defecto.
- [ ] **Comportamiento**: usar **useImporterStatus()** para **status** y, si el headless lo expone, el **objeto de diagnóstico** en error. Renderizar slot/children con status y errorDetail; sin UI propia obligatoria.
- [ ] **Identificación**: `data-ris-ui="raw-status-indicator"`. Ref al contenedor raíz.
- [ ] **Export**: desde `RawStatusIndicator/index.ts` y reexport en `src/index.ts`.

### 3.4 RawAbortButton

- [ ] **Props**: `className?`, `style?`; **children** (contenido del botón, p. ej. "Cancelar"); **disabled?** (p. ej. cuando status no es validating/transforming).
- [ ] **Comportamiento**: al click, llamar a **abort()** de **useImporter()** (o del hook que lo exponga). No contener lógica de negocio; solo disparar abort().
- [ ] **Semántica**: `<button type="button">`. Accesibilidad: aria-label si no hay texto visible.
- [ ] **Identificación**: `data-ris-ui="raw-abort-button"`. Ref al `<button>`.
- [ ] **Export**: desde `RawAbortButton/index.ts` y reexport en `src/index.ts`.

### 3.5 RawErrorBoundary

- [ ] **Props**: `className?`, `style?`; **children**; **fallback** (ReactNode o (error, errorInfo) => ReactNode); opcional **onError?(error, errorInfo)**.
- [ ] **Comportamiento**: Error Boundary que envuelve el árbol; si Worker falla o error no capturado, mostrar fallback. No sustituye RawStatusIndicator (errorDetail).
- [ ] **Identificación**: `data-ris-ui="raw-error-boundary"`. Ref al contenedor.
- [ ] **Export**: desde RawErrorBoundary/index.ts y reexport en src/index.ts.

### 3.6 Telemetría (useImporterMetrics)

- [ ] El headless expone **useImporter().metrics** (PipelineMetrics), no un hook `useImporterMetrics`. Reexportar **useImporter()** y opcionalmente un wrapper **useImporterMetrics()** que devuelva `useImporter().metrics`. Documentar en ai-context que el usuario obtiene telemetría (timings, totalMs, rowCount, etc.) para mostrarla en renderResult.

### 3.7 Tests

- [ ] RawProgressDisplay: suscripción al EventTarget al montar; ref actualizado; desuscripción al desmontar; onProgress llamado si se pasa.
- [ ] RawStatusIndicator: render del slot con status y errorDetail cuando status === 'error'.
- [ ] RawAbortButton: click llama abort() del hook (mock useImporter).
- [ ] RawErrorBoundary: al lanzar error en children, se muestra fallback y onError se llama.

### 3.8 Storybook

- [ ] RawProgressDisplay: dentro de ImporterProvider o mock del EventTarget; simular eventos de progreso; slot que muestre phase y barra (leyendo ref).
- [ ] RawStatusIndicator: control de status; slot que muestre el estado.
- [ ] RawAbortButton: botón "Cancelar"; action al click.

### 3.9 Documentación

- [ ] Actualizar **ai-context.md**: RawProgressDisplay, RawStatusIndicator (**errorDetail** en error), RawAbortButton, **RawErrorBoundary** (fallback, onError), telemetría vía **useImporter().metrics** o wrapper **useImporterMetrics()**.
- [ ] Actualizar **Architecture.md**: Step 4 y lista de componentes Raw (RawProgressDisplay, RawStatusIndicator, RawAbortButton, RawErrorBoundary, telemetría).

---

## 4. Orden sugerido de ejecución

1. Confirmar imports desde headless: useImporterStatus, useImporter (abort), IMPORTER_PROGRESS_EVENT, IMPORTER_ABORTED_EVENT, ImporterProgressDetail.
2. Implementar RawProgressDisplay (ref-based, sin estado de percent) y exportar.
3. Implementar RawStatusIndicator (status + slot) y exportar.
4. Implementar RawAbortButton (botón + abort()) y exportar.
5. Tests, Storybook, ai-context.md y Architecture.md.

---

## 5. Notas

- **RawProgressDisplay** no debe re-renderizarse con cada evento; por eso el detail se expone vía **ref** (y opcionalmente **onProgress**). El consumidor puede elegir actualizar su UI con requestAnimationFrame leyendo el ref.
- **RawStatusIndicator** es puramente presentacional del status; no toma decisiones de flujo.
- **RawAbortButton** es el punto de la UI Raw que llama a **abort()**; asegura que los Workers se detengan y el status pase a 'cancelled'.
- Mantener convención Raw: forwardRef, data-ris-ui, className y style en todos los componentes.
