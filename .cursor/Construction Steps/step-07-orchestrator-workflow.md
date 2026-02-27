# Step 7 — Orquestador: RawImporterWorkflow

Plan para implementar el **componente de alto nivel** "llave en mano" que gestiona la máquina de estados de la UI y compone todos los componentes Raw. Basado en la propuesta Gemini: **RawImporterWorkflow**.

---

## 1. Objetivo

Implementar **RawImporterWorkflow**: el orquestador que el usuario "rápido" puede usar arrastrando y soltando. No añade lógica de negocio; solo decide qué vista mostrar según el estado (IDLE / MAPPING / PROCESSING / RESULT) y ensambla los componentes Raw en cada caso.

**Estados y qué muestra:**

| Estado | Contenido mostrado |
|--------|--------------------|
| **IDLE** | RawFilePicker. |
| **MAPPING** | RawMappingTable (usuario asocia columnas CSV con SheetLayout). |
| **PROCESSING** | RawProgressDisplay + RawAbortButton (opcionalmente RawStatusIndicator). |
| **RESULT** | Toolbar (RawFilterToggle + RawExportButton) + Grid (RawDataTable con RawTableHead, RawTableBody, edición habilitada) + Footer (RawPagination + RawPersistenceBanner). |

---

## 2. Dependencias

RawImporterWorkflow debe usarse **dentro de RawImporterRoot**. El usuario pasa el **layout objetivo** (y engine, etc.) al **RawImporterRoot**; el Workflow lee el contexto y no recibe layout como prop directa. Utiliza internamente **RawStatusGuard** (o getViewFromState) para decidir la vista y en cada slot renderiza la composición de componentes Raw (Step 2–6). El usuario que prefiera **no** usar el Workflow puede usar solo RawImporterRoot + hooks reexportados y montar su propia UI (p. ej. su propio file input y su propia tabla).

- **Step 2**: RawImporterRoot, RawStatusGuard, getViewFromState (vistas: idle, mapping, process, result, error).
- **Step 3**: RawFilePicker, RawMappingTable, RawMappingRow, RawImportAction.
- **Step 4**: RawProgressDisplay, RawStatusIndicator, RawAbortButton.
- **Step 5**: RawDataTable, RawTableHead, RawTableBody, RawTableRow, RawTableCell, RawErrorBadge.
- **Step 6**: RawPagination, RawFilterToggle, RawExportButton, RawPersistenceBanner.

---

## 3. Checklist de tareas

### 3.1 Estructura de carpetas

- [ ] Bajo `src/components/` crear:
  - [ ] **`RawImporterWorkflow/`** — orquestador que compone todos los Raw según estado.
- [ ] Contenido: `RawImporterWorkflow.tsx`, `index.ts`; opcionalmente `RawImporterWorkflow.test.tsx`, `types.ts`.

### 3.2 RawImporterWorkflow

- [ ] **Props**:
  - `className?`, `style?` (convención Raw).
  - Opcionales por sección para customizar (slots o reemplazo de componentes):
    - **renderIdle?** (por defecto: RawFilePicker).
    - **renderMapping?** (por defecto: RawMappingTable + RawImportAction).
    - **renderProcess?** (por defecto: RawProgressDisplay + RawAbortButton, opcionalmente RawStatusIndicator).
    - **renderResult?** (por defecto: Toolbar + RawDataTable + Footer como se describe abajo).
  - Si no se pasan slots, usar composiciones por defecto con los componentes Raw ya implementados.
- [ ] **Lógica**:
  - Usar **getViewFromState(status, convertResult)** (o RawStatusGuard por dentro) para obtener la vista actual: **idle** | **mapping** | **process** | **result** | **error**.
  - Según vista:
    - **idle** → renderIdle o composición por defecto (RawFilePicker).
    - **mapping** → renderMapping o composición por defecto (RawMappingTable; RawImportAction).
    - **process** → renderProcess o composición por defecto (RawProgressDisplay; RawStatusIndicator opcional; RawAbortButton).
    - **result** → renderResult o composición por defecto: Toolbar (RawFilterToggle + RawExportButton) + Grid (RawDataTable con RawTableHead, RawTableBody, RawTableRow, RawTableCell, RawErrorBadge; edición habilitada) + Footer (RawPagination + RawPersistenceBanner).
    - **error** → opcionalmente mismo que idle (reintentar) o slot renderError si se añade.
- [ ] **Sin CSS**: solo estructura y composición. El consumidor puede envolver en un div con className/style para layout/estilos.
- [ ] **Identificación**: `data-ris-ui="raw-importer-workflow"`. Ref al contenedor raíz.
- [ ] **Export**: desde RawImporterWorkflow/index.ts y reexport en src/index.ts.

### 3.3 Composición por defecto (RESULT)

- [ ] **Toolbar**: contenedor (div o similar) con RawFilterToggle y RawExportButton (orden y estructura documentada).
- [ ] **Grid**: RawDataTable conteniendo RawTableHead (layout desde contexto) y RawTableBody (getRows(page, limit), RawTableRow, RawTableCell con edición, RawErrorBadge donde aplique).
- [ ] **Footer**: contenedor con RawPagination y RawPersistenceBanner.

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

- RawImporterWorkflow **no** duplica la lógica del Core; solo lee status y convertResult (vía RawStatusGuard o getViewFromState) y decide qué pantalla mostrar. Toda la lógica de importación sigue en el headless.
- El consumidor puede: (1) **RawImporterRoot + RawImporterWorkflow** para la experiencia "todo construido" (layout pasado al Root); (2) **RawImporterRoot + RawStatusGuard + slots** para control total de qué componente Raw mostrar en cada vista; (3) **RawImporterRoot + hooks reexportados** sin Workflow ni StatusGuard, importando el archivo por su cuenta (processFile) y/o construyendo su propia tabla (useSheetData, getRows).
- **Layout**: se pasa siempre a **RawImporterRoot**; el Workflow obtiene el layout del contexto.
- Mantener convención Raw: forwardRef, data-ris-ui, className y style en el contenedor raíz del workflow.
