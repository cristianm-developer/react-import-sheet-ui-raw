import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ImporterProvider } from '@cristianm/react-import-sheet-headless';
import { RootConfigProvider, useRawImporterRoot } from '../../hooks/useRawImporterRoot';
import { RawStatusGuard } from './RawStatusGuard';

const layout = { name: 'Test', version: '1', fields: { a: { name: 'a' } } };

function Wrapper({ children }: { children: React.ReactNode }) {
  const { providerProps, rootConfig } = useRawImporterRoot({ layout, engine: 'auto' });
  return (
    <ImporterProvider {...providerProps}>
      <RootConfigProvider rootConfig={rootConfig}>{children}</RootConfigProvider>
    </ImporterProvider>
  );
}

describe('RawStatusGuard', () => {
  it('renders renderIdle slot when view is idle', () => {
    render(
      <Wrapper>
        <RawStatusGuard renderIdle={({ view }) => <span data-testid="slot">{view}</span>} />
      </Wrapper>
    );
    expect(screen.getByTestId('slot')).toHaveTextContent('idle');
  });

  it('renders div with data-ris-ui', () => {
    const { container } = render(
      <Wrapper>
        <RawStatusGuard renderIdle={() => <span>idle</span>} />
      </Wrapper>
    );
    expect(container.querySelector('[data-ris-ui="raw-status-guard"]')).toBeInTheDocument();
  });
});
