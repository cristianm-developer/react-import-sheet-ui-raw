export interface UseRawImportActionReturn {
  /** True when mapping is incomplete or pipeline is already running. */
  disabled: boolean;
  /** Applies current mapping and runs the pipeline (Sanitizer → Validator → Transform). */
  runImport: () => void;
}
