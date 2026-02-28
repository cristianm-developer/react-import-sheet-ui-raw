export interface UseRawExportReturn {
  downloadCSV: (opts?: { filename?: string }) => void | Promise<void>;
  downloadJSON: (opts?: { filename?: string }) => void | Promise<void>;
}
