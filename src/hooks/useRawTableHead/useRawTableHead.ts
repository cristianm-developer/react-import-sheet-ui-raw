import { useContext, useMemo } from 'react';
import { LayoutContext } from '../useRawImporterRoot/RootConfigContext.jsx';
import { getLayoutFieldOptions } from '../../shared/types/input-phase.js';
import type { TableHeader } from '../../shared/types/data-phase.js';
import type { UseRawTableHeadReturn } from './types.js';

export function useRawTableHead(): UseRawTableHeadReturn {
  const layout = useContext(LayoutContext);
  const headers: TableHeader[] = useMemo(
    () => getLayoutFieldOptions(layout).map((o) => ({ id: o.id, label: o.label })),
    [layout]
  );
  return useMemo(() => ({ headers }), [headers]);
}
