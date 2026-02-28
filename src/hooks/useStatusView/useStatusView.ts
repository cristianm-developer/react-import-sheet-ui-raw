import { useContext, useMemo } from 'react';
import { useConvert, useImporterStatus } from '@cristianm/react-import-sheet-headless';
import { RootConfigContext } from '../useRawImporterRoot/RootConfigContext.jsx';
import { getViewFromState } from '../../shared/types/status-views.js';
import type { StatusView } from '../../shared/types/status-views.js';
import type { UseStatusViewReturn } from './types.js';

function applyStages(
  view: StatusView,
  stages: { mapping?: boolean; process?: boolean; result?: boolean }
): StatusView {
  if (view === 'mapping' && stages.mapping === false) return 'idle';
  if (view === 'process' && stages.process === false) return 'idle';
  if (view === 'result' && stages.result === false) return 'idle';
  return view;
}

export function useStatusView(): UseStatusViewReturn {
  const rootConfig = useContext(RootConfigContext);
  const { status, progressEventTarget } = useImporterStatus();
  const { convertResult } = useConvert();

  const view = useMemo((): StatusView => {
    const raw = getViewFromState(status, convertResult);
    return applyStages(raw, rootConfig.stages);
  }, [status, convertResult, rootConfig.stages]);

  return useMemo(
    () => ({
      view,
      status,
      progressEventTarget,
      convertResult,
    }),
    [view, status, progressEventTarget, convertResult]
  );
}
