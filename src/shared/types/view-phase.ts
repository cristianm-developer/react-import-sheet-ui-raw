/**
 * View phase types — pagination, filter, export, persistence.
 * Aligned with headless ViewFilterMode and UseSheetViewReturn.
 */

/** Filter mode for result view: all rows or only rows with errors. Aligned with headless ViewFilterMode. */
export type FilterMode = 'all' | 'errors-only';
