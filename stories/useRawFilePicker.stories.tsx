import type { Meta, StoryObj } from '@storybook/react';
import { RawImporterRoot } from '../src/components/RawImporterRoot';
import { useRawFilePicker } from '../src/hooks/useRawFilePicker';
import { useStatusView } from '../src/hooks/useStatusView';

const layout = {
  name: 'Demo',
  version: '1',
  fields: { email: { name: 'Email' }, name: { name: 'Name' } },
};

function FilePickerDemo() {
  const { isDragging, getRootProps, getInputProps } = useRawFilePicker({ accept: '.xlsx,.csv' });
  const root = getRootProps({
    className: 'border-2 border-dashed rounded p-8 text-center cursor-pointer',
    style: isDragging ? { borderColor: 'blue', background: '#f0f8ff' } : undefined,
  });
  const input = getInputProps();
  return (
    <div {...root}>
      <input {...input} />
      {isDragging ? (
        <p>Drop the file here</p>
      ) : (
        <p>Drag and drop a file here, or click to select</p>
      )}
    </div>
  );
}

function WithRawImporterRoot() {
  return (
    <RawImporterRoot layout={layout} engine="auto">
      <div>
        <p className="mb-2">useRawFilePicker: apply getRootProps/getInputProps to your nodes.</p>
        <FilePickerDemo />
        <p className="mt-2 text-sm text-gray-600">View: {useStatusView().view}</p>
      </div>
    </RawImporterRoot>
  );
}

const meta: Meta<typeof WithRawImporterRoot> = {
  title: 'Raw/useRawFilePicker',
  component: WithRawImporterRoot,
};

export default meta;

type Story = StoryObj<typeof WithRawImporterRoot>;

export const Default: Story = {
  render: () => <WithRawImporterRoot />,
};
