# Step 3 — Input Phase (hooks y prop-getters)

Plan para implementar los **hooks** de la fase de entrada: selección de archivo (drag-and-drop), mapeo de columnas a campos del SheetLayout y disparo del pipeline. Cada hook devuelve **estado, acciones y prop-getters** (getRootProps, getInputProps, etc.); los wrappers (RawFilePicker, RawMappingTable, etc.) son opcionales y solo llaman al hook y pasan el resultado por render prop.

---

## 1. Objetivo

Implementar los **hooks** que cubren la **fase de entrada** del flujo (entregables principales); los wrappers son opcionales.

| Hook                     | Responsabilidad                                                                                      | Prop-getters / retorno                                                                                                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **useRawFilePicker**     | Estado isDragging; conexión con processFile.                                                         | **getRootProps({ className?, style? })** — contenedor/zona drop: ref, onDragOver, onDragLeave, onDrop, role, aria-\*; **getInputProps()** — input file: ref, type, onChange, accept. |
| **useRawMappingTable**   | Estado de mapeo CSV ↔ Layout (useConvert); lista de columnas detectadas.                             | Datos para que el consumidor itere; opcionalmente getters por fila.                                                                                                                  |
| **useRawMappingRow**     | Por fila: header original, selector destino, estado válido/maltrecho.                                | Getters por celda (header, selector, estado) o estado + acciones.                                                                                                                    |
| **useRawMappingSuggest** | Cuando hay fuzzy match: matchScore (0–100), suggestedFieldId. Param **fuzzyMatch** (Root) desactiva. | **matchScore**, **suggestedFieldId**, **suggestedFieldLabel**; sin UI.                                                                                                               |
| **useRawImportAction**   | **disabled** si mapeo incompleto; acción que ejecuta processFile.                                    | `{ disabled, runImport }` (o equivalente).                                                                                                                                           |

La **customización** permite **desactivar fuzziness** vía **fuzzyMatch** en rootConfig; si `fuzzyMatch === false`, useRawMappingSuggest no expone sugerencias (o el consumidor no las usa). El consumidor aplica los getters a sus propios nodos (`<div {...getRootProps()}><input {...getInputProps()} /></div>`). Opcionalmente wrappers RawFilePicker, RawMappingTable, etc. que solo llaman al hook y exponen render prop.

**Uso sin wrapper:** El usuario puede usar **processFile(file)** (reexportado del headless) y construir su propio file input; no es obligatorio usar useRawFilePicker ni RawFilePicker.

---

## 2. Contrato con el Headless

