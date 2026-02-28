import type { ReactNode } from 'react';
import type { UseRawImporterRootOptions } from '../../hooks/useRawImporterRoot';

export interface RawImporterRootProps extends UseRawImporterRootOptions {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
