# Step 6 — View Phase (hooks de navegación y salida)

Plan para implementar los **hooks** de la fase de vista final (RESULT): paginación, filtro (todos / solo errores), exportación y persistencia. Cada hook devuelve estado y acciones; los wrappers (RawPagination, RawFilterToggle, RawExportButton, RawPersistenceBanner) son opcionales y solo consumen estos hooks.

---

## 1. Objetivo

Implementar los **hooks** que cubren la **fase de navegación y salida** cuando el status es **success** (vista RESULT):

| Hook                   | Responsabilidad                                                                                      | Retorno                                                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **useRawPagination**   | page, pageSize, totalRows; setPage, setPageSize (desde Core).                                        | `{ page, pageSize, totalRows?, setPage, setPageSize }`. El consumidor pinta botones Anterior/Siguiente y selector de tamaño.   |
| **useRawFilterToggle** | filterMode: 'all' \| 'errors-only'; setFilterMode.                                                   | `{ filterMode, setFilterMode }`.                                                                                               |
| **useRawExport**       | Acciones downloadCSV y downloadJSON del Core.                                                        | `{ downloadCSV, downloadJSON }`. El consumidor asocia a botones.                                                               |
| **useRawPersistence**  | hasRecoverableSession; recoverSession(); clearSession() (alias de clearPersistedState del headless). | `{ hasRecoverableSession, recoverSession, clearSession }`. Si hasRecoverableSession es false, el consumidor no muestra banner. |

Sin UI obligatoria: el consumidor usa los hooks para pintar controles de paginación, toggle de filtro, botones de exportar y banner de recuperar/limpiar sesión. Los wrappers RawPagination, RawFilterToggle, RawExportButton, RawPersistenceBanner son opcionales (solo llaman al hook y exponen render prop o slots).

---

## 2. Contrato con el Headless

