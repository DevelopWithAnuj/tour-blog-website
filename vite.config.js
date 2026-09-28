// vite.config.js
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const backendEnv = loadEnv(mode, path.resolve(process.cwd(), 'backend'), '');
  const target = `http://localhost:${backendEnv.PORT || 3000}`;

  return {
    server: {
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [react(), tailwindcss()],
  };
});
