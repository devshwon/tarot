import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'misterytarot',
  web: {
    host: 'localhost',
    port: 3000,
    commands: {
      dev: 'rsbuild dev',
      build: 'rsbuild build',
    },
  },
  permissions: [],
  outdir: 'dist',
  brand: {
    displayName: '데일리 타로',
    icon: 'https://static.toss.im/appsintoss/14063/0802a573-5b10-43de-b7fc-05b15189abac.png',
    primaryColor: '#D4A853',
    bridgeColorMode: 'inverted',
  },
  webViewProps: {
    type: 'partner',
  },
});
