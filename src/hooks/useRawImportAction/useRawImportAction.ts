import { useCallback, useMemo } from 'react';
import { useConvert, useImporterStatus } from '@cristianm/react-import-sheet-headless';
import type { UseRawImportActionReturn } from './types.js';

export function useRawImportAction(): UseRawImportActionReturn {
  const { convertResult } = useConvert();
  const { status } = useImporterStatus();

  const isProcessing =
    status === 'loading' ||
    status === 'parsing' ||
    status === 'validating' ||
    status === 'transforming';

  const disabled = useMemo(() => {
    if (isProcessing) return true;
    if (!convertResult) return true;
    return convertResult.mismatches.length > 0;
  }, [isProcessing, convertResult]);

  const runImport = useCallback(() => {
    if (convertResult && !disabled) {
      convertResult.applyMapping();
    }
  }, [convertResult, disabled]);

  return useMemo(
    () => ({
      disabled,
      runImport,
    }),
    [disabled, runImport]
  );
}
