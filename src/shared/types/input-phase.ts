/**
 * Shared types for the input phase (file picker, mapping table/row, suggest, import action).
 * Align with @cristianm/react-import-sheet-headless ConvertResult, headerToFieldMap, layout fields.
 */

import type { SheetLayout, SheetLayoutField } from '@cristianm/react-import-sheet-headless';

/** Option for the destination field selector (layout field id + label). */
export interface LayoutFieldOption {
  id: string;
  label: string;
}

/** Status of a single column-to-field mapping (valid when mapped and matched). */
export type MappingStatus = 'valid' | 'invalid' | 'unmapped';

/** Context passed to useRawMappingRow for one file column. */
export interface RawMappingRowContext {
  /** Original header from the file (column name). */
  headerOriginal: string;
  /** Column index in the file (0-based). */
  columnIndex: number;
}

/** Context passed to useRawMappingSuggest for one file column (fuzzy suggestion). */
export interface RawMappingSuggestContext {
  /** Original header from the file. */
  fileHeader: string;
  /** Column index (0-based). */
  columnIndex: number;
}

/**
 * Build layout options from SheetLayout for dropdowns/selectors.
 * Each option has id = field key, label = field.name (or id fallback).
 */
export function getLayoutFieldOptions(layout: SheetLayout | null): LayoutFieldOption[] {
  if (!layout?.fields) return [];
  return Object.entries(layout.fields).map(([id, field]) => ({
    id,
    label: (field as SheetLayoutField).name ?? id,
  }));
}
