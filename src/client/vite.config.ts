import { defineConfig } from 'vite';
import tailwind from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwind()],
  build: {
    outDir: '../../dist/client',
    sourcemap: true,
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]',
        sourcemapFileNames: '[name].js.map',
      },
    },
  },
  // Disable service worker to prevent no-op fetch handler
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['../../']
    }
  },
  // Prevent Vite from generating service worker
  worker: {
    format: 'es'
  }
});
