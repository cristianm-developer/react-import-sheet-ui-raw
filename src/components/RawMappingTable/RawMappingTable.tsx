import { forwardRef } from 'react';
import { useRawMappingTable } from '../../hooks/useRawMappingTable';
import type { RawMappingTableProps } from './types';

export const RawMappingTable = forwardRef<HTMLDivElement, RawMappingTableProps>(
  function RawMappingTable({ children, className, style }, ref) {
    const state = useRawMappingTable();
    return (
      <div ref={ref} className={className} style={style} data-ris-ui="raw-mapping-table">
        {children(state)}
      </div>
    );
  }
);
