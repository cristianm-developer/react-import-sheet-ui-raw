# Step 4 — Feedback Phase (hooks y herramientas)

Plan para implementar los **hooks** de la fase de feedback: progreso de alto rendimiento (sin re-renders por cada %), estado actual con objeto de diagnóstico en error, y acción de cancelación. Opcionalmente lógica de Error Boundary y acceso a telemetría. Los wrappers (RawProgressDisplay, RawStatusIndicator, RawAbortButton) son opcionales y solo consumen estos hooks.

---

## 1. Objetivo

Implementar los **hooks y herramientas** que cubren la **fase de feedback** del flujo:

| Hook / herramienta                          | Responsabilidad                                                                                                                                                              | Retorno / contrato                                                                                                                                                                                         |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **useRawProgress**                          | Suscripción al EventTarget **importer-progress**; actualización vía **ref** (sin re-renders).                                                                                | **progressRef** (RefObject con último ImporterProgressDetail); opcional **onProgress?(detail)**. El consumidor pinta la barra leyendo el ref (p. ej. requestAnimationFrame) o re-renderiza con onProgress. |
| **useRawStatus**                            | Estado actual (parsing, validating, success, error). En **error** expone **errorDetail** (objeto de diagnóstico alineado con headless: SheetError o tipo específico Worker). | `{ status, errorDetail? }` — errorDetail para mensajes contextuales ("Tu navegador se quedó sin memoria").                                                                                                 |
| **useRawAbort**                             | Acción **abort()** del Core (detener Workers).                                                                                                                               | `{ abort }`.                                                                                                                                                                                               |
| **RawErrorBoundary** (o lógica equivalente) | Captura errores fatales (Worker murió, React error). Fallback configurable; opcional onError.                                                                                | Componente Error Boundary; no sustituye useRawStatus (errorDetail).                                                                                                                                        |
| **Telemetría**                              | Headless expone **useImporter().metrics** (PipelineMetrics: timings, totalMs, rowCount).                                                                                     | Reexportar **useImporter()**; opcional wrapper **useImporterMetrics()** que devuelva `useImporter().metrics`. Documentar en ai-context.                                                                    |

Sin UI obligatoria: el consumidor usa los hooks para pintar barra de progreso, indicador de estado y botón de cancelar. Los wrappers RawProgressDisplay, RawStatusIndicator, RawAbortButton son opcionales y solo llaman al hook y exponen render prop.

---

## 2. Contrato con el Headless

