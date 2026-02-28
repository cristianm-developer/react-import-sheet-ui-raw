import type { Meta, StoryObj } from '@storybook/react';
import { ImporterProvider } from '@cristianm/react-import-sheet-headless';
import {
  LayoutContext,
  RootConfigProvider,
  useRawTableHead,
  useRawTableBody,
  RawDataTableProvider,
  useRawErrorBadge,
} from '../index';

const layout = {
  name: 'Demo',
  version: 1,
  fields: {
    name: { name: 'Name' },
    email: { name: 'Email' },
  },
};

function TableHeadDemo() {
  const { headers } = useRawTableHead();
  return (
    <table>
      <thead>
        <tr>
          {headers.map((h) => (
            <th key={h.id}>{h.label}</th>
          ))}
        </tr>
      </thead>
    </table>
  );
}

function TableBodyDemo() {
  const { totalRowCount, getRowProps, isPlaceholder } = useRawTableBody();
  return (
    <table>
      <tbody>
        {totalRowCount === 0 ? (
          <tr>
            <td colSpan={2}>No data (import a file and run to see rows)</td>
          </tr>
        ) : (
          Array.from({ length: Math.min(5, totalRowCount) }, (_, i) => (
            <tr key={i} {...getRowProps({ index: i })}>
              <td>{isPlaceholder(i) ? '…' : `Row ${i}`}</td>
              <td>{isPlaceholder(i) ? '' : '—'}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

function ErrorBadgeDemo() {
  const error = {
    code: 'VALIDATION_ERROR',
    message: 'Invalid value',
    params: { field: 'email' },
  };
  const { message, error: err } = useRawErrorBadge({
    error,
    translateError: (code, params) => `${code} (${JSON.stringify(params ?? {})})`,
  });
  return (
    <div>
      <strong>Error badge (with translateError):</strong> {message}
      <br />
      <strong>Raw error code:</strong> {err?.code}
    </div>
  );
}

function ErrorBadgeNoTranslate() {
  const { message } = useRawErrorBadge({
    error: { code: 'REQUIRED', message: 'This field is required' },
  });
  return <span role="alert">{message}</span>;
}

const meta: Meta = {
  title: 'Raw Hooks/Data Phase (Step 5)',
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <ImporterProvider layout={layout} engine="auto">
        <LayoutContext.Provider value={layout}>
          <RootConfigProvider rootConfig={{ fuzzyMatch: true, editingEnabled: true, stages: {} }}>
            <Story />
          </RootConfigProvider>
        </LayoutContext.Provider>
      </ImporterProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj;

export const TableHead: Story = {
  render: () => <TableHeadDemo />,
};

export const TableBodyEmpty: Story = {
  render: () => (
    <RawDataTableProvider>
      <TableBodyDemo />
    </RawDataTableProvider>
  ),
};

export const ErrorBadgeWithTranslate: Story = {
  render: () => <ErrorBadgeDemo />,
};

export const ErrorBadgeMessageOnly: Story = {
  render: () => <ErrorBadgeNoTranslate />,
};
