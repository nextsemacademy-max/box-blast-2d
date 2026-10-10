import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 5174,
    host: true,
    watch: {
      ignored: ['**/unity/**', '**/mobile/**'],
    },
  },
  build: {
    target: 'esnext',
  }
});
