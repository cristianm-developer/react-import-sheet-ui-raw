import type { Meta, StoryObj } from '@storybook/react';
import { ImporterProvider } from '@cristianm/react-import-sheet-headless';
import { RawProgressMonitor } from '../components/RawProgressMonitor';

const meta: Meta<typeof RawProgressMonitor> = {
  title: 'Raw/RawProgressMonitor',
  component: RawProgressMonitor,
  decorators: [
    (Story) => (
      <ImporterProvider layout={null} engine="auto">
        <Story />
      </ImporterProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof RawProgressMonitor>;

export const Default: Story = {
  args: {
    children: ({ phase, aborted }) => (
      <div>
        <span data-testid="phase">{phase || '—'}</span>
        {aborted && <span data-testid="aborted">Aborted</span>}
      </div>
    ),
  },
};

export const WithClassName: Story = {
  args: {
    className: 'custom-progress',
    children: ({ phase }) => <p>Phase: {phase || 'idle'}</p>,
  },
};
