import type { TableHeader } from '../../shared/types/data-phase.js';

export interface PendingCell {
  rowIndex: number;
  fieldId: string;
}

export interface DataTableContextValue {
  /** Whether cell editing is enabled (from RootConfig). */
  editingEnabled: boolean;
  /** Ordered list of column/field ids for arrow-key navigation. */
  headerIds: string[];
  /** Total number of rows (for arrow-key boundary). */
  totalRowCount: number;
  /** Currently focused row index (0-based) or null. */
  focusedRowIndex: number | null;
  /** Currently focused cell key (field id) or null. */
  focusedCellKey: string | null;
  /** Set the focused cell (for Roaming Tabindex). */
  setFocused: (rowIndex: number | null, cellKey: string | null) => void;
  /** Cell currently being validated (edit in flight). Cleared when edit completes. */
  pendingCell: PendingCell | null;
  /** Set pending cell (used by useRawCell when editCell is called). */
  setPendingCell: (cell: PendingCell | null) => void;
  /** Build keydown handler for a cell at (rowIndex, cellKey). Injects A11y arrow navigation. */
  getKeyDownHandler: (rowIndex: number, cellKey: string) => (e: React.KeyboardEvent) => void;
  /** Optional: called when focus would move to a row index outside current virtual window (for scroll). */
  onNavigateToIndex?: (index: number) => void;
}

export interface UseRawDataTableReturn extends DataTableContextValue {
  /** Headers derived from layout (id, label) for convenience. */
  headers: TableHeader[];
}
