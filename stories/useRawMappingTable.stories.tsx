import type { Meta, StoryObj } from '@storybook/react';
import { RawImporterRoot } from '../src/components/RawImporterRoot';
import { useRawMappingTable } from '../src/hooks/useRawMappingTable';
import { useRawMappingRow } from '../src/hooks/useRawMappingRow';
import { useStatusView } from '../src/hooks/useStatusView';

const layout = {
  name: 'Demo',
  version: '1',
  fields: {
    email: { name: 'Email' },
    name: { name: 'Name' },
  },
};

function MappingTableDemo() {
  const { rows, hasMappingData } = useRawMappingTable();
  const { view } = useStatusView();
  if (view !== 'mapping' || !hasMappingData) {
    return <p>No mapping data (upload a file and run convert to see mapping rows).</p>;
  }
  return (
    <table className="border-collapse border">
      <thead>
        <tr>
          <th className="border p-2">File column</th>
          <th className="border p-2">Map to field</th>
          <th className="border p-2">Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((rowContext) => (
          <MappingRow key={rowContext.columnIndex} rowContext={rowContext} />
        ))}
      </tbody>
    </table>
  );
}

function MappingRow({
  rowContext,
}: {
  rowContext: { headerOriginal: string; columnIndex: number };
}) {
  const { headerOriginal, options, value, onChange, mappingStatus } = useRawMappingRow({
    rowContext,
  });
  return (
    <tr>
      <td className="border p-2">{headerOriginal}</td>
      <td className="border p-2">
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || '')}
          className="border rounded px-2 py-1"
        >
          <option value="">— Select —</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </td>
      <td className="border p-2">{mappingStatus}</td>
    </tr>
  );
}

function WithRoot() {
  return (
    <RawImporterRoot layout={layout} engine="auto">
      <div>
        <p className="mb-2">
          useRawMappingTable + useRawMappingRow (inside ImporterProvider with mapping data).
        </p>
        <MappingTableDemo />
        <p className="mt-2 text-sm text-gray-600">View: {useStatusView().view}</p>
      </div>
    </RawImporterRoot>
  );
}

const meta: Meta<typeof WithRoot> = {
  title: 'Raw/useRawMappingTable & useRawMappingRow',
  component: WithRoot,
  decorators: [
    (Story) => (
      <RawImporterRoot layout={layout} engine="auto">
        <Story />
      </RawImporterRoot>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof WithRoot>;

export const Default: Story = {
  render: () => <WithRoot />,
};
