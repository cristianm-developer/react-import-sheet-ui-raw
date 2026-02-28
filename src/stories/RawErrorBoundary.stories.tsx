import type { Meta, StoryObj } from '@storybook/react';
import { RawErrorBoundary } from '../components/RawErrorBoundary';

function Thrower() {
  throw new Error('Simulated error');
}

const meta: Meta<typeof RawErrorBoundary> = {
  title: 'Raw/RawErrorBoundary',
  component: RawErrorBoundary,
};

export default meta;

type Story = StoryObj<typeof RawErrorBoundary>;

export const Default: Story = {
  args: {
    fallback: <div>Something went wrong. Please try again.</div>,
    children: <span>Normal content</span>,
  },
};

export const WithError: Story = {
  args: {
    fallback: <div>Caught error. Check console.</div>,
    children: <Thrower />,
  },
};

export const FunctionFallback: Story = {
  args: {
    fallback: (error) => (
      <div>
        <strong>Error:</strong> {error.message}
      </div>
    ),
    children: <Thrower />,
  },
};
