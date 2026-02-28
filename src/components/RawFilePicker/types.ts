import type { ReactNode } from 'react';
import type { UseRawFilePickerReturn } from '../../hooks/useRawFilePicker';

export interface RawFilePickerProps {
  children: (state: UseRawFilePickerReturn) => ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
