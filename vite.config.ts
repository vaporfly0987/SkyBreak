import { defineConfig } from 'vite';

const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];

export default defineConfig({
  base:
    process.env.BASE_PATH ||
    (repo && !repo.endsWith('.github.io') ? '/' + repo + '/' : './'),
  build: {
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 800,
    rollupOptions: { output: { manualChunks: { three: ['three'] } } },
  },
  server: { host: '0.0.0.0' },
  preview: { host: '0.0.0.0' },
});
