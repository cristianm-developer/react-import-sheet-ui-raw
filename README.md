# @cristianm/react-import-sheet-ui-raw

UI components for sheet import — built on [@cristianm/react-import-sheet-headless](https://github.com/cristianm-developer/react-import-sheet-headless).

## Install

```bash
npm install @cristianm/react-import-sheet-ui-raw @cristianm/react-import-sheet-headless react react-dom
```

## Usage

Configure the headless engine with `ImporterProvider`, then use the raw UI components (e.g. `RawProgressMonitor`, `RawAbortController`) inside that tree. See the headless package for layout and pipeline setup.

```tsx
import { ImporterProvider } from '@cristianm/react-import-sheet-headless';
import { RawProgressMonitor, RawAbortController } from '@cristianm/react-import-sheet-ui-raw';

<ImporterProvider layout={myLayout} engine="auto">
  <RawProgressMonitor>
    {({ phase, progressRef, aborted }) => (
      <div>
        {phase} {aborted && 'Aborted'}
      </div>
    )}
  </RawProgressMonitor>
  <RawAbortController>Cancel</RawAbortController>
</ImporterProvider>;
```

## Scripts

| Script                    | Description                        |
| ------------------------- | ---------------------------------- |
| `npm run build`           | Build ESM + CJS + types to `dist/` |
| `npm run lint`            | Run ESLint                         |
| `npm run lint:fix`        | ESLint with auto-fix               |
| `npm run format`          | Prettier write                     |
| `npm run format:check`    | Prettier check                     |
| `npm run test`            | Vitest watch                       |
| `npm run test:run`        | Vitest run once                    |
| `npm run test:coverage`   | Vitest with coverage (≥90%)        |
| `npm run storybook`       | Storybook dev server               |
| `npm run build-storybook` | Build static Storybook             |
| `npm run commit`          | Commitizen (conventional commits)  |

## License

ISC
