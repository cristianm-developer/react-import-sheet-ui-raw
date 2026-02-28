import { useMemo } from 'react';
import { useConvert } from '@cristianm/react-import-sheet-headless';
import type { RawMappingRowContext } from '../../shared/types/input-phase.js';
import type { UseRawMappingTableReturn } from './types.js';

export function useRawMappingTable(): UseRawMappingTableReturn {
  const { convertResult } = useConvert();

  const rows: RawMappingRowContext[] = useMemo(() => {
    if (!convertResult?.headersFound?.length) return [];
    return convertResult.headersFound.map((headerOriginal, columnIndex) => ({
      headerOriginal,
      columnIndex,
    }));
  }, [convertResult]);

  const hasMappingData = convertResult != null && rows.length > 0;

  return useMemo(
    () => ({
      rows,
      hasMappingData,
    }),
    [rows, hasMappingData]
  );
}
