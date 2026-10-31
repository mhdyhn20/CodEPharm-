import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// When building for the web (TARGET=web), use relative paths so the output can be hosted
// from any subpath/file path / static host. When building for Electron, use './' explicitly.
const base = './';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base,
  build: {
    outDir: process.env.TARGET === 'web' ? 'dist-web' : 'dist',
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
