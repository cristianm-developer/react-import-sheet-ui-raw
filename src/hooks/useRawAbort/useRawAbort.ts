import { useImporter } from '@cristianm/react-import-sheet-headless';
import type { UseRawAbortReturn } from './types.js';

export function useRawAbort(): UseRawAbortReturn {
  const { abort } = useImporter();
  return { abort };
}
