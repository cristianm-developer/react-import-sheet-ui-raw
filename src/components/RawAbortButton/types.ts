import type { ReactNode } from 'react';

export interface RawAbortButtonProps {
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  'aria-label'?: string;
}
