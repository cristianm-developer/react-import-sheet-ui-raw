import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ImporterProvider } from '@cristianm/react-import-sheet-headless';
import { LayoutProvider } from '../useRawImporterRoot/RootConfigContext';
import { useRawMappingTable } from './useRawMappingTable';

const layout = {
  name: 'Test',
  version: '1',
  fields: { email: { name: 'Email' }, name: { name: 'Name' } },
};

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ImporterProvider layout={layout}>
      <LayoutProvider layout={layout}>{children}</LayoutProvider>
    </ImporterProvider>
  );
}

describe('useRawMappingTable', () => {
  it('returns rows and hasMappingData', () => {
    const { result } = renderHook(() => useRawMappingTable(), { wrapper });
    expect(Array.isArray(result.current.rows)).toBe(true);
    expect(result.current.rows).toHaveLength(0);
    expect(result.current.hasMappingData).toBe(false);
  });
});
