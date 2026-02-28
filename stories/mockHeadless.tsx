/**
 * Mock of @cristianm/react-import-sheet-headless for Storybook.
 * When a file is selected, sets convertResult so the mapping view appears;
 * when applyMapping() is called, sets status to success and provides sheet data.
 * Use via Vite alias in .storybook/main.ts so the FullImplementation story works without the real headless.
 */

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

// Minimal types to avoid circular dependency when aliased
interface SheetLayout {
  name?: string;
  version?: string;
  fields: Record<string, { name: string }>;
}

interface MockValidatedCell {
  key: string;
  value: unknown;
  errors?: Array<{ code?: string; message?: string }>;
}

interface MockValidatedRow {
  cells: MockValidatedCell[];
  errors?: unknown[];
}

interface Sheet {
  rows?: MockValidatedRow[];
}

interface ConvertResultData {
  headersFound: string[];
  headerToFieldMap: Record<string, string>;
  mismatches: Array<{ expected?: string }>;
  renameColumn: (headerOriginal: string, fieldId: string) => void;
  applyMapping: () => void;
}

interface MockState {
  layout: SheetLayout | null;
  status: string;
  convertResult: ConvertResultData | null;
  sheet: Sheet | null;
}

const defaultState: MockState = {
  layout: null,
  status: 'idle',
  convertResult: null,
  sheet: null,
};

const ImporterStateContext = React.createContext<{
  state: MockState;
  setState: React.Dispatch<React.SetStateAction<MockState>>;
  layoutFromProps: SheetLayout | null;
} | null>(null);

function useImporterState() {
  const ctx = useContext(ImporterStateContext);
  if (!ctx) throw new Error('Mock headless: use inside ImporterProvider');
  return ctx;
}

// Build mock convertResult from layout (headers = field names) and optional file
function buildMockConvertResult(
  layout: SheetLayout,
  setState: React.Dispatch<React.SetStateAction<MockState>>
): ConvertResultData {
  const headersFound = Object.entries(layout.fields).map(([, f]) => f.name);
  const headerToFieldMap: Record<string, string> = {};
  Object.entries(layout.fields).forEach(([id, f]) => {
    headerToFieldMap[f.name] = id;
  });

  return {
    headersFound,
    headerToFieldMap,
    mismatches: [],
    renameColumn(headerOriginal: string, fieldId: string) {
      setState((prev) => {
        if (!prev.convertResult) return prev;
        const next = {
          ...prev.convertResult,
          headerToFieldMap: { ...prev.convertResult.headerToFieldMap },
        };
        next.headerToFieldMap[headerOriginal] = fieldId;
        return { ...prev, convertResult: next };
      });
    },
    applyMapping() {
      setState((prev) => {
        const fieldIds = prev.layout ? Object.keys(prev.layout.fields) : [];
        const rows: MockValidatedRow[] = [
          {
            cells: fieldIds.map((key) => ({ key, value: `Sample ${key} 1`, errors: [] })),
            errors: [],
          },
          {
            cells: fieldIds.map((key) => ({ key, value: `Sample ${key} 2`, errors: [] })),
            errors: [],
          },
        ];
        return {
          ...prev,
          convertResult: null,
          status: 'success',
          sheet: { rows },
        };
      });
    },
  };
}

export const IMPORTER_ABORTED_EVENT = 'importer-aborted';
export const IMPORTER_PROGRESS_EVENT = 'importer-progress';

export interface ImporterProviderProps {
  layout?: SheetLayout | null;
  engine?: string;
  persist?: boolean;
  persistKey?: string;
  children: ReactNode;
}

export function ImporterProvider({ layout = null, children }: ImporterProviderProps) {
  const [state, setState] = useState<MockState>(() => ({
    ...defaultState,
    layout,
  }));

  useEffect(() => {
    setState((prev) => (prev.layout !== layout ? { ...prev, layout } : prev));
  }, [layout]);

  const stateWithLayout = useMemo(
    () => ({ ...state, layout: layout ?? state.layout }),
    [state, layout]
  );

  const value = useMemo(
    () => ({ state: stateWithLayout, setState, layoutFromProps: layout }),
    [
      stateWithLayout.status,
      stateWithLayout.convertResult,
      stateWithLayout.sheet,
      stateWithLayout.layout,
      layout,
    ]
  );

  return <ImporterStateContext.Provider value={value}>{children}</ImporterStateContext.Provider>;
}

