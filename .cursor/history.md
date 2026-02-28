# History — ADRs

Registro de **Architecture Decision Records**: por qué se eligió un patrón de UI u otra decisión técnica. Actualizar después de cambios significativos de diseño.

---

## Formato sugerido por ADR

```markdown
## ADR-XXX: Título corto

- **Fecha:** YYYY-MM-DD
- **Estado:** propuesto | aceptado | deprecado
- **Contexto:** qué problema o necesidad.
- **Decisión:** qué se eligió (ej. Prop-Getter para celdas).
- **Consecuencias:** ventajas, limitaciones, impacto en consumidores.
```

---

## Índice de ADRs

| ADR     | Título                                        | Estado   |
| ------- | --------------------------------------------- | -------- |
| ADR-001 | Hooks-first headless                          | aceptado |
| ADR-002 | Namespacing useRaw y prop-getters             | aceptado |
| ADR-003 | RawImporterWorkflow como orquestador opcional | aceptado |

---

## ADR-001: Hooks-first headless

- **Fecha:** 2025-02-27
- **Estado:** aceptado
- **Contexto:** La lib debe exponer lógica reutilizable sin imponer UI ni CSS; el consumidor (o una futura capa de UI) debe poder construir su propia interfaz.
- **Decisión:** El núcleo de la lib son **hooks** que traducen el Core (headless) a estado, acciones y **prop-getters** (contrato DOM: `role`, `aria-*`, `data-*`). Cero CSS; cero conflictos de estilos. Los “componentes” (RawFilePicker, RawMappingTable, etc.) son **opcionales** y solo delegan en los hooks; el consumidor puede usar solo hooks y pintar su propio markup.
- **Consecuencias:** API principal = hooks useRaw\*; reexport de hooks del headless; wrappers y RawImporterWorkflow son conveniencia. Documentación y reglas (.cursor) refuerzan “hooks primero”.

---

## ADR-002: Namespacing useRaw y typings de prop-getters

- **Fecha:** 2025-02-27
- **Estado:** aceptado
- **Contexto:** Evitar colisiones con hooks del Headless y asegurar que los getters permitan extender con props del usuario (className, onClick, etc.).
- **Decisión:** (1) Hooks propios de esta lib usan prefijo **`useRaw`**; los reexportados del Headless no se renombran. (2) Los prop-getters (`getCellProps`, `getRowProps`, `getInputProps`, …) aceptan **userProps** tipados y los fusionan con la lógica interna; los handlers del usuario se ejecutan además del comportamiento interno.
- **Consecuencias:** Regla `.cursor/rules/raw-api-hooks-and-getters.mdc`; tipado genérico en getters para que el consumidor pueda pasar y recibir props correctamente.

---

## ADR-003: RawImporterWorkflow como orquestador opcional

- **Fecha:** 2025-02-27
- **Estado:** aceptado
- **Contexto:** Parte de los usuarios quieren una experiencia “llave en mano” sin montar cada hook/vista a mano.
- **Decisión:** **RawImporterWorkflow** orquesta la máquina de estados (IDLE → MAPPING → PROCESSING → RESULT/ERROR) y compone hooks o wrappers por vista. Slots opcionales (renderIdle, renderMapping, renderProcess, renderResult, renderError) permiten reemplazar secciones completas. Se usa dentro de RawImporterRoot; el layout viene del contexto.
- **Consecuencias:** Uso mínimo: `<RawImporterRoot layout={layout}><RawImporterWorkflow /></RawImporterRoot>`. Quien quiera control total sigue usando solo RawImporterRoot + hooks.
