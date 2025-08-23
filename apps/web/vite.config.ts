import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '../..', '');
    return {
      plugins: [react()],
      define: {
        'process.env.OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY),
        'process.env.API_KEY': JSON.stringify(env.OPENAI_API_KEY), // Backward compatibility
        'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL),
        'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
          '@qupid/core': path.resolve(__dirname, '../../packages/core/src'),
          '@qupid/ui': path.resolve(__dirname, '../../packages/ui/src'),
        }
      },
      server: {
        port: 5173,
        host: true
      }
    };
});