Referencia: [ai-context del headless](https://github.com/cristianm-developer/react-import-sheet-headless/blob/main/ai-context.md).

- **Filtrado**: hook/contexto que exponga **filterMode** (`'all' | 'errors-only'`) y **setFilterMode**.
- **Paginación**: **page**, **pageSize**, **setPage**, **setPageSize** (usePagination() o contexto). Filas visibles según Core.
- **Exportación**: **downloadCSV()** y **downloadJSON()** (useSheetView / useExport o equivalente); parámetros según headless.
- **Persistencia**: **hasRecoverableSession**; **recoverSession()** y **clearPersistedState()** (la UI Raw puede exponer **clearSession** como alias de clearPersistedState).

Definir en **src/shared/types/** los tipos (p. ej. FilterMode) que reflejen ese contrato.

---

## 3. Checklist de tareas

### 3.1 Estructura de carpetas

- [ ] Bajo **`src/hooks/`** crear:
  - [ ] **`useRawPagination/`** — page, pageSize, totalRows, setPage, setPageSize.
  - [ ] **`useRawFilterToggle/`** — filterMode, setFilterMode.
  - [ ] **`useRawExport/`** — downloadCSV, downloadJSON.
  - [ ] **`useRawPersistence/`** — hasRecoverableSession, recoverSession, clearSession.
- [ ] Cada hook en su carpeta: `useX.ts`, `index.ts`; opcionalmente tests y tipos.
- [ ] Opcional: bajo **`src/components/`** wrappers (RawPagination, RawFilterToggle, RawExportButton, RawPersistenceBanner) que solo llaman al hook y exponen render prop o slots.

### 3.2 useRawPagination

- [ ] **Retorno**: **page**, **pageSize**, **totalRows?** (si el Core lo expone), **setPage**, **setPageSize**. Sin UI; el consumidor pinta botones y selectores. Opcional **pageSizeOptions** como param del hook.
- [ ] **Export**: desde `src/hooks/useRawPagination/index.ts` y reexport en `src/index.ts`.

### 3.3 useRawFilterToggle

- [ ] **Retorno**: **filterMode** (`'all' | 'errors-only'`), **setFilterMode**. Valores literales alineados con el headless.
- [ ] **Export**: desde `src/hooks/useRawFilterToggle/index.ts` y reexport en `src/index.ts`.

### 3.4 useRawExport

- [ ] **Retorno**: **downloadCSV**, **downloadJSON** (funciones del Core). El consumidor puede pintar uno o dos botones.
- [ ] **Export**: desde `src/hooks/useRawExport/index.ts` y reexport en `src/index.ts`.

### 3.5 useRawPersistence

- [ ] **Retorno**: **hasRecoverableSession** (boolean), **recoverSession** (función), **clearSession** (función; alias de clearPersistedState del headless). Si hasRecoverableSession es false, el consumidor no muestra banner.
- [ ] **Export**: desde `src/hooks/useRawPersistence/index.ts` y reexport en `src/index.ts`.

### 3.6 Wrappers opcionales

- [ ] **RawPagination**: llama a useRawPagination; children opcional como render prop ({ page, pageSize, totalRows, setPage, setPageSize }); data-ris-ui="raw-pagination"; aria-labels en botones.
- [ ] **RawFilterToggle**: llama a useRawFilterToggle; children o slots labelAll/labelErrorsOnly; data-ris-ui="raw-filter-toggle"; role="group", aria-pressed.
- [ ] **RawExportButton**: llama a useRawExport; children como render prop ({ downloadCSV, downloadJSON }) o slots; data-ris-ui="raw-export-button".
- [ ] **RawPersistenceBanner**: llama a useRawPersistence; si !hasRecoverableSession retorna null; si true, render prop ({ onRecover, onClear }) o message/labelRecover/labelClear; data-ris-ui="raw-persistence-banner"; role="status", aria-live="polite".

### 3.7 Tipos compartidos

- [ ] En **src/shared/types/** definir **FilterMode** (`'all' | 'errors-only'`, alineado con headless) y tipos que la UI Raw necesite.

### 3.8 Tests

- [ ] useRawFilterToggle: setFilterMode invocado correctamente (mock).
- [ ] useRawPagination: setPage y setPageSize invocados al interactuar (mock).
- [ ] useRawExport: downloadCSV y downloadJSON llaman al Core (mock).
- [ ] useRawPersistence: hasRecoverableSession false/true; recoverSession y clearSession invocan al Core (mock).

### 3.9 Storybook

- [ ] useRawFilterToggle: story con status success; control filterMode; acciones al cambiar.
- [ ] useRawPagination: datos de ejemplo; controles page/pageSize; acciones.
- [ ] useRawExport: acciones downloadCSV/downloadJSON; acciones al click.
- [ ] useRawPersistence: mock hasRecoverableSession true/false; acciones Recuperar y Limpiar.

### 3.10 Documentación

- [ ] Actualizar **ai-context.md**: useRawPagination, useRawFilterToggle, useRawExport (downloadCSV, downloadJSON), useRawPersistence (hasRecoverableSession, recoverSession, clearSession). Wrappers opcionales.
- [ ] Actualizar **Architecture.md**: Step 6; lista de **hooks** de View Phase como artefactos principales.

---

## 4. Orden sugerido de ejecución

1. Verificar en el headless: filterMode, setFilterMode, page/pageSize/setPage/setPageSize, downloadCSV/downloadJSON, hasRecoverableSession/recoverSession/clearPersistedState.
2. Definir tipos en src/shared/types/ (FilterMode, etc.).
3. Implementar useRawPagination, useRawFilterToggle, useRawExport, useRawPersistence y exportar.
4. Tests, Storybook, ai-context.md y Architecture.md.
5. Opcional: wrappers RawPagination, RawFilterToggle, RawExportButton, RawPersistenceBanner.

---

## 5. Resumen de interacciones (hooks)

| Hook                   | Uso típico del consumidor                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| **useRawFilterToggle** | "Ver todos" → setFilterMode('all'). "Solo errores" → setFilterMode('errors-only').                          |
| **useRawPagination**   | Anterior/Siguiente → setPage(n). Selector tamaño → setPageSize(n).                                          |
| **useRawExport**       | "Descargar CSV" → downloadCSV(). "Descargar JSON" → downloadJSON().                                         |
| **useRawPersistence**  | "Recuperar" → recoverSession(). "Limpiar" → clearSession(). Visible solo si hasRecoverableSession === true. |

---

## 6. Notas

- RawPersistenceBanner (o el consumidor que use useRawPersistence) puede mostrarse en IDLE si hay sesión recuperable, según diseño del headless.
- Convención Raw en wrappers: forwardRef, data-ris-ui, className y style.
