import { Component, type ErrorInfo, type ReactNode } from 'react';
import type { RawErrorBoundaryProps } from './types.js';

export class RawErrorBoundary extends Component<
  RawErrorBoundaryProps,
  { error: Error | null; errorInfo: ErrorInfo | null }
> {
  constructor(props: RawErrorBoundaryProps) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): { error: Error; errorInfo: null } {
    return { error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState((s) => ({ ...s, errorInfo }));
    this.props.onError?.(error, errorInfo);
  }

  render(): ReactNode {
    const { error, errorInfo } = this.state;
    const { children, fallback } = this.props;
    if (error) {
      const content =
        typeof fallback === 'function'
          ? fallback(error, errorInfo ?? { componentStack: '' })
          : fallback;
      return <div data-ris-ui="raw-error-boundary">{content}</div>;
    }
    return children;
  }
}
