import type { Meta, StoryObj } from '@storybook/react';
import { ImporterProvider } from '@cristianm/react-import-sheet-headless';
import { useRawImporterRoot, RootConfigProvider } from '../src/hooks/useRawImporterRoot';
import { useStatusView } from '../src/hooks/useStatusView';

const layout = {
  name: 'Demo',
  version: '1',
  fields: { email: { name: 'Email' }, name: { name: 'Name' } },
};

function DemoTree() {
  const { view } = useStatusView();
  return (
    <div>
      <p>
        useStatusView view: <strong>{view}</strong>
      </p>
    </div>
  );
}

function WithHook() {
  const { providerProps, rootConfig } = useRawImporterRoot({
    layout,
    engine: 'auto',
    fuzzyMatch: true,
    editingEnabled: true,
  });
  return (
    <ImporterProvider {...providerProps}>
      <RootConfigProvider rootConfig={rootConfig}>
        <DemoTree />
      </RootConfigProvider>
    </ImporterProvider>
  );
}

const meta: Meta<typeof WithHook> = {
  title: 'Raw/useRawImporterRoot',
  component: WithHook,
};

export default meta;

type Story = StoryObj<typeof WithHook>;

export const Default: Story = {
  render: () => <WithHook />,
};

function WithStagesDisabledDemo() {
  const { providerProps, rootConfig } = useRawImporterRoot({
    layout,
    engine: 'auto',
    stages: { mapping: false, process: false },
  });
  return (
    <ImporterProvider {...providerProps}>
      <RootConfigProvider rootConfig={rootConfig}>
        <DemoTree />
      </RootConfigProvider>
    </ImporterProvider>
  );
}

export const WithStagesDisabled: Story = {
  render: () => <WithStagesDisabledDemo />,
};
