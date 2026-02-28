import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ImporterProvider } from '@cristianm/react-import-sheet-headless';
import { RawProgressDisplay } from '../components/RawProgressDisplay';

const meta: Meta<typeof RawProgressDisplay> = {
  title: 'Raw/RawProgressDisplay',
  component: RawProgressDisplay,
  decorators: [
    (Story) => (
      <ImporterProvider layout={null} engine="auto">
        <Story />
      </ImporterProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof RawProgressDisplay>;

export const Default: Story = {
  args: {
    children: ({ progressRef }) => (
      <div>
        <span data-testid="phase">{progressRef.current?.phase ?? '—'}</span>
        <span data-testid="percent">{progressRef.current?.globalPercent ?? 0}%</span>
      </div>
    ),
  },
};

export const WithOnProgress: Story = {
  render: function WithOnProgress() {
    const [percent, setPercent] = useState(0);
    const [phase, setPhase] = useState<string>('');
    return (
      <RawProgressDisplay
        onProgress={(d) => {
          setPercent(d.globalPercent ?? 0);
          setPhase(d.phase ?? '');
        }}
      >
        {() => (
          <div>
            <p>Phase: {phase || '—'}</p>
            <p role="progressbar" aria-valuenow={percent}>
              {percent}%
            </p>
          </div>
        )}
      </RawProgressDisplay>
    );
  },
};

export const WithClassName: Story = {
  args: {
    className: 'custom-progress',
    children: ({ progressRef }) => <p>Phase: {progressRef.current?.phase ?? 'idle'}</p>,
  },
};
