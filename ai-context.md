# Guía de consumo — @cristianm/react-import-sheet-ui-raw

**Propósito:** Referencia para integradores (IA o desarrolladores) y para **librerías de presentación** (Tailwind, CSS, etc.) que consuman esta librería. Usar solo la API pública descrita aquí.

---

## Qué es esta lib: Hooks-First Headless

Esta librería es **lógica, no componentes**. El producto principal son **hooks** (`useRawCell`, `useRawFilePicker`, etc.) que devuelven **estado**, **acciones** y **prop-getters** (contrato DOM: `role`, `aria-*`, `data-*`). Con esos hooks el consumidor (o una futura lib de UI) configura sus propios nodos — `<td>`, `<div>`, grid custom, TanStack Virtual, etc. — sin conflictos de estilos ni markup impuesto.

Opcionalmente se exponen **wrappers** (RawTableCell, RawFilePicker, …) que solo llaman al hook y pasan el resultado por render prop; son conveniencia, no obligatorios.

---

## Cómo usar esta lib

1. Esta librería depende de **@cristianm/react-import-sheet-headless**. Configura primero el **ImporterProvider** (vía **RawImporterRoot** con `layout`) según el [ai-context del headless](https://github.com/cristianm-developer/react-import-sheet-headless/blob/main/ai-context.md).
2. **Forma principal:** Usar **hooks** (`useRawCell`, `useRawFilePicker`, …). Cada hook devuelve getters y estado; el consumidor aplica los getters a sus nodos y aplica sus propias clases/estilos.
3. **Forma opcional:** Usar los **wrappers** (RawTableCell, RawProgressMonitor, etc.) cuando convenga; siguen siendo sin estilos y exponen render props.

### Contrato con el headless (telemetría y persistencia)

- **Telemetría:** El headless no exporta un hook `useImporterMetrics`; la telemetría está en **`useImporter().metrics`** (tipo **PipelineMetrics**). Esta lib reexporta `useImporter()` y puede exponer un wrapper **`useImporterMetrics()`** que devuelva ese valor, para resúmenes de rendimiento (ej. "10.000 filas en 1,2s").
- **Persistencia:** El headless expone **hasRecoverableSession**, **recoverSession()** y **clearPersistedState()**. En la UI Raw la acción "Limpiar sesión" se documenta como **clearSession**; en la implementación debe llamar a **clearPersistedState()** del headless (o la lib puede exportar un alias `clearSession` que invoque `clearPersistedState()`).

---

## Hooks (API principal)

_(Actualizar al finalizar cada hook: nombre, retorno (estado, acciones, getters), y ejemplo de uso.)_

### Ejemplo de ficha por hook

```markdown
### useRawCell(cellContext)

- **Retorno:** value, errors, isPending, isEditing, getCellProps(options?), getEditInputProps(), getErrorProps()
- **Contrato DOM:** getCellProps aplica role="gridcell", aria-invalid, data-pending; acepta className, style
- **Ejemplo:** const state = useRawCell(cell); return <td {...state.getCellProps({ className: "..." })}>...</td>;
```

---

## Índice: hooks y wrappers opcionales

| Hook / Wrapper                          | Descripción                                                                  | Estado |
| --------------------------------------- | ---------------------------------------------------------------------------- | ------ |
| **useRawProgress** / RawProgressMonitor | Progreso vía EventTarget; ref/valor para barra sin re-renders; phase actual. | Step 4 |
| **useRawAbort** / RawAbortController    | Acción `abort()` del Core; wrapper: botón que la invoca.                     | Step 4 |

---

### useRawProgress / RawProgressMonitor (wrapper opcional)

- **Hook useRawProgress:** retorna `{ phase, progressRef, aborted, onProgress? }` — `progressRef` actualizado en cada evento sin re-renders; ideal para barra de progreso.
- **Wrapper RawProgressMonitor:** usa el hook y expone render prop `children({ phase, progressRef, aborted })`; props `className?`, `style?`, `onProgress?`.
- **Contrato:** ref al contenedor raíz (`div`), `data-ris-ui="raw-progress-monitor"`.
- **Uso:** Dentro de RawImporterRoot; típicamente en el slot `renderProcess` de RawStatusGuard. No re-renderiza con cada %; usar `progressRef.current` o `onProgress` para la barra.

```tsx
<RawProgressMonitor onProgress={(d) => setPercent(d.globalPercent ?? 0)} className="my-progress">
  {({ phase, progressRef, aborted }) => (
    <>
      <span>{phase || 'Processing...'}</span>
      <div role="progressbar" aria-valuenow={progressRef.current?.globalPercent ?? 0}>
        {/* barra con estilos propios */}
      </div>
      {aborted && <span>Cancelled</span>}
    </>
  )}
</RawProgressMonitor>
```

---

### useRawAbort / RawAbortController (wrapper opcional)

- **Hook useRawAbort:** retorna `{ abort, getButtonProps(options?) }` — `abort()` llama al Core; getter aplica onClick y contrato al botón.
- **Wrapper RawAbortController:** usa el hook; props `className?`, `style?`, `children?`, `disabled?`, `aria-label?`. Al click invoca `abort()`.
- **Contrato:** ref al `<button>`, `data-ris-ui="raw-abort-controller"`, `type="button"`.
- **Uso:** Dentro de RawImporterRoot; típicamente junto a RawProgressMonitor en la vista de Proceso.

```tsx
<RawAbortController className="btn-cancel" aria-label="Cancel import">
  Cancelar
</RawAbortController>
```

---

Cuando se añada o cambie un **hook** o un wrapper, actualizar este archivo (getters, estado, acciones) para que integradores y libs de UI sepan consumir la lib vía hooks.
