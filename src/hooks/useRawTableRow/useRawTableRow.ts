import { useCallback, useMemo } from 'react';
import type { ValidatedRow } from '@cristianm/react-import-sheet-headless';
import { useSheetData } from '@cristianm/react-import-sheet-headless';
import { useRawTableBody } from '../useRawTableBody/index.js';
import type { UseRawTableRowOptions, UseRawTableRowReturn } from './types.js';

export function useRawTableRow(options: UseRawTableRowOptions): UseRawTableRowReturn {
  const { index, style } = options;
  const { sheet } = useSheetData();
  const { getRowProps: bodyGetRowProps, isPlaceholder } = useRawTableBody();

  const row: ValidatedRow | undefined | null = useMemo(() => {
    if (options.row !== undefined) return options.row;
    if (!sheet?.rows) return null;
    if (isPlaceholder(index)) return null;
    return sheet.rows[index] ?? null;
  }, [options.row, sheet?.rows, index, isPlaceholder]);

  const getRowProps = useCallback(
    (merge?: { className?: string; style?: React.CSSProperties }) => {
      const base = bodyGetRowProps({ index, style });
      return {
        ...base,
        ...(merge?.className != null && { className: merge.className }),
        ...(merge?.style != null && { style: { ...base.style, ...merge.style } }),
      };
    },
    [bodyGetRowProps, index, style]
  );

  const rowErrors = row?.errors ?? [];

  return useMemo(
    (): UseRawTableRowReturn => ({
      getRowProps,
      row: row ?? undefined,
      rowErrors,
    }),
    [getRowProps, row, rowErrors]
  );
}
