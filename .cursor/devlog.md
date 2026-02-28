# Devlog — @cristianm/react-import-sheet-ui-raw

Log cronológico de trabajo. Actualizar después de cada cambio significativo.

---

## Formato sugerido

```markdown
### YYYY-MM-DD

- **Qué:** descripción breve.
- **Archivos:** lista de archivos tocados.
- **Notas:** bloqueos, próximos pasos, etc. (opcional).
```

---

## Entradas

### 2025-02-27

- **Qué:** Step 7 — RawImporterWorkflow: orquestador que compone hooks/wrappers por vista (idle, mapping, process, result, error); slots opcionales renderIdle, renderMapping, renderProcess, renderResult, renderError; composiciones por defecto con RawFilePicker, RawMappingTable, RawImportAction, RawProgressDisplay, RawStatusIndicator, RawAbortButton, y en RESULT Toolbar (useRawFilterToggle, useRawExport) + Grid (RawDataTableProvider, useRawTableHead/Body/Row/Cell, useRawErrorBadge) + Footer (useRawPagination, useRawPersistence).
- **Archivos:** `src/components/RawImporterWorkflow/` (RawImporterWorkflow.tsx, types.ts, index.ts, RawImporterWorkflow.test.tsx), `stories/RawImporterWorkflow.stories.tsx`, `src/index.ts`, `ai-context.md`, `.cursor/Architecture.md`, `.cursor/devlog.md`.
- **Notas:** Test "renders default result section" se salta en entornos sin Worker (Node). Tests de slots custom comprueban que el contenido del slot está presente.

- **Qué:** Sincronización de documentación: devlog e history actualizados al estado actual del proyecto; verificación de que **todos los Construction Steps (1–7)** están implementados.
- **Archivos:** `.cursor/devlog.md`, `.cursor/history.md`, `.cursor/Architecture.md`.
- **Notas:** Revisión contra `.cursor/Construction Steps/`: Step 1 (Settings: tsup, Vitest, Storybook, ESLint, Prettier, Husky, lint-staged, Commitlint, Commitizen) ✓; Steps 2–7 (hooks useRaw\*, wrappers, RawImporterWorkflow) ✓. Architecture.md: tabla de steps marcada "Completado" en 1–7; sección Estado actual ampliada con artefactos Step 1 y texto explícito "Todos los Steps 1–7 están implementados y completados". ADRs en history.md (hooks-first, namespacing useRaw/prop-getters, orquestador).

- **Qué:** Corrección del warning "CJS build of Vite's Node API is deprecated" y del ruido en stderr en tests de RawErrorBoundary.
- **Archivos:** `vitest.config.ts` → `vitest.config.mts` (config ESM para Vitest/Vite), `tsconfig.json` (include `vitest.config.mts`), `src/components/RawErrorBoundary/RawErrorBoundary.test.tsx` (mock de `console.error` en los 3 tests que renderizan Thrower para suprimir el log esperado de React).
- **Notas:** Vitest usa la API ESM de Vite al cargar `vitest.config.mts`; los tests que provocan error boundary dejan de imprimir "Error: Test error" y el stack en stderr.

- **Qué:** Story "FullImplementation": implementación total con todas las piezas (RawImporterRoot + RawImporterWorkflow + RawErrorBoundary), layout con varios campos (email, name, phone, date) para ver mapeo, grid, toolbar, paginación y persistencia en un solo flujo.
- **Archivos:** `stories/FullImplementation.stories.tsx`, `.cursor/devlog.md`.

- **Qué:** Arreglo "al seleccionar archivo no pasaba nada" en FullImplementation: mock del headless para Storybook (stories/mockHeadless.tsx) que al llamar processFile establece convertResult y al aplicar applyMapping pasa a success con sheet; alias en .storybook/main.ts (viteFinal) para resolver @cristianm/react-import-sheet-headless al mock en Storybook.
- **Archivos:** `stories/mockHeadless.tsx`, `.storybook/main.ts`, `stories/FullImplementation.stories.tsx`, `.cursor/devlog.md`.

### 2025-02-28

- **Qué:** Control de ventana de mapeo: cuándo mostrarla, auto-aplicar o mostrar error. Nuevas opciones en RawImporterRoot/useRawImporterRoot: **autoApplyMappingWhenMismatchesAtMost** (number | 'never') — si hay ≤N desajustes se auto-aplica el mapeo y no se muestra la pantalla de mapeo; **showErrorWhenMismatchesAbove** (number) — si hay más de N desajustes se muestra vista de error con mappingErrorDetail (TOO_MANY_MISMATCHES). useStatusView devuelve **mappingErrorDetail**; efecto que llama applyMapping() cuando corresponde. RawImporterWorkflow: DefaultError muestra mensaje cuando mappingErrorDetail.code === 'TOO_MANY_MISMATCHES'; renderError recibe `{ mappingErrorDetail }`.
- **Archivos:** `src/hooks/useRawImporterRoot/` (types, useRawImporterRoot, RootConfigContext), `src/hooks/useStatusView/` (types, useStatusView, useStatusView.test), `src/components/RawImporterWorkflow/` (RawImporterWorkflow.tsx, types, index), RawImporterWorkflow.test, useRawImporterRoot.test, `src/index.ts`, `.cursor/Architecture.md`, `ai-context.md`, `.cursor/devlog.md`.
