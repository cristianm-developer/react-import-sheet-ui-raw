import { useMemo } from 'react';
import type { UseRawErrorBadgeOptions, UseRawErrorBadgeReturn } from './types.js';

export function useRawErrorBadge(options: UseRawErrorBadgeOptions): UseRawErrorBadgeReturn {
  const { error, translateError } = options;

  const message = useMemo(() => {
    if (!error) return '';
    if (translateError) return translateError(error.code, error.params);
    return (error.message as string) ?? error.code;
  }, [error, translateError]);

  return useMemo(
    (): UseRawErrorBadgeReturn => ({
      error,
      message,
      translateError,
    }),
    [error, message, translateError]
  );
}
