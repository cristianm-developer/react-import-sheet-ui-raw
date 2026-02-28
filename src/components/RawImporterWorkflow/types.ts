import type { ReactNode } from 'react';
import type { MappingErrorDetail } from '../../hooks/useStatusView/types';

export interface RawImporterWorkflowErrorOptions {
  mappingErrorDetail: MappingErrorDetail | null;
}

export interface RawImporterWorkflowProps {
  className?: string;
  style?: React.CSSProperties;
  renderIdle?: () => ReactNode;
  renderMapping?: () => ReactNode;
  renderProcess?: () => ReactNode;
  renderResult?: () => ReactNode;
  /** Receives mappingErrorDetail when view is 'error' due to too many mismatches. */
  renderError?: (options: RawImporterWorkflowErrorOptions) => ReactNode;
}
