import type { Meta, StoryObj } from '@storybook/react';
import { ImporterProvider } from '@cristianm/react-import-sheet-headless';
import { RawAbortController } from '../components/RawAbortController';

const meta: Meta<typeof RawAbortController> = {
  title: 'Raw/RawAbortController',
  component: RawAbortController,
  decorators: [
    (Story) => (
      <ImporterProvider layout={null} engine="auto">
        <Story />
      </ImporterProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof RawAbortController>;

export const Default: Story = {
  args: {
    children: 'Cancelar',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Cancelar',
    disabled: true,
  },
};
