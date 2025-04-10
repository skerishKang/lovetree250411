import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
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
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true,
      }
    },
    onError: (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n🚫 포트 3000이 이미 사용 중입니다.`);
        console.error('다음 명령어로 포트를 사용 중인 프로세스를 종료할 수 있습니다:');
        console.error(`Windows: netstat -ano | findstr :3000`);
        console.error(`Mac/Linux: lsof -i :3000\n`);
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
}); 