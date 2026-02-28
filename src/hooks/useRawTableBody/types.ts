import type { GetRowPropsOptions, GetRowPropsResult } from '../../shared/types/data-phase.js';

export interface UseRawTableBodyReturn {
  /** Total number of data rows (for virtualisation). */
  totalRowCount: number;
  /** Get props for a <tr> by display index. Merges style (e.g. from virtualiser). */
  getRowProps: (options: GetRowPropsOptions) => GetRowPropsResult;
  /** Whether the row at index is a placeholder (e.g. beyond data or skeleton). */
  isPlaceholder: (index: number) => boolean;
  /** Optional: set by consumer to scroll virtualiser when focus moves (onNavigateToIndex from context). */
  onNavigateToIndex?: (index: number) => void;
}
