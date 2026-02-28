import type { TableHeader } from '../../shared/types/data-phase.js';

export interface UseRawTableHeadReturn {
  /** Headers (id, label) from SheetLayout for rendering <thead> and <th>. */
  headers: TableHeader[];
}
