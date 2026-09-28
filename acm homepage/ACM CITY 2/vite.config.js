import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    watch: {
      ignored: [
        '**/public/frames/**',
        '**/Videos Of Entry/**',
        '**/*.mp4',
        '**/*.mov',
        '**/*.avi'
      ]
    }
  }
});
