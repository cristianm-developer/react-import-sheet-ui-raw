import type { RawMappingRowContext } from '../../shared/types/input-phase.js';

export interface UseRawMappingTableReturn {
  /** List of row contexts (one per file column) for useRawMappingRow. */
  rows: RawMappingRowContext[];
  /** Whether there is convert result (mapping) data to show. */
  hasMappingData: boolean;
}
