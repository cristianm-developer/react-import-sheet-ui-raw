# Step 6 — Componentes de Navegación y Salida (View Phase)

Plan para implementar los **componentes atómicos** de la fase de vista final: paginación, filtro (todos / solo errores), exportación y banner de persistencia. Basado en la propuesta Gemini: RawPagination, RawFilterToggle, RawExportButton, RawPersistenceBanner.

---

## 1. Objetivo

Implementar cuatro componentes Raw que cubren la **fase de navegación y salida** cuando el status es **success** (vista RESULT):

| Componente | Responsabilidad |
|------------|-----------------|
| **RawPagination** | Botones Siguiente/Anterior (y opcionalmente selector de página/tamaño) vinculados a **setPage** (y setPageSize si el Core lo expone). |
| **RawFilterToggle** | Switch para cambiar entre **filterMode: 'all'** y **'errors-only'** (solo filas con errores). |
| **RawExportButton** | Dispara **downloadCSV** o **downloadJSON**. Puede ser un único componente con dos acciones (dos botones internos o render props para "Descargar CSV" / "Descargar JSON") o dos componentes; según convención de la lib, se documenta como **RawExportButton** que expone ambas acciones (slots o render prop con { downloadCSV, downloadJSON }). |
| **RawPersistenceBanner** | Aparece si **hasRecoverableSession** es true. Ofrece "Recuperar" o "Limpiar" la sesión guardada (recoverSession / clearSession). |

Estos componentes no definen estilos; solo estructura, semántica y conexión con el Core. Se usan típicamente en el slot **renderResult** de RawStatusGuard (Toolbar + Footer) o dentro de **RawImporterWorkflow**.

---

## 2. Contrato con el Headless

