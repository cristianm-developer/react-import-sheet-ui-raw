import { useContext, useCallback, useMemo } from 'react';
import { useConvert } from '@cristianm/react-import-sheet-headless';
import { LayoutContext } from '../useRawImporterRoot/RootConfigContext.jsx';
import { getLayoutFieldOptions } from '../../shared/types/input-phase.js';
import type { MappingStatus } from '../../shared/types/input-phase.js';
import type { UseRawMappingRowOptions, UseRawMappingRowReturn } from './types.js';

export function useRawMappingRow(options: UseRawMappingRowOptions): UseRawMappingRowReturn {
  const { rowContext } = options;
  const { headerOriginal, columnIndex } = rowContext;
  const layout = useContext(LayoutContext);
  const { convertResult } = useConvert();

  const optionsList = useMemo(() => getLayoutFieldOptions(layout), [layout]);

  const value = useMemo(() => {
    if (!convertResult?.headerToFieldMap) return null;
    return convertResult.headerToFieldMap[headerOriginal] ?? null;
  }, [convertResult, headerOriginal]);

  const onChange = useCallback(
    (fieldId: string) => {
      convertResult?.renameColumn(headerOriginal, fieldId);
    },
    [convertResult, headerOriginal]
  );

  const mappingStatus: MappingStatus = useMemo(() => {
    if (value == null || value === '') return 'unmapped';
    const mismatches = convertResult?.mismatches ?? [];
    const stillMismatch = mismatches.some((m) => m.expected === value);
    return stillMismatch ? 'invalid' : 'valid';
  }, [value, convertResult?.mismatches]);

  return useMemo(
    () => ({
      headerOriginal,
      columnIndex,
      options: optionsList,
      value,
      onChange,
      mappingStatus,
    }),
    [headerOriginal, columnIndex, optionsList, value, onChange, mappingStatus]
  );
}
