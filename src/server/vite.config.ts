import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [nodePolyfills({
    globals: {
      Buffer: true,
      global: true,
      process: true,
    },
    protocolImports: true,
  })],
  build: {
    target: 'node16',
    ssr: true,
    outDir: '../../dist/server',
    emptyOutDir: true,
    lib: {
      entry: 'index.ts',
      formats: ['cjs'],
      fileName: 'index'
    },
    minify: false
  }
});