Referencia: [ai-context del headless](https://github.com/cristianm-developer/react-import-sheet-headless/blob/main/ai-context.md).

- **Filtrado**: hook/contexto que exponga **filterMode** (`'all' | 'errors-only'`, valor con guión según headless) y **setFilterMode**.
- **Paginación**: **page**, **pageSize**, **setPage**, **setPageSize** (p. ej. usePagination() o contexto). Filas visibles según Core.
- **Exportación**: **downloadCSV()** y **downloadJSON()** (hook useSheetView / useExport o equivalente); parámetros (nombre de archivo, opciones) según headless.
- **Persistencia**: **hasRecoverableSession**; **recoverSession()** y **clearPersistedState()** (el headless exporta este nombre; la UI Raw puede exponer un alias **clearSession** que llame a clearPersistedState()).

Definir en **src/shared/types/** los tipos (p. ej. FilterMode) que reflejen ese contrato.

---

## 3. Checklist de tareas

### 3.1 Estructura de carpetas

- [ ] Bajo `src/components/` crear:
  - [ ] **`RawPagination/`** — controles setPage (y setPageSize si aplica).
  - [ ] **`RawFilterToggle/`** — switch all / errors-only.
  - [ ] **`RawExportButton/`** — dispara downloadCSV y/o downloadJSON (dos botones o render prop con ambas acciones).
  - [ ] **`RawPersistenceBanner/`** — Recuperar / Limpiar sesión.
- [ ] Cada componente en su carpeta con: `RawX.tsx`, `index.ts`; opcionalmente `RawX.test.tsx`, `types.ts`.

### 3.2 RawPagination

- [ ] **Props**: `className?`, `style?`. **children** opcional: render prop **({ page, pageSize, totalRows, setPage, setPageSize })** para controles custom. Opcional **pageSizeOptions?: number[]**.
- [ ] **Comportamiento**: usar hook/contexto del Core para page, pageSize, setPage, setPageSize; totalRows si el headless lo expone. Botones Siguiente/Anterior llaman setPage. Selector de tamaño llama setPageSize.
- [ ] **Semántica**: navegación con aria-label; botones Anterior/Siguiente accesibles.
- [ ] **Identificación**: `data-ris-ui="raw-pagination"`. Ref al contenedor raíz.
- [ ] **Export**: desde RawPagination/index.ts y reexport en src/index.ts.

### 3.3 RawFilterToggle

- [ ] **Props**: `className?`, `style?`. **children** opcional: render prop **({ filterMode, setFilterMode })**. O slots/labels **labelAll?**, **labelErrorsOnly?** para botones por defecto.
- [ ] **Comportamiento**: leer filterMode y setFilterMode del Core; al activar cada opción llamar **setFilterMode('all')** o **setFilterMode('errors-only')** (valores literales según headless: `'all' | 'errors-only'`).
- [ ] **Semántica**: role="group", aria-label; estado activo (aria-pressed o data).
- [ ] **Identificación**: `data-ris-ui="raw-filter-toggle"`. Ref al contenedor raíz.
- [ ] **Export**: desde RawFilterToggle/index.ts y reexport en src/index.ts.

### 3.4 RawExportButton

- [ ] **Props**: `className?`, `style?`. **children** opcional: render prop **({ downloadCSV, downloadJSON })** para que el consumidor pinte uno o dos botones. O slots **renderCsvButton?**, **renderJsonButton?** con contenido. Labels **labelCSV?**, **labelJSON?** si hay botones por defecto.
- [ ] **Comportamiento**: obtener **downloadCSV** y **downloadJSON** del Core; cada botón (o acción) dispara la correspondiente. No definir lógica de serialización; solo conectar con el Core.
- [ ] **Semántica**: botones type="button" con aria-label descriptivo.
- [ ] **Identificación**: `data-ris-ui="raw-export-button"` en el contenedor; opcionalmente data en cada botón (csv/json). Ref al contenedor raíz.
- [ ] **Export**: desde RawExportButton/index.ts y reexport en src/index.ts.

### 3.5 RawPersistenceBanner

- [ ] **Props**: `className?`, `style?`. **children** opcional: render prop **({ onRecover, onClear })**. **message?**, **labelRecover?**, **labelClear?** para texto y botones.
- [ ] **Comportamiento**: usar **hasRecoverableSession** del Core; si false, no renderizar (null). Si true, mostrar banner: **Recuperar** → **recoverSession()**, **Limpiar** → **clearSession()** (clearSession debe invocar **clearPersistedState()** del headless; la UI Raw puede exponer el alias clearSession).
- [ ] **Semántica**: role="status" o "alert", aria-live="polite"; botones identificados.
- [ ] **Identificación**: `data-ris-ui="raw-persistence-banner"`. Ref al contenedor raíz.
- [ ] **Export**: desde RawPersistenceBanner/index.ts y reexport en src/index.ts.

### 3.6 Tipos compartidos

- [ ] En **src/shared/types/** definir **FilterMode** (`'all' | 'errors-only'`, con guión, alineado con el headless) y tipos que el headless no exporte pero la UI Raw necesite.

### 3.7 Tests

- [ ] RawFilterToggle: click en cada opción llama setFilterMode correcto (mock).
- [ ] RawPagination: setPage y setPageSize invocados al interactuar (mock).
- [ ] RawExportButton: click en cada acción llama downloadCSV o downloadJSON (mock).
- [ ] RawPersistenceBanner: no render cuando hasRecoverableSession false; render y onRecover/onClear llaman recoverSession/clearSession cuando true.

### 3.8 Storybook

- [ ] RawFilterToggle: story con status success; control filterMode; acciones al cambiar.
- [ ] RawPagination: datos de ejemplo; controles page/pageSize; acciones.
- [ ] RawExportButton: botones CSV/JSON; acciones al click.
- [ ] RawPersistenceBanner: mock hasRecoverableSession true/false; acciones Recuperar y Limpiar.

### 3.9 Documentación

- [ ] Actualizar **ai-context.md**: RawPagination, RawFilterToggle, RawExportButton (downloadCSV, downloadJSON), RawPersistenceBanner (props, slots/render props).
- [ ] Actualizar **Architecture.md**: Step 6 y lista de componentes Raw de View Phase.

---

## 4. Orden sugerido de ejecución

1. Verificar en el headless: filterMode (`'all' | 'errors-only'`), setFilterMode, page/pageSize/setPage/setPageSize, downloadCSV/downloadJSON, hasRecoverableSession/recoverSession/clearPersistedState.
2. Definir tipos en src/shared/types/ (FilterMode, etc.).
3. Implementar RawPagination, RawFilterToggle, RawExportButton, RawPersistenceBanner y exportar.
4. Tests, Storybook, ai-context.md y Architecture.md.

---

## 5. Resumen de interacciones

| Componente | Interacciones |
|------------|---------------|
| **RawFilterToggle** | "Ver todos" → setFilterMode('all'). "Solo errores" → setFilterMode('errors-only'). |
| **RawPagination** | Anterior/Siguiente o selector → setPage(n). Selector tamaño → setPageSize(n). |
| **RawExportButton** | "Descargar CSV" → downloadCSV(). "Descargar JSON" → downloadJSON(). |
| **RawPersistenceBanner** | "Recuperar" → recoverSession(). "Limpiar" → clearSession() (alias de clearPersistedState() del headless). Visible solo si hasRecoverableSession === true. |

---

## 6. Notas

- RawPersistenceBanner puede mostrarse en IDLE (vista de Carga) si hay sesión recuperable, según diseño del headless. Ubicación (renderIdle vs renderResult) según contrato del Core.
- Convención Raw: forwardRef, data-ris-ui, className y style en todos los componentes.
