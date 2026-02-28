import type { Meta, StoryObj } from '@storybook/react';
import { ImporterProvider } from '@cristianm/react-import-sheet-headless';
import { RawAbortButton } from '../components/RawAbortButton';

const meta: Meta<typeof RawAbortButton> = {
  title: 'Raw/RawAbortButton',
  component: RawAbortButton,
  decorators: [
    (Story) => (
      <ImporterProvider layout={null} engine="auto">
        <Story />
      </ImporterProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof RawAbortButton>;

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

export const WithAriaLabel: Story = {
  args: {
    children: 'Stop import',
    'aria-label': 'Stop import',
  },
};
