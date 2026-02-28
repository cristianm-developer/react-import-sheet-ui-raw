import { useCallback, useMemo } from 'react';
import { useSheetData } from '@cristianm/react-import-sheet-headless';
import type { GetRowPropsOptions, GetRowPropsResult } from '../../shared/types/data-phase.js';
import type { UseRawTableBodyReturn } from './types.js';

export function useRawTableBody(): UseRawTableBodyReturn {
  const { sheet } = useSheetData();
  const totalRowCount = sheet?.rows?.length ?? 0;

  const isPlaceholder = useCallback(
    (index: number) => index < 0 || index >= totalRowCount,
    [totalRowCount]
  );

  const getRowProps = useCallback(
    (options: GetRowPropsOptions): GetRowPropsResult => {
      const { index, style } = options;
      const row = sheet?.rows?.[index];
      const hasErrors = (row?.errors?.length ?? 0) > 0;
      const placeholder = isPlaceholder(index);

      return {
        key: index,
        'data-row-index': index,
        'data-has-errors': hasErrors || undefined,
        'data-placeholder': placeholder || undefined,
        style,
        role: 'row',
        'aria-rowindex': index + 1,
      };
    },
    [sheet?.rows, isPlaceholder]
  );

  return useMemo(
    (): UseRawTableBodyReturn => ({
      totalRowCount,
      getRowProps,
      isPlaceholder,
    }),
    [totalRowCount, getRowProps, isPlaceholder]
  );
}
