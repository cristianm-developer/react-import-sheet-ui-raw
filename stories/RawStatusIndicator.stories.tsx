import type { Meta, StoryObj } from '@storybook/react';
import { ImporterProvider } from '@cristianm/react-import-sheet-headless';
import { RawStatusIndicator } from '../src/components/RawStatusIndicator';

const meta: Meta<typeof RawStatusIndicator> = {
  title: 'Raw/RawStatusIndicator',
  component: RawStatusIndicator,
  decorators: [
    (Story) => (
      <ImporterProvider layout={null} engine="auto">
        <Story />
      </ImporterProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof RawStatusIndicator>;

export const Default: Story = {
  args: {
    children: ({ status, errorDetail }) => (
      <div>
        <span data-testid="status">Status: {status}</span>
        {errorDetail && (
          <span data-testid="error-detail">
            {errorDetail.code} — {errorDetail.message ?? ''}
          </span>
        )}
      </div>
    ),
  },
};
