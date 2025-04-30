import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   manifest: {
    //     name: 'Love Tree',
    //     short_name: 'LoveTree',
    //     description: '사람에 빠지는 순간을 간직하는 플랫폼',
    //     theme_color: '#16a34a',
    //     background_color: '#ffffff',
    //     display: 'standalone',
    //     icons: [
    //       {
    //         src: '/icons/icon-192x192.png',
    //         sizes: '192x192',
    //         type: 'image/png',
    //       },
    //       {
    //         src: '/icons/icon-512x512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //       },
    //     ],
    //     gcm_sender_id: '103953800507',
    //   },
    //   workbox: {
    //     runtimeCaching: [
    //       {
    //         urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*$/,
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: 'google-fonts-stylesheets',
    //           expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
    //         },
    //       },
    //       {
    //         urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*$/,
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: 'google-fonts-webfonts',
    //           expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
    //         },
    //       },
    //     ],
    //   },
    //   devOptions: {
    //     enabled: true,
    //   },
    //   strategies: 'injectManifest',
    //   injectManifest: {
    //     swSrc: 'src/service-worker.js',
    //   },
    //   injectRegister: 'auto',
    // }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@features': path.resolve(__dirname, './src/features'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path  // 경로를 그대로 유지하도록 변경
      },
      '/socket.io': {
        target: process.env.VITE_API_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      // YouTube iframe을 위한 CORS 설정
      '/youtube': {
        target: 'https://www.youtube.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/youtube/, '')
      }
    },
    cors: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'c96e-49-168-168-61.ngrok-free.app',
      '.ngrok-free.app'  // 모든 ngrok 하위 도메인 허용
    ]
    // onError 옵션 제거: Vite의 ServerOptions에는 onError가 없습니다.
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    module: 'ESNext',
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
  },
});
