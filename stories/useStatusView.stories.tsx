import type { Meta, StoryObj } from '@storybook/react';
import { ImporterProvider } from '@cristianm/react-import-sheet-headless';
import { RootConfigProvider } from '../src/hooks/useRawImporterRoot';
import { useRawImporterRoot } from '../src/hooks/useRawImporterRoot';
import { useStatusView } from '../src/hooks/useStatusView';

const layout = { name: 'Demo', version: '1', fields: { email: { name: 'Email' } } };

function StatusViewDisplay() {
  const { view, status, convertResult } = useStatusView();
  return (
    <div>
      <p>
        <strong>view:</strong> {view}
      </p>
      <p>
        <strong>status:</strong> {status}
      </p>
      <p>
        <strong>convertResult:</strong> {convertResult ? 'set (mapping)' : 'null'}
      </p>
    </div>
  );
}

function WithProvider() {
  const { providerProps, rootConfig } = useRawImporterRoot({ layout, engine: 'auto' });
  return (
    <ImporterProvider {...providerProps}>
      <RootConfigProvider rootConfig={rootConfig}>
        <StatusViewDisplay />
      </RootConfigProvider>
    </ImporterProvider>
  );
}

const meta: Meta<typeof WithProvider> = {
  title: 'Raw/useStatusView',
  component: WithProvider,
};

export default meta;

type Story = StoryObj<typeof WithProvider>;

export const Default: Story = {
  render: () => <WithProvider />,
};
