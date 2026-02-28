import type { Meta, StoryObj } from '@storybook/react';
import { RawImporterRoot } from '../src/components/RawImporterRoot';
import { RawImporterWorkflow } from '../src/components/RawImporterWorkflow';

const layout = {
  name: 'Demo',
  version: '1',
  fields: { email: { name: 'Email' }, name: { name: 'Name' } },
};

const meta: Meta<typeof RawImporterWorkflow> = {
  title: 'Raw/RawImporterWorkflow',
  component: RawImporterWorkflow,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <RawImporterRoot layout={layout} engine="auto">
        <Story />
      </RawImporterRoot>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof RawImporterWorkflow>;

export const Default: Story = {
  render: () => <RawImporterWorkflow />,
};

export const WithCustomSlots: Story = {
  render: () => (
    <RawImporterWorkflow
      renderIdle={() => (
        <div data-ris-ui="custom-idle">
          <p>Custom idle: drop or select a file</p>
        </div>
      )}
      renderMapping={() => (
        <div data-ris-ui="custom-mapping">
          <p>Custom mapping section</p>
        </div>
      )}
      renderProcess={() => (
        <div data-ris-ui="custom-process">
          <p>Custom process / progress</p>
        </div>
      )}
      renderResult={() => (
        <div data-ris-ui="custom-result">
          <p>Custom result grid and toolbar</p>
        </div>
      )}
      renderError={() => (
        <div data-ris-ui="custom-error">
          <p>Custom error: retry or go back</p>
        </div>
      )}
    />
  ),
};
