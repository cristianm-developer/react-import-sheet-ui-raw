import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { RawImporterRoot } from '../src/components/RawImporterRoot';
import { RawImporterWorkflow } from '../src/components/RawImporterWorkflow';
import { RawErrorBoundary } from '../src/components/RawErrorBoundary';

/**
 * Layout de ejemplo con varias columnas para ver mapeo, tabla de resultado,
 * paginación y filtros con todas las piezas visibles.
 */
const fullLayout = {
  name: 'FullDemo',
  version: '1',
  fields: {
    email: { name: 'Email' },
    name: { name: 'Name' },
    phone: { name: 'Phone' },
    date: { name: 'Date' },
  },
};

/** CSV que respeta el layout: columnas Email, Name, Phone, Date; filas válidas y algunas inválidas para validación. */
const CSV_RESPECTS_LAYOUT = `Email,Name,Phone,Date
alice@example.com,Alice Smith,+1 555 111 0000,2024-01-15
bob@test.org,Bob Jones,+1 555 222 0000,2024-02-20
invalid-email,Carol White,+1 555 333 0000,2024-03-10
diana@demo.com,Diana Brown,,2024-04-05
eve@sample.net,Eve Davis,+1 555 555 0000,bad-date
`;

/** CSV que no respeta el layout parcialmente: columnas en otro orden (Name, Email, Phone, Date) y una columna extra "Notes". */
const CSV_PARTIAL_MISMATCH = `Name,Email,Phone,Date,Notes
Alice Smith,alice@example.com,+1 555 111 0000,2024-01-15,OK
Bob Jones,bob@test.org,+1 555 222 0000,2024-02-20,Review
`;

/** CSV que no respeta el layout en absoluto: cabeceras genéricas (Col1, Col2, Col3, Col4) sin correspondencia directa. */
const CSV_TOTAL_MISMATCH = `Col1,Col2,Col3,Col4
a1,b1,c1,d1
a2,b2,c2,d2
`;

/** CSV con muchos elementos: mismo layout pero >25 filas para ejercitar paginación (pageSize 25). */
const CSV_MANY_ROWS = `Email,Name,Phone,Date
${Array.from({ length: 35 }, (_, i) => `user${i + 1}@example.com,User ${i + 1},+1 555 ${String(i + 1).padStart(3, '0')} 0000,2024-${String((i % 12) + 1).padStart(2, '0')}-15`).join('\n')}
`;

/** CSV con pocos elementos: no requiere paginación (3 filas). */
const CSV_FEW_ROWS = `Email,Name,Phone,Date
one@example.com,One User,+1 555 001 0000,2024-01-01
two@example.com,Two User,+1 555 002 0000,2024-02-02
three@example.com,Three User,+1 555 003 0000,2024-03-03
`;

/** CSV sin filas de datos: solo cabecera. */
const CSV_EMPTY_ROWS = `Email,Name,Phone,Date
`;

/** CSV completamente vacío. */
const CSV_FULLY_EMPTY = '';

const EXAMPLES = [
  {
    id: 'respects-layout',
    content: CSV_RESPECTS_LAYOUT,
    filename: 'respects-layout.csv',
    desc: 'Columnas Email, Name, Phone, Date; filas válidas e inválidas.',
  },
  {
    id: 'partial-mismatch',
    content: CSV_PARTIAL_MISMATCH,
    filename: 'partial-mismatch.csv',
    desc: 'Orden distinto (Name, Email, …) y columna extra Notes.',
  },
  {
    id: 'total-mismatch',
    content: CSV_TOTAL_MISMATCH,
    filename: 'total-mismatch.csv',
    desc: 'Cabeceras Col1, Col2, Col3, Col4.',
  },
  {
    id: 'many-rows',
    content: CSV_MANY_ROWS,
    filename: 'many-rows.csv',
    desc: '35 filas; pageSize 25 → varias páginas.',
  },
  {
    id: 'few-rows',
    content: CSV_FEW_ROWS,
    filename: 'few-rows.csv',
    desc: '3 filas; una sola página.',
  },
  {
    id: 'empty-rows',
    content: CSV_EMPTY_ROWS,
    filename: 'empty-rows.csv',
    desc: 'Solo header Email, Name, Phone, Date.',
  },
  {
    id: 'fully-empty',
    content: CSV_FULLY_EMPTY,
    filename: 'fully-empty.csv',
    desc: 'Archivo vacío.',
  },
] as const;

function downloadExampleCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function FullImplementationDemo() {
  return (
    <RawErrorBoundary fallback={<div data-ris-ui="full-impl-error">Something went wrong.</div>}>
      <div data-ris-ui="full-impl-wrapper">
        <div style={{ marginBottom: '0.75rem', fontSize: '0.875rem' }}>
          <p style={{ marginBottom: '0.5rem' }}>
            Descarga un CSV de ejemplo y súbelo (drag & drop o selector). Layout esperado: Email,
            Name, Phone, Date.
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', listStyle: 'disc' }}>
            {EXAMPLES.map((ex) => (
              <li key={ex.id} style={{ marginBottom: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => downloadExampleCsv(ex.content, ex.filename)}
                  style={{
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    background: 'none',
                    border: 'none',
                    font: 'inherit',
                    color: 'inherit',
                    padding: 0,
                  }}
                >
                  {ex.filename}
                </button>
                {' — '}
                <span style={{ color: 'var(--sb-color-text-3, #666)' }}>{ex.desc}</span>
              </li>
            ))}
          </ul>
        </div>
        <RawImporterRoot layout={fullLayout} engine="auto">
          <RawImporterWorkflow />
        </RawImporterRoot>
      </div>
    </RawErrorBoundary>
  );
}

const meta: Meta<typeof FullImplementationDemo> = {
  title: 'Raw/FullImplementation',
  component: FullImplementationDemo,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        story:
          'Implementación total del flujo: RawImporterRoot + RawImporterWorkflow con todas las piezas por defecto. Recorre IDLE (file picker) → MAPPING (tabla de mapeo + sugerencias + Import) → PROCESSING (progress, status, abort) → RESULT (toolbar filtro/export, grid editable, paginación, persistencia). Incluye RawErrorBoundary para errores fatales. En Storybook se usa un mock del headless para que el flujo funcione al seleccionar archivo. Se ofrecen varios CSVs de ejemplo para probar distintos comportamientos: layout correcto, desajuste parcial o total, muchos datos (paginación), pocos datos, sin filas y archivo vacío.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof FullImplementationDemo>;

/**
 * Flujo completo: sube un CSV/Excel, mapea columnas a los campos del layout,
 * ejecuta importación, revisa y edita la tabla, exporta o recupera sesión.
 */
export const Default: Story = {
  render: () => <FullImplementationDemo />,
};
