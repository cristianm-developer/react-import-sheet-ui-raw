import path from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [],
  staticDirs: ['../example'],
  async viteFinal(config) {
    config.resolve = config.resolve ?? {};
    const alias = (config.resolve.alias as Record<string, string>) ?? {};
    config.resolve.alias = {
      ...alias,
      '@cristianm/react-import-sheet-headless': path.resolve(
        process.cwd(),
        'stories',
        'mockHeadless.tsx'
      ),
    };
    return config;
  },
};

export default config;
