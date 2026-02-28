/**
 * @cristianm/react-import-sheet-ui-raw
 * Raw UI components for sheet import — built on @cristianm/react-import-sheet-headless.
 */

export {
  useRawImporterRoot,
  RootConfigContext,
  RootConfigProvider,
  LayoutContext,
  LayoutProvider,
} from './hooks/useRawImporterRoot/index';
export type {
  RootConfig,
  LayoutProviderProps,
  RootConfigProviderProps,
  RootConfigStages,
  UseRawImporterRootOptions,
  UseRawImporterRootReturn,
} from './hooks/useRawImporterRoot/index';

export { useStatusView } from './hooks/useStatusView/index';
export type { UseStatusViewReturn } from './hooks/useStatusView/index';

export { useRawFilePicker } from './hooks/useRawFilePicker/index';
export type {
  GetRootPropsOptions,
  UseRawFilePickerOptions,
  UseRawFilePickerReturn,
} from './hooks/useRawFilePicker/index';

export { useRawMappingTable } from './hooks/useRawMappingTable/index';
export type { UseRawMappingTableReturn } from './hooks/useRawMappingTable/index';

export { useRawMappingRow } from './hooks/useRawMappingRow/index';
export type {
  UseRawMappingRowOptions,
  UseRawMappingRowReturn,
} from './hooks/useRawMappingRow/index';

export { useRawMappingSuggest } from './hooks/useRawMappingSuggest/index';
export type {
  UseRawMappingSuggestOptions,
  UseRawMappingSuggestReturn,
} from './hooks/useRawMappingSuggest/index';

export { useRawImportAction } from './hooks/useRawImportAction/index';
export type { UseRawImportActionReturn } from './hooks/useRawImportAction/index';

export { useRawProgress } from './hooks/useRawProgress/index';
export type { UseRawProgressOptions, UseRawProgressReturn } from './hooks/useRawProgress/index';

export { useRawStatus } from './hooks/useRawStatus/index';
export type { UseRawStatusReturn } from './hooks/useRawStatus/index';

export { useRawAbort } from './hooks/useRawAbort/index';
export type { UseRawAbortReturn } from './hooks/useRawAbort/index';

export {
  useRawDataTable,
  DataTableContext,
  RawDataTableProvider,
} from './hooks/useRawDataTable/index';
export type {
  DataTableContextValue,
  UseRawDataTableReturn,
  UseRawDataTableOptions,
  RawDataTableProviderProps,
  PendingCell,
} from './hooks/useRawDataTable/index';

export { useRawTableHead } from './hooks/useRawTableHead/index';
export type { UseRawTableHeadReturn } from './hooks/useRawTableHead/index';

export { useRawTableBody } from './hooks/useRawTableBody/index';
export type { UseRawTableBodyReturn } from './hooks/useRawTableBody/index';

export { useRawTableRow } from './hooks/useRawTableRow/index';
export type { UseRawTableRowOptions, UseRawTableRowReturn } from './hooks/useRawTableRow/index';

export { useRawCell } from './hooks/useRawCell/index';
export type { UseRawCellOptions, UseRawCellReturn } from './hooks/useRawCell/index';

export { useRawErrorBadge } from './hooks/useRawErrorBadge/index';
export type {
  UseRawErrorBadgeOptions,
  UseRawErrorBadgeReturn,
} from './hooks/useRawErrorBadge/index';

export {
  useRawPagination,
  ViewPhaseContext,
  RawViewPhaseProvider,
} from './hooks/useRawPagination/index';
export type {
  ViewPhaseContextValue,
  RawViewPhaseProviderProps,
  UseRawPaginationReturn,
} from './hooks/useRawPagination/index';

export { useRawFilterToggle } from './hooks/useRawFilterToggle/index';
export type { UseRawFilterToggleReturn } from './hooks/useRawFilterToggle/index';

export { useRawExport } from './hooks/useRawExport/index';
export type { UseRawExportReturn } from './hooks/useRawExport/index';

export { useRawPersistence } from './hooks/useRawPersistence/index';
export type { UseRawPersistenceReturn } from './hooks/useRawPersistence/index';

export { useImporterMetrics } from './hooks/useImporterMetrics/index';

export type { StatusView } from './shared/types/status-views';
export { getViewFromState } from './shared/types/status-views';
export type {
  LayoutFieldOption,
  MappingStatus,
  RawMappingRowContext,
  RawMappingSuggestContext,
} from './shared/types/input-phase';
export { getLayoutFieldOptions } from './shared/types/input-phase';
export type {
  TableHeader,
  RawTableRowContext,
  RawCellContext,
  GetRowPropsResult,
  GetRowPropsOptions,
  GetCellPropsOptions,
} from './shared/types/data-phase';
export type { FilterMode } from './shared/types/view-phase';

export { RawImporterRoot } from './components/RawImporterRoot';
export type { RawImporterRootProps } from './components/RawImporterRoot';

export { RawStatusGuard } from './components/RawStatusGuard';
export type { RawStatusGuardProps } from './components/RawStatusGuard';

export { RawFilePicker } from './components/RawFilePicker';
export type { RawFilePickerProps } from './components/RawFilePicker';

export { RawMappingTable } from './components/RawMappingTable';
export type { RawMappingTableProps } from './components/RawMappingTable';

export { RawMappingRow } from './components/RawMappingRow';
export type { RawMappingRowProps } from './components/RawMappingRow';

export { RawMappingSuggest } from './components/RawMappingSuggest';
export type { RawMappingSuggestProps } from './components/RawMappingSuggest';

export { RawImportAction } from './components/RawImportAction';
export type { RawImportActionProps } from './components/RawImportAction';

export { RawErrorBoundary } from './components/RawErrorBoundary';
export type { RawErrorBoundaryProps } from './components/RawErrorBoundary';

export { RawProgressDisplay } from './components/RawProgressDisplay';
export type { RawProgressDisplayProps } from './components/RawProgressDisplay';

export { RawStatusIndicator } from './components/RawStatusIndicator';
export type { RawStatusIndicatorProps } from './components/RawStatusIndicator';

export { RawAbortButton } from './components/RawAbortButton';
export type { RawAbortButtonProps } from './components/RawAbortButton';

export { RawImporterWorkflow } from './components/RawImporterWorkflow';
export type { RawImporterWorkflowProps } from './components/RawImporterWorkflow';

export {
  ImporterProvider,
  useImporter,
  useImportSheet,
  useConvert,
  useImporterStatus,
  useSheetData,
  useSheetEditor,
  useSheetView,
  useImporterEventTarget,
  useImporterProgressSubscription,
  IMPORTER_ABORTED_EVENT,
  IMPORTER_PROGRESS_EVENT,
} from '@cristianm/react-import-sheet-headless';
export type {
  ImporterProviderProps,
  UseImporterOptions,
  ImporterStatus,
  ImporterState,
  ImporterProgressDetail,
  SheetLayout,
  SheetLayoutField,
  SheetLayoutRef,
  SheetError,
  SheetErrorLevel,
  ParserEngine,
  Sheet,
  ValidatedCell,
  ValidatedRow,
  EditCellParams,
  PaginatedResult,
  PipelineMetrics,
  PipelineMetricsPercentages,
  PipelineMetricsTimings,
  ExportOptions,
  UseSheetViewOptions,
  UseSheetViewReturn,
  ViewCounts,
  ViewFilterMode,
  ConvertResult,
  ConvertResultData,
} from '@cristianm/react-import-sheet-headless';
