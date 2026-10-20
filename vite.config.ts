import { defineConfig } from 'vite';

// GitHub Pages serves the site at https://porggg.github.io/differential-geometry-sandbox/
export default defineConfig({
  base: '/differential-geometry-sandbox/',
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 2000,
  },
});
