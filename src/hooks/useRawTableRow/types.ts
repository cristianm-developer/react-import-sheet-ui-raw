import type { ValidatedRow } from '@cristianm/react-import-sheet-headless';
import type { GetRowPropsResult, RawTableRowContext } from '../../shared/types/data-phase.js';

export type UseRawTableRowOptions = RawTableRowContext;

export interface UseRawTableRowReturn {
  /** Props for <tr> (style, data-has-errors, data-placeholder, role, aria-rowindex). Merge with consumer className/style. */
  getRowProps: (options?: {
    className?: string;
    style?: React.CSSProperties;
  }) => GetRowPropsResult & { className?: string; style?: React.CSSProperties };
  /** Row data (errors, cells). Undefined when placeholder or out of range. */
  row: ValidatedRow | undefined | null;
  /** Row-level errors (from ValidatedRow.errors). */
  rowErrors: readonly import('@cristianm/react-import-sheet-headless').SheetError[];
}
