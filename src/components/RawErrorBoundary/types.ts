import type { ReactNode } from 'react';
import type { ErrorInfo } from 'react';

export interface RawErrorBoundaryProps {
  children: ReactNode;
  /** Content shown when an error is caught. Can be a node or a function (error, errorInfo) => ReactNode. */
  fallback: ReactNode | ((error: Error, errorInfo: ErrorInfo) => ReactNode);
  /** Called when an error is caught. */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}
