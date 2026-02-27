# Análisis de congruencia: Architecture vs Headless vs Construction Steps

Documento generado para verificar que **Architecture.md** está alineado con la documentación del headless y con los **Construction Steps**.

---

## 1. Resumen ejecutivo

| Área | Estado | Notas |
|------|--------|--------|
| **Pipeline y engine** | ✅ Congruente | Parser → Convert → Sanitizer → Validator → Transform coincide en Architecture y headless. |
| **Provider y layout** | ✅ Congruente | `layout`, `engine`, `persist`, `persistKey` bien reflejados. |
| **Hooks y API del Core** | ✅ Congruente | Hooks y métodos citados existen o tienen equivalente en el headless. |
| **Componentes Raw ↔ Steps** | ✅ Congruente | Lista de componentes en Architecture coincide con la de los 7 steps. |
| **Nomenclatura y detalles** | ⚠️ Ajustes menores | Algunas diferencias de nombre/valor (filterMode, persistencia, telemetría) detalladas abajo. |

---

## 2. Architecture vs documentación del headless

### 2.1 Pipeline y provider

- **Architecture:** *"Engine: @cristianm/react-import-sheet-headless — lógica (Parser → Convert → Sanitizer → Validator → Transform)."*
- **Headless (ai-context §4.2):** *"Pipeline (fixed order): Parser → Convert → Sanitizer → Validator → Transform."*

**Conclusión:** Orden idéntico. ✅

### 2.2 ImporterProvider y RawImporterRoot

- **Headless:** `ImporterProvider` con `children`, `layout?`, `engine?`, `persist?`, `persistKey?`; sin nodo DOM propio.
- **Architecture:** RawImporterRoot acepta `layout` y opcionalmente `engine`, `persist`, `persistKey`; pasa todo al ImporterProvider.

**Conclusión:** Congruente. ✅

### 2.3 Hooks y métodos

| Architecture menciona | Headless (ai-context) |
|-----------------------|------------------------|
| useImporterStatus | §1.3 useImporterStatus() → status, progressEventTarget |
| useConvert | §1.3 useConvert() → convert(), convertResult |
| useSheetData | §1.3 useSheetData() → sheet, errors |
| useSheetEditor (editCell) | §1.3 useSheetEditor() → editCell, pageData |
| processFile(file) | §1.2 processFile(file) desde useImporter() |
| abort | §1.3 useImporter() → abort() |
| downloadCSV / downloadJSON | §1.3 useSheetView() → downloadCSV, downloadJSON |
| filterMode / setPage | §1.3 useSheetView() → filterMode, pagination, getRows |

**Conclusión:** Todos tienen correspondencia directa en el headless. ✅

### 2.4 Telemetría (useImporterMetrics)

- **Architecture:** *"Reexportar useImporterMetrics() (o equivalente del headless)".*
- **Headless:** No hay hook `useImporterMetrics`. Sí hay **`useImporter().metrics`** (§4.3): `PipelineMetrics` (timings, totalMs, rowCount, etc.) tras un run completo.

**Recomendación:** Dejar claro en Architecture (y en Step 4 / ai-context) que la telemetría se obtiene vía **`useImporter().metrics`** y que la UI Raw puede reexportar un wrapper tipo `useImporterMetrics()` que lea ese valor, para mantener el nombre acordado en los steps.

### 2.5 Persistencia (recover / clear)

- **Headless §3.3:** `hasRecoverableSession`, `recoverSession()`, **`clearPersistedState()`**.
- **Architecture / Steps:** Hablan de "recoverSession" y "clearSession" o "clearSession()".

**Recomendación:** Confirmar en el headless el nombre exacto del método (clearPersistedState vs clearSession). Si el headless exporta `clearPersistedState`, en Architecture y steps se puede indicar: *"clearSession (mapeo de clearPersistedState del headless)"* para no romper la nomenclatura de la UI.

### 2.6 FilterMode (all / errors-only)

- **Headless §3.3:** `filterMode: 'all' | 'errors-only'` (con guión).
- **Architecture:** RawFilterToggle *"filterMode: 'all' y 'errors-only'"* — correcto.
- **Step 6:** En algún punto usa `'errorsOnly'` (camelCase) para setFilterMode.

**Recomendación:** Unificar con el headless: valor **`'errors-only'`** (con guión). Revisar Step 6 y código para usar siempre el mismo literal que exporte el headless.

### 2.7 Objeto de diagnóstico en error (RawStatusIndicator)

- **Architecture:** RawStatusIndicator en error debe exponer *"objeto de diagnóstico (errorDetail: { code, message?, reason? })"*.
- **Headless:** Define `SheetError` con `code`, `params?`, `level?`, `message?`; no menciona un objeto "errorDetail" ni "reason" explícito.

**Recomendación:** Considerar errorDetail como vista UI de lo que el headless expone en estado de error (p. ej. status + error con SheetError o equivalente). Si el headless añade un tipo explícito para errores fatales (p. ej. Worker), alinear nombre y forma en Architecture y steps.

---

## 3. Architecture vs Construction Steps

### 3.1 Tabla de steps en Architecture

