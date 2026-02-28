import type {
  LayoutFieldOption,
  MappingStatus,
  RawMappingRowContext,
} from '../../shared/types/input-phase.js';

export interface UseRawMappingRowOptions {
  rowContext: RawMappingRowContext;
}

export interface UseRawMappingRowReturn {
  headerOriginal: string;
  columnIndex: number;
  options: LayoutFieldOption[];
  value: string | null;
  onChange: (fieldId: string) => void;
  mappingStatus: MappingStatus;
}
