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

function FilePickerWithView() {
  const { view } = useStatusView();
  return (
    <div>
      <p className="mb-2">useRawFilePicker: apply getRootProps/getInputProps to your nodes.</p>
      <FilePickerDemo />
      <p className="mt-2 text-sm text-gray-600">View: {view}</p>
    </div>
  );
}

const meta: Meta<typeof FilePickerWithView> = {
  title: 'Raw/useRawFilePicker',
  component: FilePickerWithView,
  decorators: [
    (Story) => (
      <RawImporterRoot layout={layout} engine="auto">
        <Story />
      </RawImporterRoot>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof FilePickerWithView>;

export const Default: Story = {
  render: () => <FilePickerWithView />,
};
