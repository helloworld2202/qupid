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
      },
      build: {
        // 번들 크기 최적화
        target: 'es2020',
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: mode === 'production', // 프로덕션에서 console 제거
            drop_debugger: true,
          },
        },
        // 청크 크기 경고 임계값 (KB)
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
          output: {
            // 코드 스플리팅: 큰 라이브러리들을 별도 청크로 분리
            manualChunks: {
              // React 관련
              'react-vendor': ['react', 'react-dom', 'react-router-dom'],
              // UI 라이브러리
              'ui-vendor': ['lucide-react', 'chart.js'],
              // 데이터 관리
              'data-vendor': ['@tanstack/react-query', 'zustand', 'axios'],
              // Form 관련
              'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
              // Supabase
              'supabase-vendor': ['@supabase/supabase-js'],
            },
            // 파일명 해싱으로 캐싱 최적화
            chunkFileNames: 'assets/js/[name]-[hash].js',
            entryFileNames: 'assets/js/[name]-[hash].js',
            assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          },
        },
        // 소스맵 설정 (프로덕션에서는 비활성화)
        sourcemap: mode !== 'production',
      },
      // 의존성 최적화
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'react-router-dom',
          '@tanstack/react-query',
        ],
      },
    };
});