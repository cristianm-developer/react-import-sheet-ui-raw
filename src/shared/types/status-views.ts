import type { ImporterStatus } from '@cristianm/react-import-sheet-headless';

export type StatusView = 'idle' | 'mapping' | 'process' | 'result' | 'error';

export function getViewFromState(status: ImporterStatus, convertResult: unknown): StatusView {
  if (convertResult !== null && convertResult !== undefined) {
    return 'mapping';
  }
  switch (status) {
    case 'idle':
    case 'loading':
    case 'parsing':
      return 'idle';
    case 'validating':
    case 'transforming':
      return 'process';
    case 'success':
      return 'result';
    case 'error':
    case 'cancelled':
      return 'error';
    default:
      return 'idle';
  }
}
