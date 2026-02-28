import { useMemo } from 'react';
import { useImporterStatus } from '@cristianm/react-import-sheet-headless';
import type { UseRawStatusReturn } from './types.js';

export function useRawStatus(): UseRawStatusReturn {
  const { status } = useImporterStatus();

  return useMemo(
    (): UseRawStatusReturn => ({
      status,
      // When headless exposes lastError / errorDetail, wire it here for status === 'error'
      errorDetail: undefined,
    }),
    [status]
  );
}
