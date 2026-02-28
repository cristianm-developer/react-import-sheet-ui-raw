import type { Meta, StoryObj } from '@storybook/react';
import { ImporterProvider } from '@cristianm/react-import-sheet-headless';
import { useRawStatus } from '../src/hooks/useRawStatus';

function StatusSlot() {
  const { status, errorDetail } = useRawStatus();
  return (
    <div>
      <span data-testid="status">Status: {status}</span>
      {errorDetail && (
        <span data-testid="error-detail">
          {errorDetail.code} — {errorDetail.message ?? ''}
        </span>
      )}
    </div>
  );
}

const meta: Meta<typeof StatusSlot> = {
  title: 'Raw Hooks/useRawStatus',
  component: StatusSlot,
  decorators: [
    (Story) => (
      <ImporterProvider layout={null} engine="auto">
        <Story />
      </ImporterProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof StatusSlot>;

export const Default: Story = {};
export const ShowsErrorDetail: Story = {
  render: () => <StatusSlot />,
};
