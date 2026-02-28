import type { RawMappingSuggestContext } from '../../shared/types/input-phase.js';

export interface UseRawMappingSuggestOptions {
  columnContext: RawMappingSuggestContext;
}

export interface UseRawMappingSuggestReturn {
  /** 0–100 when fuzzyMatch is on and a suggestion exists; 0 otherwise. */
  matchScore: number;
  /** Layout field id suggested when fuzzyMatch is on; null otherwise. */
  suggestedFieldId: string | null;
  /** Label for the suggested field; null when no suggestion. */
  suggestedFieldLabel: string | null;
}
