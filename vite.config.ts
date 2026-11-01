import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createGeminiMiddleware } from './server/geminiMiddleware';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'gemini-api-server',
      configureServer(server) {
        server.middlewares.use(createGeminiMiddleware());
      },
      configurePreviewServer(server) {
        server.middlewares.use(createGeminiMiddleware());
      }
    }
  ],
  resolve: {
    preserveSymlinks: true
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true
  }
});
