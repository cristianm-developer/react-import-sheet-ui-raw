import type { Meta, StoryObj } from '@storybook/react';
import { ImporterProvider } from '@cristianm/react-import-sheet-headless';
import {
  RawViewPhaseProvider,
  useRawPagination,
  useRawFilterToggle,
  useRawExport,
  useRawPersistence,
} from '../index';

const layout = {
  name: 'Demo',
  version: 1,
  fields: {
    name: { name: 'Name' },
    email: { name: 'Email' },
  },
};

function PaginationDemo() {
  const { page, pageSize, totalRows, setPage, setPageSize } = useRawPagination();
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  return (
    <div data-ris-ui="raw-pagination" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
      >
        Anterior
      </button>
      <span aria-live="polite">
        Página {page} de {totalPages} ({totalRows} filas)
      </span>
      <button
        type="button"
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => setPage(page + 1)}
      >
        Siguiente
      </button>
      <select
        aria-label="Page size"
        value={pageSize}
        onChange={(e) => setPageSize(Number(e.target.value))}
      >
        {[10, 25, 50].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </div>
  );
}

function FilterToggleDemo() {
  const { filterMode, setFilterMode } = useRawFilterToggle();
  return (
    <div
      role="group"
      aria-label="Filter rows"
      data-ris-ui="raw-filter-toggle"
      style={{ display: 'flex', gap: 8 }}
    >
      <button
        type="button"
        aria-pressed={filterMode === 'all'}
        onClick={() => setFilterMode('all')}
      >
        Ver todos
      </button>
      <button
        type="button"
        aria-pressed={filterMode === 'errors-only'}
        onClick={() => setFilterMode('errors-only')}
      >
        Solo errores
      </button>
    </div>
  );
}

function ExportDemo() {
  const { downloadCSV, downloadJSON } = useRawExport();
  return (
    <div data-ris-ui="raw-export-button" style={{ display: 'flex', gap: 8 }}>
      <button type="button" onClick={() => downloadCSV({ filename: 'export' })}>
        Descargar CSV
      </button>
      <button type="button" onClick={() => downloadJSON({ filename: 'export' })}>
        Descargar JSON
      </button>
    </div>
  );
}

function PersistenceDemo() {
  const { hasRecoverableSession, recoverSession, clearSession } = useRawPersistence();
  if (!hasRecoverableSession) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      data-ris-ui="raw-persistence-banner"
      style={{ padding: 8, background: '#f0f0f0', marginBottom: 8 }}
    >
      <span>Hay una sesión guardada.</span>
      <button type="button" onClick={() => recoverSession()}>
        Recuperar
      </button>
      <button type="button" onClick={() => clearSession()}>
        Limpiar
      </button>
    </div>
  );
}

function ViewPhaseToolbar() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
      <FilterToggleDemo />
      <ExportDemo />
      <PaginationDemo />
    </div>
  );
}

function ViewPhaseAll() {
  return (
    <div>
      <PersistenceDemo />
      <ViewPhaseToolbar />
      <p style={{ marginTop: 16, color: '#666' }}>
        Estos hooks requieren RawViewPhaseProvider y estado success con datos. Tras importar un
        archivo y procesarlo, aquí aparecerán paginación, filtro, exportación y banner de
        persistencia.
      </p>
    </div>
  );
}

const meta: Meta<typeof ViewPhaseAll> = {
  title: 'Raw Hooks/View Phase',
  component: ViewPhaseAll,
  decorators: [
    (Story) => (
      <ImporterProvider layout={layout} engine="auto">
        <RawViewPhaseProvider defaultPageSize={25}>
          <Story />
        </RawViewPhaseProvider>
      </ImporterProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ViewPhaseAll>;

export const AllHooks: Story = {
  name: 'useRawPagination, useRawFilterToggle, useRawExport, useRawPersistence',
};

export const PaginationOnly: Story = {
  render: () => (
    <ImporterProvider layout={layout} engine="auto">
      <RawViewPhaseProvider>
        <PaginationDemo />
      </RawViewPhaseProvider>
    </ImporterProvider>
  ),
};

export const FilterToggleOnly: Story = {
  render: () => (
    <ImporterProvider layout={layout} engine="auto">
      <RawViewPhaseProvider>
        <FilterToggleDemo />
      </RawViewPhaseProvider>
    </ImporterProvider>
  ),
};

export const ExportOnly: Story = {
  render: () => (
    <ImporterProvider layout={layout} engine="auto">
      <RawViewPhaseProvider>
        <ExportDemo />
      </RawViewPhaseProvider>
    </ImporterProvider>
  ),
};

export const PersistenceOnly: Story = {
  render: () => (
    <ImporterProvider layout={layout} engine="auto">
      <RawViewPhaseProvider>
        <PersistenceDemo />
      </RawViewPhaseProvider>
    </ImporterProvider>
  ),
};
