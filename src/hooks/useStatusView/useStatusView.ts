import { useContext, useEffect, useMemo, useRef } from 'react';
import { useConvert, useImporterStatus } from '@cristianm/react-import-sheet-headless';
import { RootConfigContext } from '../useRawImporterRoot/RootConfigContext.jsx';
import type { AutoApplyMappingWhenMismatchesAtMost } from '../useRawImporterRoot/types.js';
import { getViewFromState } from '../../shared/types/status-views.js';
import type { StatusView } from '../../shared/types/status-views.js';
import type { MappingErrorDetail, UseStatusViewReturn } from './types.js';

function applyStages(
  view: StatusView,
  stages: { mapping?: boolean; process?: boolean; result?: boolean }
): StatusView {
  if (view === 'mapping' && stages.mapping === false) return 'idle';
  if (view === 'process' && stages.process === false) return 'idle';
  if (view === 'result' && stages.result === false) return 'idle';
  return view;
}

function resolveMappingView(
  rawView: StatusView,
  mismatchCount: number,
  autoApply: AutoApplyMappingWhenMismatchesAtMost,
  showErrorAbove: number | undefined
): { view: StatusView; mappingErrorDetail: MappingErrorDetail | null } {
  if (rawView !== 'mapping') {
    return { view: rawView, mappingErrorDetail: null };
  }
  if (showErrorAbove != null && mismatchCount > showErrorAbove) {
    return {
      view: 'error',
      mappingErrorDetail: {
        code: 'TOO_MANY_MISMATCHES',
        mismatchCount,
        maxAllowed: showErrorAbove,
      },
    };
  }
  if (autoApply !== 'never' && typeof autoApply === 'number' && mismatchCount <= autoApply) {
    return { view: 'process', mappingErrorDetail: null };
  }
  return { view: 'mapping', mappingErrorDetail: null };
}

export function useStatusView(): UseStatusViewReturn {
  const rootConfig = useContext(RootConfigContext);
  const { status, progressEventTarget } = useImporterStatus();
  const { convertResult } = useConvert();

  const mismatchCount = useMemo(
    () => (convertResult?.mismatches?.length ?? 0) as number,
    [convertResult]
  );

  const { view, mappingErrorDetail } = useMemo(() => {
    const raw = getViewFromState(status, convertResult);
    const afterStages = applyStages(raw, rootConfig.stages);
    return resolveMappingView(
      afterStages,
      mismatchCount,
      rootConfig.autoApplyMappingWhenMismatchesAtMost,
      rootConfig.showErrorWhenMismatchesAbove
    );
  }, [
    status,
    convertResult,
    rootConfig.stages,
    mismatchCount,
    rootConfig.autoApplyMappingWhenMismatchesAtMost,
    rootConfig.showErrorWhenMismatchesAbove,
  ]);

  const appliedRef = useRef<unknown>(null);
  useEffect(() => {
    const autoApply = rootConfig.autoApplyMappingWhenMismatchesAtMost;
    if (
      convertResult != null &&
      autoApply !== 'never' &&
      typeof autoApply === 'number' &&
      mismatchCount <= autoApply &&
      appliedRef.current !== convertResult
    ) {
      appliedRef.current = convertResult;
      convertResult.applyMapping();
    }
    if (convertResult == null) {
      appliedRef.current = null;
    }
  }, [convertResult, mismatchCount, rootConfig.autoApplyMappingWhenMismatchesAtMost]);

  return useMemo(
    () => ({
      view,
      status,
      progressEventTarget,
      convertResult,
      mappingErrorDetail,
    }),
    [view, status, progressEventTarget, convertResult, mappingErrorDetail]
  );
}
