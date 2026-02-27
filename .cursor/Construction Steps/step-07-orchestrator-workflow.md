# Step 7 — Workflow Orchestrator (RawImporterWorkflow)

Plan para implementar el orquestador "llave en mano" que gestiona la máquina de estados de la UI y **compone hooks** (o sus wrappers opcionales) en cada vista. **RawImporterWorkflow** no añade lógica de negocio; solo decide qué vista mostrar según **view** (useStatusView) y ensambla los hooks/wrappers en cada caso.

---

## 1. Objetivo

Implementar **RawImporterWorkflow**: el orquestador para el usuario que quiere experiencia completa sin montar cada hook a mano. Utiliza **useStatusView** (o RawStatusGuard) para obtener la vista actual y en cada slot compone los **hooks** de los steps 3–6 (o sus wrappers opcionales).

**Estados y qué compone:**

| Estado         | Hooks (o wrappers) mostrados                                                                                                                                                                                                                                                             |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **IDLE**       | useRawFilePicker (o RawFilePicker).                                                                                                                                                                                                                                                      |
| **MAPPING**    | useRawMappingTable, useRawMappingRow, useRawMappingSuggest, useRawImportAction (o RawMappingTable, RawImportAction, etc.).                                                                                                                                                               |
| **PROCESSING** | useRawProgress, useRawStatus, useRawAbort (o RawProgressDisplay, RawStatusIndicator, RawAbortButton).                                                                                                                                                                                    |
| **RESULT**     | Toolbar: useRawFilterToggle, useRawExport (o RawFilterToggle, RawExportButton). Grid: useRawDataTable, useRawTableHead, useRawTableBody, useRawTableRow, useRawCell, useRawErrorBadge (o wrappers). Footer: useRawPagination, useRawPersistence (o RawPagination, RawPersistenceBanner). |

---

## 2. Dependencias

RawImporterWorkflow debe usarse **dentro de RawImporterRoot**. El usuario pasa el **layout objetivo** (y engine, etc.) al **RawImporterRoot**; el Workflow lee el contexto y no recibe layout como prop directa. Utiliza internamente **useStatusView** (o RawStatusGuard) para decidir la vista y en cada slot compone los **hooks** de los steps 3–6 — ya sea llamándolos directamente y aplicando prop-getters al markup, o usando los wrappers Raw (RawFilePicker, RawDataTable, etc.). El usuario que prefiera **no** usar el Workflow puede usar solo RawImporterRoot + hooks y montar su propia UI.

- **Step 2**: useRawImporterRoot, useStatusView (vistas: idle, mapping, process, result, error); opcional RawImporterRoot, RawStatusGuard.
- **Step 3**: useRawFilePicker, useRawMappingTable, useRawMappingRow, useRawMappingSuggest, useRawImportAction (y wrappers opcionales).
- **Step 4**: useRawProgress, useRawStatus, useRawAbort (y wrappers opcionales).
- **Step 5**: useRawDataTable, useRawTableHead, useRawTableBody, useRawTableRow, useRawCell, useRawErrorBadge (y wrappers opcionales).
- **Step 6**: useRawPagination, useRawFilterToggle, useRawExport, useRawPersistence (y wrappers opcionales).

---

## 3. Checklist de tareas

### 3.1 Estructura de carpetas

- [ ] Bajo `src/components/` crear:
  - [ ] **`RawImporterWorkflow/`** — orquestador que compone todos los Raw según estado.
- [ ] Contenido: `RawImporterWorkflow.tsx`, `index.ts`; opcionalmente `RawImporterWorkflow.test.tsx`, `types.ts`.

### 3.2 RawImporterWorkflow

- [ ] **Props**:
  - `className?`, `style?` (convención Raw).
  - Opcionales por sección para customizar (slots o reemplazo):
    - **renderIdle?** (por defecto: uso de useRawFilePicker o RawFilePicker).
    - **renderMapping?** (por defecto: hooks/wrappers de mapeo + useRawImportAction).
    - **renderProcess?** (por defecto: useRawProgress, useRawStatus, useRawAbort o sus wrappers).
    - **renderResult?** (por defecto: Toolbar con hooks de filtro/export + Grid con hooks de tabla + Footer con paginación/persistencia).
  - Si no se pasan slots, usar composiciones por defecto con los **hooks** (o wrappers) ya implementados.
