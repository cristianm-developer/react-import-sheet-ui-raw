import { useContext, useCallback, useMemo, useState } from 'react';
import { useSheetData } from '@cristianm/react-import-sheet-headless';
import { LayoutContext, RootConfigContext } from '../useRawImporterRoot/RootConfigContext.jsx';
import { getLayoutFieldOptions } from '../../shared/types/input-phase.js';
import type { TableHeader } from '../../shared/types/data-phase.js';
import type { DataTableContextValue, UseRawDataTableReturn } from './types.js';

export interface UseRawDataTableOptions {
  /** Called when focus would move to a row index (e.g. for virtualiser scrollToIndex). */
  onNavigateToIndex?: (index: number) => void;
}

export function useRawDataTable(options: UseRawDataTableOptions = {}): UseRawDataTableReturn {
  const { onNavigateToIndex } = options;
  const layout = useContext(LayoutContext);
  const rootConfig = useContext(RootConfigContext);
  const { sheet } = useSheetData();

  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);
  const [focusedCellKey, setFocusedCellKey] = useState<string | null>(null);
  const [pendingCell, setPendingCell] = useState<{ rowIndex: number; fieldId: string } | null>(
    null
  );

  const headerIds = useMemo(() => {
    if (!layout?.fields) return [];
    return Object.keys(layout.fields);
  }, [layout?.fields]);

  const totalRowCount = sheet?.rows?.length ?? 0;
  const editingEnabled = rootConfig.editingEnabled ?? true;

  const headers: TableHeader[] = useMemo(
    () => getLayoutFieldOptions(layout).map((o) => ({ id: o.id, label: o.label })),
    [layout]
  );

  const setFocused = useCallback((rowIndex: number | null, cellKey: string | null) => {
    setFocusedRowIndex(rowIndex);
    setFocusedCellKey(cellKey);
  }, []);

  const getKeyDownHandler = useCallback(
    (rowIndex: number, cellKey: string) => {
      return (e: React.KeyboardEvent) => {
        const key = e.key;
        if (
          key !== 'ArrowLeft' &&
          key !== 'ArrowRight' &&
          key !== 'ArrowUp' &&
          key !== 'ArrowDown'
        ) {
          return;
        }
        e.preventDefault();
        const colIdx = headerIds.indexOf(cellKey);
        if (colIdx === -1) return;

        if (key === 'ArrowLeft' && colIdx > 0) {
          setFocused(rowIndex, headerIds[colIdx - 1] ?? null);
          return;
        }
        if (key === 'ArrowRight' && colIdx < headerIds.length - 1) {
          setFocused(rowIndex, headerIds[colIdx + 1] ?? null);
          return;
        }
        if (key === 'ArrowUp' && rowIndex > 0) {
          const nextIndex = rowIndex - 1;
          setFocused(nextIndex, cellKey);
          onNavigateToIndex?.(nextIndex);
          return;
        }
        if (key === 'ArrowDown' && rowIndex < totalRowCount - 1) {
          const nextIndex = rowIndex + 1;
          setFocused(nextIndex, cellKey);
          onNavigateToIndex?.(nextIndex);
          return;
        }
      };
    },
    [headerIds, totalRowCount, setFocused, onNavigateToIndex]
  );

  const value: DataTableContextValue = useMemo(
    () => ({
      editingEnabled,
      headerIds,
      totalRowCount,
      focusedRowIndex,
      focusedCellKey,
      setFocused,
      pendingCell,
      setPendingCell,
      getKeyDownHandler,
      onNavigateToIndex,
    }),
    [
      editingEnabled,
      headerIds,
      totalRowCount,
      focusedRowIndex,
      focusedCellKey,
      setFocused,
      pendingCell,
      getKeyDownHandler,
      onNavigateToIndex,
    ]
  );

  return useMemo(
    () => ({
      ...value,
      headers,
    }),
    [value, headers]
  );
}
