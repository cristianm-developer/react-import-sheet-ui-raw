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
