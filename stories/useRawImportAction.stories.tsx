import type { Meta, StoryObj } from '@storybook/react';
import { RawImporterRoot } from '../src/components/RawImporterRoot';
import { useRawImportAction } from '../src/hooks/useRawImportAction';
import { useStatusView } from '../src/hooks/useStatusView';

const layout = {
  name: 'Demo',
  version: '1',
  fields: { email: { name: 'Email' }, name: { name: 'Name' } },
};

function ImportButtonDemo() {
  const { disabled, runImport } = useRawImportAction();
  const { view } = useStatusView();
  return (
    <div>
      <p className="mb-2">
        View: {view}. Use mapping screen then click to apply mapping and run pipeline.
      </p>
      <button
        type="button"
        onClick={runImport}
        disabled={disabled}
        className="rounded bg-blue-600 text-white px-4 py-2 disabled:opacity-50"
      >
        {disabled ? 'Import (disabled)' : 'Run import'}
      </button>
    </div>
  );
}

function WithRoot() {
  return (
    <RawImporterRoot layout={layout} engine="auto">
      <ImportButtonDemo />
    </RawImporterRoot>
  );
}

const meta: Meta<typeof WithRoot> = {
  title: 'Raw/useRawImportAction',
  component: WithRoot,
};

export default meta;

type Story = StoryObj<typeof WithRoot>;

export const Default: Story = {
  render: () => <WithRoot />,
};
