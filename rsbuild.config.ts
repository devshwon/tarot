import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

const { publicVars } = loadEnv({ prefixes: ['VITE_'] });

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    template: './index.html',
  },
  source: {
    entry: {
      index: './src/index.tsx',
    },
    define: publicVars,
  },
  output: {
    copy: [
      { from: './public' },
      { from: './TarotCard.png', to: 'TarotCard.png' },
    ],
  },
  resolve: {
    alias: {
      '@': './src',
    },
  },
});
