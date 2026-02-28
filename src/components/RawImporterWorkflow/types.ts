import type { ReactNode } from 'react';

export interface RawImporterWorkflowProps {
  className?: string;
  style?: React.CSSProperties;
  renderIdle?: () => ReactNode;
  renderMapping?: () => ReactNode;
  renderProcess?: () => ReactNode;
  renderResult?: () => ReactNode;
  renderError?: () => ReactNode;
}