Referencia: [ai-context del headless](https://github.com/cristianm-developer/react-import-sheet-headless/blob/main/ai-context.md).

- **Progreso**: **useImporterStatus()** devuelve **{ status, progressEventTarget }**. Eventos en `progressEventTarget`: **importer-progress** (detail: **ImporterProgressDetail**), **importer-aborted**. **ImporterProgressDetail**: phase?, globalPercent?, localPercent?, currentRow?, totalRows?, rowsProcessed?. Exporta IMPORTER_PROGRESS_EVENT, IMPORTER_ABORTED_EVENT, tipo ImporterProgressDetail.
- **Cancelación**: **useImporter()** (o equivalente) devuelve **abort()**. Al llamarla: worker.terminate(), status → 'cancelled', se dispara importer-aborted.

---

## 3. Checklist de tareas

### 3.1 Estructura de carpetas

- [ ] Bajo **`src/hooks/`** crear:
  - [ ] **`useRawProgress/`** — suscripción a EventTarget; progressRef (sin estado de percent); opcional onProgress.
  - [ ] **`useRawStatus/`** — status + errorDetail (objeto de diagnóstico en error, alineado con headless).
  - [ ] **`useRawAbort/`** — retorno { abort } desde useImporter (o headless).
- [ ] Opcional: **RawErrorBoundary** en `src/components/RawErrorBoundary/` (Error Boundary; fallback, onError). Lógica de telemetría: reexport useImporter y opcional useImporterMetrics en `src/shared/` o hooks.
- [ ] Cada hook en su carpeta: `useX.ts`, `index.ts`; opcionalmente tests y tipos.

### 3.2 useRawProgress (hook principal)

- [ ] **Firma**: `useRawProgress()` — debe usarse dentro de ImporterProvider.
- [ ] **Retorno**: **progressRef** (RefObject<ImporterProgressDetail | null>) que se actualiza en cada evento **importer-progress**; opcional **onProgress?(detail)** para que el consumidor haga setState si lo desea. **No guardar percent en estado**; solo ref para alto rendimiento.
- [ ] **Comportamiento**: usar useImporterStatus() para progressEventTarget; suscribirse a importer-progress e importer-aborted en useEffect; cleanup al desmontar. Exponer progressRef (y onProgress si se pasa).
- [ ] **Export**: desde `src/hooks/useRawProgress/index.ts` y reexport en `src/index.ts`.

### 3.3 useRawStatus (hook principal)

- [ ] **Firma**: `useRawStatus()` — dentro de ImporterProvider.
- [ ] **Retorno**: **status** (ImporterStatus) y **errorDetail?** (objeto de diagnóstico cuando status === 'error'). La forma de errorDetail debe alinearse con el headless (SheetError: code, params, level, message; o tipo específico para errores fatales/Worker).
- [ ] **Export**: desde `src/hooks/useRawStatus/index.ts` y reexport en `src/index.ts`.

### 3.4 useRawAbort (hook principal)

- [ ] **Retorno**: **abort** — función que llama a abort() del Core (useImporter o equivalente). Sin UI; el consumidor la asocia a un botón.
- [ ] **Export**: desde `src/hooks/useRawAbort/index.ts` y reexport en `src/index.ts`.

### 3.5 RawErrorBoundary (opcional)

- [ ] **Props**: children; **fallback** (ReactNode o (error, errorInfo) => ReactNode); opcional **onError?(error, errorInfo)**.
- [ ] **Comportamiento**: Error Boundary que envuelve el árbol; si Worker falla o error no capturado, mostrar fallback. No sustituye useRawStatus (errorDetail para errores de flujo).
- [ ] **Identificación**: `data-ris-ui="raw-error-boundary"`. Export desde RawErrorBoundary/index.ts y reexport en src/index.ts.

### 3.6 Telemetría

- [ ] Reexportar **useImporter()** del headless. Opcionalmente **useImporterMetrics()** que devuelva `useImporter().metrics`. Documentar en ai-context que el usuario obtiene telemetría (timings, totalMs, rowCount) para mostrarla en renderResult.

### 3.7 Wrappers opcionales

- [ ] **RawProgressDisplay**: llama a useRawProgress; children como función ({ progressRef, onProgress }); data-ris-ui="raw-progress-display".
- [ ] **RawStatusIndicator**: llama a useRawStatus; render prop con status y errorDetail; data-ris-ui="raw-status-indicator".
- [ ] **RawAbortButton**: llama a useRawAbort; children + disabled según status; data-ris-ui="raw-abort-button".

### 3.8 Tests

- [ ] useRawProgress: suscripción al EventTarget al montar; ref actualizado; desuscripción al desmontar; onProgress llamado si se pasa.
- [ ] useRawStatus: retorno correcto de status y errorDetail cuando status === 'error'.
- [ ] useRawAbort: abort llama a la función del Core (mock useImporter).
- [ ] RawErrorBoundary: al lanzar error en children, se muestra fallback y onError se llama.

### 3.9 Storybook

- [ ] useRawProgress: dentro de ImporterProvider o mock del EventTarget; simular eventos; slot que muestre phase y barra leyendo ref.
- [ ] useRawStatus: control de status; slot que muestre estado y errorDetail.
- [ ] useRawAbort: botón que llama abort; action al click.

### 3.10 Documentación

- [ ] Actualizar **ai-context.md**: useRawProgress (progressRef, onProgress), useRawStatus (**errorDetail** en error), useRawAbort (abort), RawErrorBoundary (fallback, onError), telemetría vía **useImporter().metrics** o useImporterMetrics().
- [ ] Actualizar **Architecture.md**: Step 4; lista de **hooks** de feedback como artefactos principales; wrappers opcionales.

---

## 4. Orden sugerido de ejecución

1. Confirmar imports desde headless: useImporterStatus, useImporter (abort), IMPORTER_PROGRESS_EVENT, IMPORTER_ABORTED_EVENT, ImporterProgressDetail.
2. Implementar useRawProgress (ref-based, sin estado de percent) y exportar.
3. Implementar useRawStatus (status + errorDetail) y useRawAbort (abort) y exportar.
4. Opcional: RawErrorBoundary; reexport useImporter y useImporterMetrics.
5. Tests, Storybook, ai-context.md y Architecture.md.
6. Opcional: wrappers RawProgressDisplay, RawStatusIndicator, RawAbortButton.

---

## 5. Notas

- **useRawProgress** no debe provocar re-renders con cada evento; el detail se expone vía **ref** (y opcionalmente onProgress). El consumidor puede actualizar su UI con requestAnimationFrame leyendo el ref.
- **useRawStatus** es puramente datos del status; la decisión de qué mostrar es del consumidor.
- **useRawAbort** es el punto que expone **abort()**; asegura que los Workers se detengan.
- Mantener convención Raw en wrappers: forwardRef, data-ris-ui, className y style.
