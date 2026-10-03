import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages: ericolimaeducador-ux.github.io/telaviva/
  base: '/telaviva/',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 2048,
  },
});
