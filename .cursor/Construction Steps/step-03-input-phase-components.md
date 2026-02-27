# Step 3 — Componentes de Entrada (Upload & Mapping)

Plan para implementar los **componentes atómicos** de la fase de entrada: selección de archivo (drag-and-drop), mapeo de columnas a campos del SheetLayout y disparo del pipeline. Basado en la propuesta Gemini: RawFilePicker, RawMappingTable, RawMappingRow, RawImportAction.

---

## 1. Objetivo

Implementar cuatro componentes Raw que cubren la **fase de entrada** del flujo:

| Componente | Responsabilidad |
|------------|-----------------|
| **RawFilePicker** | Wrapper que maneja drag-and-drop y el input de archivos. Expone el estado **isDragging**. Conecta con el Core para registrar el archivo (processFile / setFile). |
| **RawMappingTable** | Tabla para que el usuario asocie las columnas detectadas por el Parser con los campos del SheetLayout. Consume **useConvert**. |
| **RawMappingRow** | Fila de la tabla de mapeo: **Header Original** → **Selector de Campo de Destino** → **Estado de Mapeo** (Válido/Maltrecho). |
| **RawMappingSuggest** | Cuando el Core detecta que una columna del CSV **se parece** a un campo del Layout (fuzzy), expone **matchScore** (0–100) y **suggestedFieldId** para que la UI muestre un badge (ej: "Columna 'E-mail' coincide 90% con 'email'"). Param **fuzzyMatch** (en Root) desactiva esta experiencia. |
| **RawImportAction** | Botón que ejecuta **processFile** (pipeline Sanitizer → Validator → Transform). Debe manejar **disabled** si el mapeo es incompleto. |

Estos componentes no definen estilos; solo estructura HTML, semántica y conexión con el Core. La **customización** permite **desactivar el fuzziness** vía param **fuzzyMatch** en RawImporterRoot; si `fuzzyMatch === false`, RawMappingSuggest no muestra sugerencias (o no se usa). Siguen el patrón **prop-getters** donde aplique. Las vistas IDLE y MAPPING se ensamblan en el consumidor (o en RawImporterWorkflow) usando los slots de RawStatusGuard (Step 2).

**Uso sin RawFilePicker:** El usuario puede importar el archivo por su cuenta (input nativo, otra librería, etc.) y **pasarlo a la librería** llamando a **processFile(file)** (hook/método reexportado del headless en Step 2). No es obligatorio usar RawFilePicker; los componentes Raw son opcionales.

---

## 2. Contrato con el Headless

