import type { ReactNode } from 'react';
import type { UseRawStatusReturn } from '../../hooks/useRawStatus';

export interface RawStatusIndicatorProps {
  children: (state: UseRawStatusReturn) => ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