- [ ] **Lógica**:
  - Usar **useStatusView()** (o RawStatusGuard por dentro) para obtener la vista actual: **idle** | **mapping** | **process** | **result** | **error**.
  - Según vista, componer los hooks correspondientes (o sus wrappers):
    - **idle** → renderIdle o useRawFilePicker / RawFilePicker.
    - **mapping** → renderMapping o useRawMappingTable, useRawMappingRow, useRawMappingSuggest, useRawImportAction (o wrappers).
    - **process** → renderProcess o useRawProgress, useRawStatus, useRawAbort (o RawProgressDisplay, RawStatusIndicator, RawAbortButton).
    - **result** → renderResult o Toolbar (useRawFilterToggle, useRawExport) + Grid (useRawDataTable, useRawTableHead, useRawTableBody, useRawTableRow, useRawCell, useRawErrorBadge) + Footer (useRawPagination, useRawPersistence), o sus wrappers.
    - **error** → opcionalmente mismo que idle (reintentar) o slot renderError si se añade.
- [ ] **Sin CSS**: solo estructura y composición. El consumidor puede envolver en un div con className/style para layout/estilos.
- [ ] **Identificación**: `data-ris-ui="raw-importer-workflow"`. Ref al contenedor raíz.
- [ ] **Export**: desde RawImporterWorkflow/index.ts y reexport en src/index.ts.

### 3.3 Composición por defecto (RESULT)

- [ ] **Toolbar**: contenedor con useRawFilterToggle y useRawExport (o RawFilterToggle, RawExportButton).
- [ ] **Grid**: uso de useRawDataTable, useRawTableHead, useRawTableBody, useRawTableRow, useRawCell, useRawErrorBadge (layout desde contexto; getRowProps/getCellProps aplicados al markup), o wrappers RawDataTable, RawTableHead, etc.
- [ ] **Footer**: contenedor con useRawPagination y useRawPersistence (o RawPagination, RawPersistenceBanner).

### 3.4 Tests

- [ ] Con mock de getViewFromState (o RawStatusGuard): para cada vista (idle, mapping, process, result) verificar que se renderiza la sección correcta (presencia de los componentes Raw esperados o del slot custom).
- [ ] Con provider real (o mock completo): flujo mínimo idle → mapping → process → result y que en cada paso el contenido cambie.

### 3.5 Storybook

- [ ] Story dentro de RawImporterRoot + ImporterProvider con layout de ejemplo: controles para simular status/convertResult y ver el cambio entre IDLE, MAPPING, PROCESSING, RESULT.
- [ ] Story con slots custom (renderIdle, renderMapping, etc.) para mostrar que se pueden reemplazar las composiciones por defecto.

### 3.6 Documentación

- [ ] Actualizar **ai-context.md**: RawImporterWorkflow (props, slots, tabla de estados → contenido, ejemplo mínimo "llave en mano" y ejemplo con slots).
- [ ] Actualizar **Architecture.md**: Step 7 completado; orquestador RawImporterWorkflow en la tabla de componentes.

---

## 4. Orden sugerido de ejecución

1. Asegurar que todos los componentes Raw de Steps 2–6 están implementados y exportados.
2. Implementar RawImporterWorkflow (getViewFromState + ramas por vista + composiciones por defecto).
3. Definir estructura clara de Toolbar / Grid / Footer en RESULT (sin estilos; solo DOM y componentes Raw).
4. Tests y Storybook.
5. ai-context.md y Architecture.md.

---

## 5. Notas

- RawImporterWorkflow **no** duplica la lógica del Core; solo lee la vista (vía useStatusView o RawStatusGuard) y compone **hooks** (o wrappers) en cada pantalla. Toda la lógica de importación sigue en el headless.
- El consumidor puede: (1) **RawImporterRoot + RawImporterWorkflow** para la experiencia "todo construido" (layout pasado al Root); (2) **RawImporterRoot + useStatusView + hooks** para control total (montar useRawFilePicker, useRawCell, etc. según view); (3) **RawImporterRoot + hooks reexportados** sin Workflow, importando el archivo por su cuenta (processFile) y/o construyendo su propia tabla con getRowProps/getCellProps.
- **Layout**: se pasa siempre a **RawImporterRoot**; el Workflow obtiene el layout del contexto.
- Mantener convención Raw: forwardRef, data-ris-ui, className y style en el contenedor raíz del workflow.
