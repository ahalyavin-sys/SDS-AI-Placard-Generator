import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Static SPA. Assets in /public are served from the site root.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1500,
  },
});