Antes de implementar, verificar en el [ai-context del headless](https://github.com/cristianm-developer/react-import-sheet-headless/blob/main/ai-context.md):

- **Carga de archivo**: método/hook para registrar el archivo (p. ej. `processFile`, `setFile`, `useFileUpload()`). Validación de tipo/tamaño si aplica.
- **useConvert**: columnas detectadas, headers, mapeo actual; cómo asociar cada columna del archivo a un campo del SheetLayout; **applyMapping** o equivalente.
- **Mapeo**: persistencia del mapeo (p. ej. `setColumnMapping`, `updateMapping(fieldId, columnIndex)`); si el Core expone "mapeo completo" para deshabilitar la acción de importar.
- **Disparo del pipeline**: acción que ejecuta Sanitizer → Validator → Transform (p. ej. `processFile()`, `runImport()`). Comportamiento del status tras disparar.

Definir en este proyecto los **tipos e interfaces** en `src/shared/types/` que reflejen ese contrato.

---

## 3. Checklist de tareas

### 3.1 Estructura de carpetas

- [ ] Bajo **`src/hooks/`** crear:
  - [ ] **`useRawFilePicker/`** — estado isDragging + getRootProps, getInputProps; conexión con processFile.
  - [ ] **`useRawMappingTable/`** — estado de mapeo (useConvert); datos por fila para que el consumidor itere.
  - [ ] **`useRawMappingRow/`** — por fila: headerOriginal, options, value, onChange, mappingStatus (y opcionalmente getters).
  - [ ] **`useRawMappingSuggest/`** — matchScore, suggestedFieldId (solo si fuzzyMatch); param para desactivar.
  - [ ] **`useRawImportAction/`** — disabled (mapeo incompleto) + acción processFile/runImport.
- [ ] Cada hook en su carpeta: `useX.ts`, `index.ts`; opcionalmente `useX.test.ts`, `types.ts`.
- [ ] Opcional: bajo **`src/components/`** wrappers (RawFilePicker, RawMappingTable, RawMappingRow, RawMappingSuggest, RawImportAction) que solo llaman al hook y exponen render prop o children como función.

### 3.2 useRawFilePicker (hook principal)

- [ ] **Firma**: `useRawFilePicker(options?)` — options puede incluir `accept?` (p. ej. `.xlsx,.csv`).
- [ ] **Retorno**: `{ isDragging, getRootProps, getInputProps }`. **getRootProps({ className?, style? })** devuelve props para el contenedor de drop: ref, onDragOver, onDragLeave, onDrop, role, aria-\*; permitir merge de className/style. **getInputProps()** devuelve ref, type="file", onChange, accept. En onChange/onDrop llamar a **processFile** del Core.
- [ ] **Export**: desde `src/hooks/useRawFilePicker/index.ts` y reexport en `src/index.ts`. Documentar en ai-context los getters y sus parámetros.

### 3.3 useRawMappingTable

- [ ] **Retorno**: estado de mapeo desde **useConvert** (columnas detectadas, layout); lista de filas con datos para **useRawMappingRow** (o equivalente). No guardar estado de mapeo en la UI; todo en el Core. Respetar **fuzzyMatch** del rootConfig: si false, no exponer sugerencias fuzzy.
- [ ] **Export**: desde `src/hooks/useRawMappingTable/index.ts` y reexport en `src/index.ts`.

### 3.4 useRawMappingRow

- [ ] **Firma**: `useRawMappingRow(rowContext)` — rowContext incluye header original, índice, etc.
- [ ] **Retorno**: **headerOriginal**, **options** (campos del Layout), **value** (fieldId seleccionado o null), **onChange(fieldId)**, **mappingStatus** ('valid' | 'invalid' o derivado del Core). Opcionalmente getters por celda para que el consumidor aplique a `<td>` o `<div>`.
- [ ] **Export**: desde `src/hooks/useRawMappingRow/index.ts` y reexport en `src/index.ts`.

### 3.5 useRawMappingSuggest

- [ ] **Firma**: `useRawMappingSuggest(columnContext)` o integrado en useRawMappingRow. Solo activo si **fuzzyMatch** es true (leer del rootConfig).
- [ ] **Retorno**: **matchScore** (0–100), **suggestedFieldId**, **suggestedFieldLabel** cuando el Core devuelve coincidencia fuzzy. Sin UI; el consumidor pinta el badge.
- [ ] **Export**: desde `src/hooks/useRawMappingSuggest/index.ts` y reexport en `src/index.ts`.

### 3.6 useRawImportAction

- [ ] **Retorno**: **disabled** (true si mapeo incompleto o ya procesando, según Core) y **runImport** (acción que ejecuta processFile/runImport). Sin UI; el consumidor aplica a `<button>`.
- [ ] **Export**: desde `src/hooks/useRawImportAction/index.ts` y reexport en `src/index.ts`.

### 3.7 Wrappers opcionales

- [ ] **RawFilePicker** (opcional): llama a useRawFilePicker; **children** como función `(state) => ReactNode` con state = { isDragging, getRootProps, getInputProps }. Ref `data-ris-ui="raw-file-picker"`.
- [ ] **RawMappingTable**, **RawMappingRow**, **RawMappingSuggest**, **RawImportAction**: wrappers que llaman al hook correspondiente y exponen render prop; convención Raw (forwardRef, data-ris-ui, className, style).

### 3.8 Tipos compartidos

- [ ] En `src/shared/types/`: tipos para opciones del layout (id, label), columna detectada (header/index), estado de mapeo (valid/invalid). Documentar correspondencia con el headless.

### 3.9 Tests

- [ ] useRawFilePicker: getRootProps/getInputProps coherentes; isDragging; onChange/onDrop llaman processFile (mock).
- [ ] useRawMappingRow: retorno correcto para header, options, value, onChange, mappingStatus.
- [ ] useRawMappingTable: datos por fila correctos; cambios vía useConvert (mock).
- [ ] useRawImportAction: disabled según mapeo; runImport dispara processFile (mock).

### 3.10 Storybook

- [ ] useRawFilePicker: ejemplo aplicando getRootProps/getInputProps a div e input; isDragging; actions con archivo recibido.
- [ ] useRawMappingRow/Table: dentro de ImporterProvider con columnas y layout de ejemplo; controles.
- [ ] useRawImportAction: botón con disabled y runImport; action al click.

### 3.11 Documentación

- [ ] Actualizar **ai-context.md**: useRawFilePicker (getRootProps, getInputProps, isDragging), useRawMappingTable, useRawMappingRow, useRawMappingSuggest (matchScore, suggestedFieldId), useRawImportAction (disabled, runImport); **fuzzyMatch** para desactivar sugerencias. Wrappers como opcionales.
- [ ] Actualizar **Architecture.md**: estado Step 3; lista de **hooks** de entrada como artefactos principales.

---

## 4. Orden sugerido de ejecución

1. Revisar ai-context del headless: carga de archivo, useConvert, mapeo, processFile/runImport.
2. Definir tipos en `src/shared/types/` (columnas detectadas, opciones layout, estado mapeo).
3. Implementar **useRawFilePicker** (getRootProps, getInputProps, isDragging, processFile) y exportar.
4. Implementar **useRawMappingRow** y **useRawMappingTable** (useConvert + datos por fila) y exportar.
5. Implementar **useRawMappingSuggest** (matchScore, suggestedFieldId; fuzzyMatch) y **useRawImportAction** (disabled, runImport) y exportar.
6. Tests, Storybook, ai-context.md y Architecture.md.
7. Opcional: wrappers RawFilePicker, RawMappingTable, RawMappingRow, RawMappingSuggest, RawImportAction.

---

## 5. Notas

- **Prop-getters**: useRawFilePicker documenta getRootProps y getInputProps (aceptan className/style) para que el consumidor aplique Tailwind/CSS a sus nodos.
- useRawMappingTable no guarda estado; todo fluye al Core. useRawMappingRow es la unidad por fila.
- useRawImportAction: si el Core expone "canRunImport" o "isMappingComplete", usarlo para `disabled`; si no, documentar que el consumidor puede pasar disabled por prop adicional.
- Convención Raw en wrappers: forwardRef, data-ris-ui, className y style.