Antes de implementar, verificar en el [ai-context del headless](https://github.com/cristianm-developer/react-import-sheet-headless/blob/main/ai-context.md):

- **Carga de archivo**: método/hook para registrar el archivo (p. ej. `processFile`, `setFile`, `useFileUpload()`). Validación de tipo/tamaño si aplica.
- **useConvert**: columnas detectadas, headers, mapeo actual; cómo asociar cada columna del archivo a un campo del SheetLayout; **applyMapping** o equivalente.
- **Mapeo**: persistencia del mapeo (p. ej. `setColumnMapping`, `updateMapping(fieldId, columnIndex)`); si el Core expone "mapeo completo" para deshabilitar RawImportAction.
- **Disparo del pipeline**: acción que ejecuta Sanitizer → Validator → Transform (p. ej. `processFile()`, `runImport()`). Comportamiento del status tras disparar.

Definir en este proyecto los **tipos e interfaces** en `src/shared/types/` que reflejen ese contrato.

---

## 3. Checklist de tareas

### 3.1 Estructura de carpetas

- [ ] Bajo `src/components/` crear:
  - [ ] **`RawFilePicker/`** — input file + DnD + prop-getters; expone **isDragging**.
  - [ ] **`RawMappingTable/`** — tabla de mapeo (useConvert + filas RawMappingRow); respeta **fuzzyMatch** del contexto (si false, no muestra RawMappingSuggest).
  - [ ] **`RawMappingRow/`** — fila: header original → selector campo → estado (Válido/Maltrecho).
  - [ ] **`RawMappingSuggest/`** — expone **matchScore** (0–100) y **suggestedFieldId** para badge de sugerencia; solo activo si **fuzzyMatch** es true.
  - [ ] **`RawImportAction/`** — botón processFile; disabled si mapeo incompleto.
- [ ] Cada componente en su carpeta con: `RawX.tsx`, `index.ts`; opcionalmente `RawX.test.tsx`, `types.ts`.

### 3.2 RawFilePicker

- [ ] **Props**: `className?`, `style?` (convención Raw); `accept?` (p. ej. `.xlsx,.csv`); `children`: render prop o nodos que reciban **prop-getters**.
- [ ] **Prop-getters**: **getRootProps()** (contenedor/zona de drop: ref, onDragOver, onDragLeave, onDrop, role, aria-*); **getInputProps()** (input file: ref, type, onChange, accept). Permitir merge de `className`/`style` en los getters.
- [ ] **Estado**: exponer **isDragging** (para que el consumidor estilice la zona de drop). En onChange/onDrop llamar al método del Core que registra el archivo.
- [ ] **Identificación**: `data-ris-ui="raw-file-picker"` en raíz; opcionalmente `data-ris-ui="raw-file-picker-input"` en el input.
- [ ] **Ref**: `forwardRef` al contenedor raíz.
- [ ] **Export**: desde `RawFilePicker/index.ts` y reexport en `src/index.ts`.

### 3.3 RawMappingTable

- [ ] **Responsabilidad**: consumir **useConvert** (columnas detectadas + layout). Renderizar una **RawMappingRow** por cada columna detectada.
- [ ] **Props**: `className?`, `style?`; opcional **renderRow?** para customizar la fila; por defecto usar **RawMappingRow** internamente.
- [ ] **Estado**: el mapeo vive en el Core; este componente solo lee/escribe vía hooks (useConvert, setColumnMapping / applyMapping). No duplicar estado en la UI Raw.
- [ ] **fuzzyMatch**: si el contexto (Root) tiene **fuzzyMatch === false**, no renderizar sugerencias fuzzy ni usar RawMappingSuggest. Si true, integrar RawMappingSuggest (o getter de sugerencia) donde el Core exponga coincidencias aproximadas.
- [ ] **Identificación**: `data-ris-ui="raw-mapping-table"`. Ref al contenedor (p. ej. `<table>` o `<div role="table">`).
- [ ] **Export**: desde `RawMappingTable/index.ts` y reexport en `src/index.ts`.

### 3.4 RawMappingSuggest

- [ ] **Props**: `className?`, `style?`; **columnHeader** (texto columna CSV); **matchScore** (0–100, desde el Core cuando hay fuzzy match); **suggestedFieldId** y opcionalmente **suggestedFieldLabel**; **children** o render prop **({ matchScore, suggestedFieldId, suggestedFieldLabel })** para que el consumidor pinte el badge ("Columna 'X' coincide 90% con 'Y'").
- [ ] **Comportamiento**: solo tiene sentido cuando **fuzzyMatch** es true. El Core (useConvert o equivalente) debe exponer para cada columna detectada si hay una sugerencia fuzzy y su score. RawMappingSuggest expone esos datos; no incluye textos fijos; el consumidor o el slot muestran el mensaje.
- [ ] **Identificación**: `data-ris-ui="raw-mapping-suggest"`. Ref al contenedor.
- [ ] **Export**: desde `RawMappingSuggest/index.ts` y reexport en `src/index.ts`.

### 3.5 RawMappingRow

- [ ] **Props**: `className?`, `style?`; **headerOriginal** (texto o id de la columna detectada); **options** (campos del SheetLayout para el selector); **value** (fieldId seleccionado o null); **onChange(fieldId: string | null)**; **mappingStatus** (p. ej. `'valid' | 'invalid'` o derivado del Core) para mostrar Válido/Maltrecho.
- [ ] **Estructura**: celda Header Original → celda con selector (native `<select>` o accesible) → celda Estado de Mapeo (slot o texto "Válido"/"Maltrecho" según mappingStatus). Prop-getters para cada zona si se desea estilizar por parte del consumidor.
- [ ] **Identificación**: `data-ris-ui="raw-mapping-row"`. Ref al `<tr>` o contenedor de fila.
- [ ] **Export**: desde `RawMappingRow/index.ts` y reexport en `src/index.ts`.

### 3.6 RawImportAction

- [ ] **Props**: `className?`, `style?`; **children** (contenido del botón, p. ej. "Confirmar y Procesar"). **disabled** puede calcularse internamente vía hook del Core (mapeo incompleto, ya procesando) o recibirse por prop.
- [ ] **Comportamiento**: al click, llamar a la acción del Core que ejecuta el pipeline (processFile / runImport). No contener lógica de negocio; solo disparar la acción. **disabled** si el mapeo es incompleto (según Core).
- [ ] **Semántica**: `<button type="button">`. Accesibilidad: `aria-busy` cuando status es processing.
- [ ] **Identificación**: `data-ris-ui="raw-import-action"`. Ref al `<button>`.
- [ ] **Export**: desde `RawImportAction/index.ts` y reexport en `src/index.ts`.

### 3.7 Tipos compartidos

- [ ] En `src/shared/types/`: tipos para opciones del layout (id, label), columna detectada (header/index), estado de mapeo (valid/invalid). Documentar correspondencia con el headless.

### 3.8 Tests

- [ ] RawFilePicker: prop-getters coherentes; isDragging; onChange/onDrop llaman al Core (mock).
- [ ] RawMappingRow: render de header, selector y estado; onChange y mappingStatus.
- [ ] RawMappingTable: una fila por columna; cambios en selector reflejados en Core (mock useConvert).
- [ ] RawImportAction: click dispara processFile; disabled respetado.

### 3.9 Storybook

- [ ] RawFilePicker: zona de drop, isDragging, input oculto; actions con archivo recibido.
- [ ] RawMappingRow: opciones de layout, value/onChange, mappingStatus.
- [ ] RawMappingTable: dentro de ImporterProvider (o decorator) con columnas y layout de ejemplo.
- [ ] RawImportAction: botón; control disabled; action al click.

### 3.10 Documentación

- [ ] Actualizar **ai-context.md**: RawFilePicker, RawMappingTable, **RawMappingSuggest** (matchScore, suggestedFieldId, slot), RawMappingRow, RawImportAction (props, ejemplos); mencionar **fuzzyMatch** para desactivar sugerencias.
- [ ] Actualizar **Architecture.md**: estado Step 3 y lista de componentes Raw.

---

## 4. Orden sugerido de ejecución

1. Revisar ai-context del headless: carga de archivo, useConvert, mapeo, processFile/runImport.
2. Definir tipos en `src/shared/types/` (columnas detectadas, opciones layout, estado mapeo).
3. Implementar **RawFilePicker** (prop-getters + isDragging + Core) y exportar.
4. Implementar **RawMappingRow** (header → selector → estado) y exportar.
5. Implementar **RawMappingTable** (useConvert + lista RawMappingRow) y exportar.
6. Implementar **RawImportAction** (botón + processFile + disabled) y exportar.
7. Tests, Storybook, ai-context.md y Architecture.md.

---

## 5. Notas

- **Prop-getters**: RawFilePicker debe documentar getRootProps y getInputProps (y que aceptan className/style) para que Tailwind/CSS se apliquen desde fuera.
- **RawMappingTable** no guarda estado de mapeo; todo fluye al Core. RawMappingRow es la unidad atómica de una fila de mapeo.
- **RawImportAction**: si el Core expone "canRunImport" o "isMappingComplete", usarlo para `disabled`; si no, aceptar `disabled` por prop.
- Convención Raw: `forwardRef`, `data-ris-ui="..."`, `className` y `style` en todos los componentes.
