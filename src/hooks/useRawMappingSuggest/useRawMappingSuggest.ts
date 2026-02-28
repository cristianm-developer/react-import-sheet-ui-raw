import { useContext, useMemo } from 'react';
import { LayoutContext } from '../useRawImporterRoot/RootConfigContext.jsx';
import { RootConfigContext } from '../useRawImporterRoot/RootConfigContext.jsx';
import { getLayoutFieldOptions } from '../../shared/types/input-phase.js';
import { getSimilarity } from '../../shared/utils/fuzzy-similarity.js';
import type { UseRawMappingSuggestOptions, UseRawMappingSuggestReturn } from './types.js';

const DEFAULT_FUZZY_THRESHOLD = 0.8;

export function useRawMappingSuggest(
  options: UseRawMappingSuggestOptions
): UseRawMappingSuggestReturn {
  const { columnContext } = options;
  const { fileHeader } = columnContext;
  const rootConfig = useContext(RootConfigContext);
  const layout = useContext(LayoutContext);

  return useMemo((): UseRawMappingSuggestReturn => {
    if (rootConfig.fuzzyMatch === false) {
      return { matchScore: 0, suggestedFieldId: null, suggestedFieldLabel: null };
    }
    const optionsList = getLayoutFieldOptions(layout);
    let bestScore = 0;
    let bestId: string | null = null;
    let bestLabel: string | null = null;
    for (const opt of optionsList) {
      const score = getSimilarity(fileHeader, opt.label);
      if (score >= DEFAULT_FUZZY_THRESHOLD && score > bestScore) {
        bestScore = score;
        bestId = opt.id;
        bestLabel = opt.label;
      }
    }
    const matchScore = Math.round(bestScore * 100);
    return {
      matchScore: bestId != null ? matchScore : 0,
      suggestedFieldId: bestId,
      suggestedFieldLabel: bestLabel,
    };
  }, [rootConfig.fuzzyMatch, layout, fileHeader]);
}
