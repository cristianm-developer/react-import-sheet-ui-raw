import type { ReactNode } from 'react';
import type { RawMappingSuggestContext } from '../../shared/types';
import type { UseRawMappingSuggestReturn } from '../../hooks/useRawMappingSuggest';

export interface RawMappingSuggestProps {
  columnContext: RawMappingSuggestContext;
  children: (state: UseRawMappingSuggestReturn) => ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