export function useImporter() {
  const { state, setState, layoutFromProps } = useImporterState();
  const layout = layoutFromProps ?? state.layout;

  const processFile = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- signature must accept File
    (_file: File) => {
      if (!layout) return;
      const convertResult = buildMockConvertResult(layout, setState);
      setState((prev) => ({
        ...prev,
        convertResult,
        status: 'idle',
      }));
    },
    [layout, setState]
  );

  const abort = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'cancelled', convertResult: null }));
  }, [setState]);

  return useMemo(
    () => ({
      processFile,
      abort,
      metrics: null,
    }),
    [processFile, abort]
  );
}

export function useConvert() {
  const { state } = useImporterState();
  return useMemo(
    () => ({
      convertResult: state.convertResult,
      convert: () => {},
      convertedSheet: null,
    }),
    [state.convertResult]
  );
}

export function useImporterStatus() {
  const { state } = useImporterState();
  const progressEventTarget = useRef(new EventTarget()).current;
  return useMemo(
    () => ({
      status: state.status,
      progressEventTarget,
    }),
    [state.status, progressEventTarget]
  );
}

export function useSheetData() {
  const { state } = useImporterState();
  return useMemo(
    () => ({
      sheet: state.sheet,
      errors: [],
    }),
    [state.sheet]
  );
}

export function useSheetEditor() {
  const { setState } = useImporterState();
  const editCell = useCallback(
    (params: { rowIndex: number; cellKey: string; value: unknown }) => {
      setState((prev) => {
        if (!prev.sheet?.rows) return prev;
        const rows = prev.sheet.rows.map((row, i) => {
          if (i !== params.rowIndex) return row;
          const cells = row.cells.map((c) =>
            c.key === params.cellKey ? { ...c, value: params.value } : c
          );
          return { ...row, cells };
        });
        return { ...prev, sheet: { rows } };
      });
    },
    [setState]
  );
  return useMemo(() => ({ editCell }), [editCell]);
}

export function useSheetView(options: {
  page?: number;
  defaultPageSize?: number;
  filterMode?: string;
}) {
  const { state } = useImporterState();
  const [page, setPage] = useState(options.page ?? 1);
  const totalRows = state.sheet?.rows?.length ?? 0;
  const pageSize = options.defaultPageSize ?? 25;

  const downloadCSV = useCallback(() => {
    // noop or create blob from state.sheet
  }, []);
  const downloadJSON = useCallback(() => {}, []);

  return useMemo(
    () => ({
      page,
      setPage,
      pageSize,
      setPageSize: () => {},
      totalRows,
      downloadCSV,
      downloadJSON,
      hasRecoverableSession: false,
      recoverSession: () => {},
      clearPersistedState: () => {},
    }),
    [page, pageSize, totalRows, downloadCSV, downloadJSON]
  );
}

export function useImportSheet() {
  return useImporter();
}

export function useImporterEventTarget() {
  return { current: new EventTarget() };
}

export function useImporterProgressSubscription() {
  return { subscribe: () => () => {} };
}

// Minimal type exports so lib index re-exports don't break when alias is used
export type { ImporterProviderProps, SheetLayout, Sheet, ConvertResultData };
export type UseImporterOptions = Record<string, unknown>;
export type ImporterStatus = string;
export type ImporterState = Record<string, unknown>;
export type ImporterProgressDetail = Record<string, unknown>;
export type SheetLayoutField = { name: string };
export type SheetLayoutRef = Record<string, unknown>;
export type SheetError = { code?: string; message?: string };
export type SheetErrorLevel = string;
export type ParserEngine = string;
export type ValidatedCell = MockValidatedCell;
export type ValidatedRow = MockValidatedRow;
export type EditCellParams = Record<string, unknown>;
export type PaginatedResult = Record<string, unknown>;
export type PipelineMetrics = Record<string, unknown>;
export type PipelineMetricsPercentages = Record<string, unknown>;
export type PipelineMetricsTimings = Record<string, unknown>;
export type ExportOptions = Record<string, unknown>;
export type UseSheetViewOptions = Record<string, unknown>;
export type UseSheetViewReturn = Record<string, unknown>;
export type ViewCounts = Record<string, unknown>;
export type ViewFilterMode = string;
export type ConvertResult = ConvertResultData;
