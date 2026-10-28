import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        home: resolve(__dirname, 'home.html'),
        nosotros: resolve(__dirname, 'nosotros.html'),
        acuerdos: resolve(__dirname, 'acuerdos.html'),
      }
    }
  },
  server: {
    port: 3000,
    host: true,
    allowedHosts: 'all',
    open: true,
  },
});
