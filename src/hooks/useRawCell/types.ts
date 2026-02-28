import type { SheetError } from '@cristianm/react-import-sheet-headless';
import type { GetCellPropsOptions } from '../../shared/types/data-phase.js';

export interface UseRawCellOptions {
  /** Row display index (0-based). */
  rowIndex: number;
  /** Field id / cell key. */
  fieldId: string;
}

export interface UseRawCellReturn {
  /** Current cell value (from sheet; optimistic after edit until validated). */
  value: unknown;
  /** Cell-level validation errors. */
  errors: readonly SheetError[];
  /** True while edit is being validated (Worker). */
  isPending: boolean;
  /** True when this cell is focused and editing is enabled (consumer can show input). */
  isEditing: boolean;
  /** Props for <td> / gridcell: role, tabIndex, data-pending, aria-invalid, onKeyDown; merge className/style. */
  getCellProps: (options?: GetCellPropsOptions) => Record<string, unknown>;
  /** Props for the edit input when isEditing: value, onChange, onBlur, ref, etc. */
  getEditInputProps: () => Record<string, unknown>;
  /** Props for error badge/slot (e.g. role="alert", aria-live). */
  getErrorProps: () => Record<string, unknown>;
  /** Update cell value (triggers validation; isPending true until done). Respects editingEnabled. */
  editCell: (value: unknown) => void | Promise<void>;
}
