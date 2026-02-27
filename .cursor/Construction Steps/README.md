# Construction Steps — react-import-sheet-ui-raw

Plan de construcción por pasos para la librería de UI Raw sobre `@cristianm/react-import-sheet-headless`. La lib es **hooks-first headless**: el producto principal son **hooks y prop-getters** (getRootProps, getInputProps, getCellProps, etc.); los wrappers (RawFilePicker, RawTableCell, etc.) son opcionales. El orquestador **RawImporterWorkflow** compone hooks (o wrappers) por vista.

| Step  | Archivo                                                                          | Descripción                                                                                                                                                                      |
| ----- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | [step-01-settings.md](./step-01-settings.md)                                     | Settings: stack, dependencias, ESLint, Prettier, Vitest, Storybook, Husky, lint-staged, Commitlint                                                                               |
| **2** | [step-02-root-and-status-view-hooks.md](./step-02-root-and-status-view-hooks.md) | Root & Status View: useRawImporterRoot, useStatusView; reexport headless; Public API; opcional RawImporterRoot, RawStatusGuard                                                   |
| **3** | [step-03-input-phase-hooks.md](./step-03-input-phase-hooks.md)                   | Input: useRawFilePicker (getRootProps, getInputProps), useRawMappingTable, useRawMappingRow, useRawMappingSuggest, useRawImportAction; wrappers opcionales                       |
| **4** | [step-04-feedback-phase-hooks.md](./step-04-feedback-phase-hooks.md)             | Feedback: useRawProgress, useRawStatus (errorDetail), useRawAbort; RawErrorBoundary; useImporter().metrics; wrappers opcionales                                                  |
| **5** | [step-05-data-phase-hooks.md](./step-05-data-phase-hooks.md)                     | Data: useRawDataTable, useRawTableHead, useRawTableBody (getRowProps), useRawTableRow, useRawCell (getCellProps, getEditInputProps), useRawErrorBadge; A11y; wrappers opcionales |
| **6** | [step-06-view-phase-hooks.md](./step-06-view-phase-hooks.md)                     | View: useRawPagination, useRawFilterToggle, useRawExport, useRawPersistence; wrappers opcionales                                                                                 |
| **7** | [step-07-orchestrator-workflow.md](./step-07-orchestrator-workflow.md)           | Orquestador: RawImporterWorkflow compone hooks (o wrappers) por vista (IDLE → FilePicker; MAPPING → Mapping; PROCESSING → Progress + Abort; RESULT → Toolbar + Grid + Footer)    |

Ejecutar los steps en orden. Cada `.md` incluye checklist y orden sugerido.
