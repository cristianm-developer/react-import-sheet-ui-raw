import type { ReactNode } from 'react';
import type { UseRawMappingTableReturn } from '../../hooks/useRawMappingTable';

export interface RawMappingTableProps {
  children: (state: UseRawMappingTableReturn) => ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
