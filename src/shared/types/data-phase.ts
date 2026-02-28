/**
 * Shared types for the data phase (result grid, table head/body/row/cell, error badge).
 * Align with headless: SheetLayout, useSheetData, useSheetEditor, ValidatedRow, ValidatedCell, SheetError.
 */

/** Header item for table head (from SheetLayout fields). */
export interface TableHeader {
  id: string;
  label: string;
}

/** Context passed to useRawTableRow for one row. */
export interface RawTableRowContext {
  /** Display index (0-based) in the virtualised/list view. */
  index: number;
  /** Optional inline style (e.g. from virtualiser: height, transform). */
  style?: React.CSSProperties;
  /** Optional pre-fetched row data when consumer has it. */
  row?: import('@cristianm/react-import-sheet-headless').ValidatedRow | null;
}

/** Context passed to useRawCell for one cell. */
export interface RawCellContext {
  /** Row display index (0-based). */
  rowIndex: number;
  /** Field id / cell key (layout field id). */
  fieldId: string;
  /** Optional pre-fetched value when consumer has it. */
  value?: unknown;
}

/** Props returned by getRowProps for <tr>. */
export interface GetRowPropsResult {
  key: string | number;
  'data-row-index': number;
  'data-has-errors'?: boolean;
  'data-placeholder'?: boolean;
  style?: React.CSSProperties;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  role: string;
  'aria-rowindex'?: number;
  [key: string]: unknown;
}

/** Options for getRowProps. */
export interface GetRowPropsOptions {
  index: number;
  style?: React.CSSProperties;
}

/** Options for getCellProps (merge with consumer className/style). */
export interface GetCellPropsOptions {
  className?: string;
  style?: React.CSSProperties;
}
