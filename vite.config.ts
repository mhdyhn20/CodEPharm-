import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const isWeb = process.env.TARGET === 'web';
const base = isWeb ? '/CodEPharm-/' : './';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base,
  build: {
    outDir: isWeb ? 'dist-web' : 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    allowedHosts: true,
  },
});
