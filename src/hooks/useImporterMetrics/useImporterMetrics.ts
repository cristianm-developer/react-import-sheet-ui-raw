import { useImporter } from '@cristianm/react-import-sheet-headless';

/**
 * Returns pipeline metrics from the Core (timings, totalMs, rowCount).
 * Use in renderResult to show e.g. "10,000 rows in 1.2s".
 */
export function useImporterMetrics() {
  const { metrics } = useImporter();
  return metrics;
}
