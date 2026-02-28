import type { ReactNode } from 'react';
import type { UseRawImportActionReturn } from '../../hooks/useRawImportAction';

export interface RawImportActionProps {
  children: (state: UseRawImportActionReturn) => ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
