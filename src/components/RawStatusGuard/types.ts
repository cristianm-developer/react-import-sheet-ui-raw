import type { ReactNode } from 'react';
import type { UseStatusViewReturn } from '../../hooks/useStatusView';

export interface RawStatusGuardProps {
  renderIdle?: (data: UseStatusViewReturn) => ReactNode;
  renderMapping?: (data: UseStatusViewReturn) => ReactNode;
  renderProcess?: (data: UseStatusViewReturn) => ReactNode;
  renderResult?: (data: UseStatusViewReturn) => ReactNode;
  renderError?: (data: UseStatusViewReturn) => ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
