import { useContext } from 'react';
import { ViewPhaseContext } from '../useRawPagination/ViewPhaseContext.jsx';
import type { UseRawPersistenceReturn } from './types.js';

const VIEW_PHASE_ERROR =
  'useRawPersistence must be used within RawViewPhaseProvider (e.g. in RESULT view).';

export function useRawPersistence(): UseRawPersistenceReturn {
  const ctx = useContext(ViewPhaseContext);
  if (!ctx) throw new Error(VIEW_PHASE_ERROR);
  return {
    hasRecoverableSession: ctx.hasRecoverableSession,
    recoverSession: ctx.recoverSession,
    clearSession: ctx.clearSession,
  };
}
