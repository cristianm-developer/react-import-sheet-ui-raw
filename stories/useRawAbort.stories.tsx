import type { Meta, StoryObj } from '@storybook/react';
import { ImporterProvider } from '@cristianm/react-import-sheet-headless';
import { useRawAbort } from '../src/hooks/useRawAbort';

function AbortSlot() {
  const { abort } = useRawAbort();
  return (
    <button type="button" onClick={abort} aria-label="Cancel import">
      Cancel
    </button>
  );
}

const meta: Meta<typeof AbortSlot> = {
  title: 'Raw Hooks/useRawAbort',
  component: AbortSlot,
  decorators: [
    (Story) => (
      <ImporterProvider layout={null} engine="auto">
        <Story />
      </ImporterProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof AbortSlot>;

export const Default: Story = {};
