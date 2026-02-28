import { useContext, useCallback, useMemo, useRef } from 'react';
import { useSheetData, useSheetEditor } from '@cristianm/react-import-sheet-headless';
import { DataTableContext } from '../useRawDataTable/DataTableContext.jsx';
import type { UseRawCellOptions, UseRawCellReturn } from './types.js';

export function useRawCell(options: UseRawCellOptions): UseRawCellReturn {
  const { rowIndex, fieldId } = options;
  const { sheet } = useSheetData();
  const { editCell: editorEditCell } = useSheetEditor();
  const ctx = useContext(DataTableContext);

  const row = sheet?.rows?.[rowIndex];
  const cell = useMemo(() => row?.cells?.find((c) => c.key === fieldId), [row?.cells, fieldId]);

  const value = cell?.value;
  const errors = cell?.errors ?? [];
  const isPending = ctx.pendingCell?.rowIndex === rowIndex && ctx.pendingCell?.fieldId === fieldId;
  const isFocused = ctx.focusedRowIndex === rowIndex && ctx.focusedCellKey === fieldId;
  const isEditing = (ctx.editingEnabled ?? true) && isFocused;

  const editCell = useCallback(
    (newValue: unknown) => {
      if (!(ctx.editingEnabled ?? true)) return;
      ctx.setPendingCell({ rowIndex, fieldId });
      const p = editorEditCell({
        rowIndex,
        cellKey: fieldId,
        value: newValue,
      });
      if (p && typeof (p as Promise<unknown>).then === 'function') {
        (p as Promise<void>).then(
          () => ctx.setPendingCell(null),
          () => ctx.setPendingCell(null)
        );
      } else {
        ctx.setPendingCell(null);
      }
    },
    [ctx.editingEnabled, ctx.setPendingCell, editorEditCell, rowIndex, fieldId]
  );

  const localValueRef = useRef<unknown>(value);
  const displayValue = isPending ? localValueRef.current : value;
  if (!isPending) localValueRef.current = value;

  const getCellProps = useCallback(
    (opts?: { className?: string; style?: React.CSSProperties }) => {
      const base: Record<string, unknown> = {
        role: 'gridcell',
        tabIndex: isFocused ? 0 : -1,
        'data-pending': isPending ? 'true' : 'false',
        'aria-invalid': errors.length > 0 ? 'true' : undefined,
        'data-cell-key': fieldId,
        'data-row-index': rowIndex,
        onKeyDown: ctx.getKeyDownHandler(rowIndex, fieldId),
        onFocus: () => ctx.setFocused(rowIndex, fieldId),
        ...(opts?.className != null && { className: opts.className }),
        ...(opts?.style != null && { style: opts.style }),
      };
      return base;
    },
    [isFocused, isPending, errors.length, fieldId, rowIndex, ctx.getKeyDownHandler, ctx.setFocused]
  );

  const getEditInputProps = useCallback(() => {
    return {
      value: displayValue ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        localValueRef.current = v;
        editCell(v);
      },
      onBlur: () => {
        // Keep focus on cell; consumer can clear focus if desired
      },
      'aria-label': fieldId,
    };
  }, [displayValue, fieldId, editCell]);
  const getErrorProps = useCallback(
    () => ({
      role: 'alert' as const,
      'aria-live': 'polite' as const,
      'aria-atomic': true,
    }),
    []
  );

  return useMemo(
    (): UseRawCellReturn => ({
      value: displayValue,
      errors,
      isPending,
      isEditing,
      getCellProps,
      getEditInputProps,
      getErrorProps,
      editCell,
    }),
    [
      displayValue,
      errors,
      isPending,
      isEditing,
      getCellProps,
      getEditInputProps,
      getErrorProps,
      editCell,
    ]
  );
}
