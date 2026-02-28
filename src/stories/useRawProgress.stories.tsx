import type { Meta, StoryObj } from '@storybook/react';
import { ImporterProvider } from '@cristianm/react-import-sheet-headless';
import { useRawProgress } from '../hooks/useRawProgress';

function ProgressSlot() {
  const { progressRef } = useRawProgress();
  return (
    <div>
      <span data-testid="phase">{progressRef.current?.phase ?? '—'}</span>
      <span data-testid="percent">{progressRef.current?.globalPercent ?? 0}%</span>
    </div>
  );
}

const meta: Meta<typeof ProgressSlot> = {
  title: 'Raw Hooks/useRawProgress',
  component: ProgressSlot,
  decorators: [
    (Story) => (
      <ImporterProvider layout={null} engine="auto">
        <Story />
      </ImporterProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ProgressSlot>;

export const Default: Story = {};
export const WithOnProgress: Story = {
  render: function WithOnProgress() {
    function Inner() {
      const { progressRef } = useRawProgress({
        onProgress: (d) => console.log('Progress', d),
      });
      return (
        <div>
          <span>Phase: {progressRef.current?.phase ?? '—'}</span>
          <span> {progressRef.current?.globalPercent ?? 0}%</span>
        </div>
      );
    }
    return <Inner />;
  },
};
