# Construction Steps — react-import-sheet-ui-raw

Plan de construcción por pasos para la librería de UI Raw sobre `@cristianm/react-import-sheet-headless`. Componentes **atómicos/estructurales** (sin CSS) + **orquestador** "llave en mano". Todos siguen la estrategia **prop-getters** para estilizado externo.

| Step | Archivo | Descripción |
|------|---------|-------------|
| **1** | [step-01-settings.md](./step-01-settings.md) | Settings: stack, dependencias, ESLint, Prettier, Vitest, Storybook, Husky, lint-staged, Commitlint |
| **2** | [step-02-root-and-status-guard.md](./step-02-root-and-status-guard.md) | RawImporterRoot (layout, fuzzyMatch, editingEnabled, stages), RawStatusGuard, hooks reexport, Public API (index selectivo) |
| **3** | [step-03-input-phase-components.md](./step-03-input-phase-components.md) | Entrada: RawFilePicker, RawMappingTable, RawMappingRow, **RawMappingSuggest** (fuzzy + param off), RawImportAction |
| **4** | [step-04-feedback-phase-components.md](./step-04-feedback-phase-components.md) | Feedback: RawProgressDisplay, RawStatusIndicator (errorDetail), RawAbortButton, **RawErrorBoundary**, **useImporterMetrics** |
| **5** | [step-05-core-visual-data-table.md](./step-05-core-visual-data-table.md) | Datos: RawDataTable (A11y Roaming Tabindex, editingEnabled), RawTableBody (getRowProps + isPlaceholder), RawTableRow (onKeyDown), RawTableCell (render prop children(state)), RawErrorBadge |
| **6** | [step-06-view-phase-components.md](./step-06-view-phase-components.md) | Salida: RawPagination (setPage), RawFilterToggle (all / errors-only), RawExportButton (downloadCSV, downloadJSON), RawPersistenceBanner |
| **7** | [step-07-orchestrator-workflow.md](./step-07-orchestrator-workflow.md) | Orquestador: RawImporterWorkflow (IDLE → FilePicker; MAPPING → MappingTable; PROCESSING → Progress + Abort; RESULT → Toolbar + Grid + Footer) |

Ejecutar los steps en orden. Cada `.md` incluye checklist y orden sugerido.
