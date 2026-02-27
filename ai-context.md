# Guía de consumo — @cristianm/react-import-sheet-ui-raw

**Propósito:** Referencia para integradores (IA o desarrolladores) y para **librerías de presentación** (Tailwind, CSS, etc.) que quieran consumir los componentes Raw de esta librería. Usar solo la API pública descrita aquí.

---

## Cómo usar esta UI Raw

1. Esta librería depende de **@cristianm/react-import-sheet-headless**. Configura primero el **ImporterProvider** y el pipeline según el [ai-context del headless](https://github.com/cristianm-developer/react-import-sheet-headless/blob/main/ai-context.md).
2. Los componentes de esta lib son **sin estilos**: exponen **Prop-Getters** y/o **Slots** para que el consumidor aplique sus propias clases y estilos.

### Contrato con el headless (telemetría y persistencia)

- **Telemetría:** El headless no exporta un hook `useImporterMetrics`; la telemetría está en **`useImporter().metrics`** (tipo **PipelineMetrics**). Esta lib reexporta `useImporter()` y puede exponer un wrapper **`useImporterMetrics()`** que devuelva ese valor, para resúmenes de rendimiento (ej. "10.000 filas en 1,2s").
- **Persistencia:** El headless expone **hasRecoverableSession**, **recoverSession()** y **clearPersistedState()**. En la UI Raw la acción "Limpiar sesión" se documenta como **clearSession**; en la implementación debe llamar a **clearPersistedState()** del headless (o la lib puede exportar un alias `clearSession` que invoque `clearPersistedState()`).

---

## Componentes Raw

_(Actualizar al finalizar cada componente: nombre, props, getters, slots, estructura DOM esperada y ejemplo de uso con estilos externos.)_

### Ejemplo de ficha por componente

```markdown
### RawTable
- **Props:** ...
- **Prop-Getters:** getTableProps(), getRowProps(row), getCellProps(cell), ...
- **Slots:** header?, body?, cell?
- **Consumo con Tailwind:** ...
```

---

## Índice de componentes

| Componente | Descripción | Estado |
|------------|-------------|--------|
| **RawProgressMonitor** | Monitoreo de progreso (EventTarget); slot/ref para barra; phase actual. | Step 4 |
| **RawAbortController** | Botón Cancelar que llama a `abort()` del Core. | Step 4 |

---

### RawProgressMonitor

- **Props:** `className?`, `style?`, `children?` (render prop), `onProgress?` (callback).
- **Render prop:** `children({ phase, progressRef, aborted })` — `phase` (string), `progressRef` (ref actualizado en cada evento, sin re-renders), `aborted` (boolean tras `importer-aborted`).
- **onProgress:** opcional; se invoca en cada evento `importer-progress` con el `ImporterProgressDetail`; el consumidor puede hacer setState para pintar la barra.
- **Contrato Raw:** ref al contenedor raíz (`div`), `data-ris-ui="raw-progress-monitor"`.
- **Uso:** Dentro de `ImporterProvider`; típicamente en el slot `renderProcess` de RawStatusGuard. No re-renderiza con cada %; usar `progressRef.current` o `onProgress` para la barra.

```tsx
<RawProgressMonitor
  onProgress={(d) => setPercent(d.globalPercent ?? 0)}
  className="my-progress"
>
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

### RawAbortController

- **Props:** `className?`, `style?`, `children?` (contenido del botón), `disabled?`, `aria-label?`.
- **Comportamiento:** al hacer click llama a `abort()` de `useImporter()` (termina Workers y dispara `importer-aborted`).
- **Contrato Raw:** ref al `<button>`, `data-ris-ui="raw-abort-controller"`, `type="button"`.
- **Uso:** Dentro de `ImporterProvider`; típicamente junto a RawProgressMonitor en la vista de Proceso.

```tsx
<RawAbortController className="btn-cancel" aria-label="Cancel import">
  Cancelar
</RawAbortController>
```

---

Cuando se añada o cambie un componente Raw, actualizar este archivo para que las librerías de Tailwind/CSS sepan cómo consumirlo.
