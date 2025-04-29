import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { store } from './store';
import './index.css'; // Tailwind styles
import '../styles/global.css'; // Global reset and base styles
import { initApiConfig, getApiUrl, getWsUrl, updateApiConfig } from './utils/apiConfig';

const queryClient = new QueryClient();

// API 설정을 초기화하는 래퍼 컴포넌트
const ApiConfigInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('🚀 API 설정 초기화 시작...');
        const config = await initApiConfig();
        console.log('✅ API 설정 초기화 완료:', config);
        
        // 설정이 유효한지 확인
        const apiUrl = getApiUrl();
        const wsUrl = getWsUrl();
        
        console.log('📡 현재 API URL:', apiUrl);
        console.log('🔌 현재 WebSocket URL:', wsUrl);
        
        setIsInitialized(true);
      } catch (err) {
        console.error('❌ API 설정 초기화 중 오류:', err);
        setError(`API 설정 초기화 실패: ${err}`);
        // 오류가 발생해도 앱은 시작
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  // 초기화가 완료될 때까지 로딩 표시
  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="text-xl font-bold mb-4">API 설정 초기화 중...</div>
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 오류가 있으면 표시하되 앱은 계속 로드
  if (error) {
    console.warn('⚠️ 오류와 함께 앱 시작:', error);
  }

  return <>{children}</>;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ApiConfigInitializer>
            <App />
          </ApiConfigInitializer>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
