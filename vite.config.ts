
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Fix: Casting process to any to bypass the TypeScript error "Property 'cwd' does not exist on type 'Process'".
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    build: {
      outDir: 'dist',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@google/genai')) return 'vendor-genai';
              if (id.includes('lucide-react')) return 'vendor-icons';
              return 'vendor';
            }
          },
        },
      },
    },
  };
});
