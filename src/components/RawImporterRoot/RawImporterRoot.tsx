import { forwardRef } from 'react';
import { ImporterProvider } from '@cristianm/react-import-sheet-headless';
import {
  useRawImporterRoot,
  RootConfigProvider,
  LayoutProvider,
} from '../../hooks/useRawImporterRoot';
import type { RawImporterRootProps } from './types';

export const RawImporterRoot = forwardRef<HTMLDivElement, RawImporterRootProps>(
  function RawImporterRoot({ children, className, style, ...options }, ref) {
    const { providerProps, rootConfig } = useRawImporterRoot(options);
    return (
      <ImporterProvider {...providerProps}>
        <LayoutProvider layout={providerProps.layout ?? null}>
          <RootConfigProvider rootConfig={rootConfig}>
            <div ref={ref} className={className} style={style} data-ris-ui="raw-importer-root">
              {children}
            </div>
          </RootConfigProvider>
        </LayoutProvider>
      </ImporterProvider>
    );
  }
);
