import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RawImporterRoot } from './RawImporterRoot';
import { useStatusView } from '../../hooks/useStatusView';

const layout = { name: 'Test', version: '1', fields: { a: { name: 'a' } } };

function Consumer() {
  const { view } = useStatusView();
  return <span data-testid="view">{view}</span>;
}

describe('RawImporterRoot', () => {
  it('renders ImporterProvider and RootConfigProvider with children', () => {
    render(
      <RawImporterRoot layout={layout} engine="auto">
        <Consumer />
      </RawImporterRoot>
    );
    expect(screen.getByTestId('view')).toHaveTextContent('idle');
  });

  it('renders div with data-ris-ui', () => {
    const { container } = render(
      <RawImporterRoot layout={layout}>
        <span>child</span>
      </RawImporterRoot>
    );
    const root = container.querySelector('[data-ris-ui="raw-importer-root"]');
    expect(root).toBeInTheDocument();
    expect(root).toHaveTextContent('child');
  });
});
