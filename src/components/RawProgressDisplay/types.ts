import type { ReactNode } from 'react';
import type { ImporterProgressDetail } from '@cristianm/react-import-sheet-headless';
import type { UseRawProgressReturn } from '../../hooks/useRawProgress';

export interface RawProgressDisplayProps {
  children: (state: UseRawProgressReturn) => ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Optional callback for progress updates (same as useRawProgress onProgress). */
  onProgress?: (detail: ImporterProgressDetail) => void;
}