La tabla "Construction Steps" en Architecture (Steps 1–7) coincide con los archivos y descripciones del README de Construction Steps:

| Step | Architecture | Construction Steps / README |
|------|--------------|-----------------------------|
| 1 | step-01-settings.md — Settings, stack, ESLint, Prettier, Vitest, Storybook, Husky, etc. | ✅ Mismo contenido |
| 2 | step-02 — RawImporterRoot (layout, fuzzyMatch, stages, editingEnabled), RawStatusGuard, hooks reexport, Public API | ✅ Mismo |
| 3 | step-03 — RawFilePicker, RawMappingTable, RawMappingRow, RawMappingSuggest, RawImportAction | ✅ Mismo |
| 4 | step-04 — RawProgressDisplay, RawStatusIndicator, RawAbortButton, RawErrorBoundary, useImporterMetrics | ✅ Mismo |
| 5 | step-05 — RawDataTable, RawTableHead/RawTableBody/RawTableRow/RawTableCell, RawErrorBadge, A11y, getRowProps, render prop | ✅ Mismo |
| 6 | step-06 — RawPagination, RawFilterToggle, RawExportButton, RawPersistenceBanner | ✅ Mismo |
| 7 | step-07 — RawImporterWorkflow (máquina de estados, composición por defecto) | ✅ Mismo |

**Conclusión:** La numeración, nombres de archivo y alcance descrito están alineados. ✅

### 3.2 Lista de componentes atómicos en Architecture

La tabla "Componentes Atómicos / Estructurales" en Architecture incluye exactamente los componentes que reparten los steps:

- **Entrada (Step 3):** RawFilePicker, RawMappingTable, RawMappingRow, RawMappingSuggest, RawImportAction ✅  
- **Feedback (Step 4):** RawProgressDisplay, RawStatusIndicator, RawAbortButton ✅  
- **Datos (Step 5):** RawDataTable, RawTableHead, RawTableBody, RawTableRow, RawTableCell, RawErrorBadge ✅  
- **Errores/Telemetría (Step 4):** RawErrorBoundary ✅  
- **Navegación/Salida (Step 6):** RawPagination, RawFilterToggle, RawExportButton, RawPersistenceBanner ✅  

**Orquestador (Step 7):** RawImporterWorkflow ✅  

**Conclusión:** No falta ningún componente de los steps en Architecture ni se mencionan componentes no previstos en los steps. ✅

### 3.3 Estados del Workflow

- **Architecture:** IDLE → RawFilePicker; MAPPING → RawMappingTable; PROCESSING → Progress + Abort; RESULT → Toolbar + Grid + Footer.
- **Step 7:** Misma definición (idle → FilePicker; mapping → MappingTable + ImportAction; process → ProgressDisplay + AbortButton; result → Toolbar + Grid + Footer).

**Conclusión:** Congruente. ✅

### 3.4 Parámetros de customización (Root / Workflow)

- **Architecture:** fuzzyMatch, editingEnabled, stages (mapping, process, result).
- **Step 2:** RawImporterRoot con fuzzyMatch?, editingEnabled?, stages? — mismo alcance.

**Conclusión:** Congruente. ✅

### 3.5 Estructura de archivos (src/)

- **Architecture:** `src/shared/` (types, hooks), `src/components/` (una carpeta por Raw), `index.ts` selectivo.
- **Steps:** Step 2 pide estructura bajo `src/components/` (RawImporterRoot, RawStatusGuard); steps 3–7 añaden el resto; Step 2 también habla de reexport en index y hooks en shared.

**Conclusión:** Coherente con la estructura descrita en Architecture. ✅

---

## 4. Recomendaciones de ajuste (aplicadas)

1. **Telemetría:** ✅ Aclarado en Architecture, ai-context y Step 4: contrato con el headless es **`useImporter().metrics`** (PipelineMetrics); la UI Raw puede reexportar un wrapper **useImporterMetrics()**.
2. **Persistencia:** ✅ Documentado en Architecture, ai-context y Step 6: "clearSession" en la UI es el nombre de la acción; en implementación debe llamar a **clearPersistedState()** del headless (o la lib exporta un alias clearSession).
3. **FilterMode:** ✅ Step 6 actualizado: valor **`'errors-only'`** (con guión) en FilterMode, setFilterMode y tabla de interacciones, alineado con el headless.
4. **ErrorDetail:** ✅ Architecture y Step 4 actualizados: errorDetail se alinea con lo que exporte el headless (SheetError o tipo específico para errores fatales/Worker).

---

## 5. Conclusión

- **Architecture.md** está en **congruencia** con la documentación del headless en pipeline, provider, hooks y flujo de datos.
- **Architecture.md** está en **congruencia** con los Construction Steps: mismos componentes, mismos steps, mismos estados del Workflow y misma estructura de proyecto.
- Los puntos anteriores son **ajustes de precisión** (nombres de API y valores literales) para evitar desvíos al implementar; no invalidan el diseño actual.

Cuando el headless cambie su API pública (hooks, nombres de métodos o tipos), conviene actualizar este análisis y las secciones correspondientes de Architecture y de los steps.
