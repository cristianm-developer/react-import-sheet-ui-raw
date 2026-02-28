import type { ReactNode } from 'react';
import type { RawMappingRowContext } from '../../shared/types';
import type { UseRawMappingRowReturn } from '../../hooks/useRawMappingRow';

export interface RawMappingRowProps {
  rowContext: RawMappingRowContext;
  children: (state: UseRawMappingRowReturn) => ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
