import type { FilterMode } from '../../shared/types/view-phase.js';

export interface UseRawFilterToggleReturn {
  filterMode: FilterMode;
  setFilterMode: (mode: FilterMode) => void;
}
