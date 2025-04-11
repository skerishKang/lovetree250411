import axios from 'axios';
import { getToken, removeToken, getRefreshToken, setToken, clearAuthData } from './auth';

// 개발 환경에서만 로그 출력
const isDevelopment = import.meta.env.MODE === 'development';

// 로그아웃 핸들러를 외부에서 주입받기 위한 변수
let logoutHandler: (() => void) | null = null;

export const setLogoutHandler = (handler: () => void) => {
  logoutHandler = handler;
  if (isDevelopment) {
    console.log('✅ 로그아웃 핸들러가 설정되었습니다.');
  }
};

// 공개 API 경로 목록
const publicApiPaths = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/health'
];

// axios 인스턴스 생성
const api = axios.create({
  baseURL: import.meta.env.MODE === 'development' ? 'http://localhost:3001' : '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    const isPublicApi = publicApiPaths.some(path => config.url?.startsWith(path));
    
    if (token && !isPublicApi) {
      config.headers.Authorization = `Bearer ${token}`;
      if (isDevelopment) {
        console.log('🔑 토큰이 요청에 포함됨:', token.substring(0, 20) + '...');
      }
    } else if (!isPublicApi && isDevelopment) {
      console.warn('⚠️ 인증이 필요한 요청에 토큰이 없음:', config.url);
    }
    
    if (isDevelopment) {
      console.log('🚀 요청:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data,
        isPublicApi
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ 요청 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    if (isDevelopment) {
      console.log('✅ 응답:', {
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    if (isDevelopment) {
      console.error('❌ 응답 에러:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        code: error.code
      });
    }
    
    // 요청 취소 처리
    if (axios.isCancel(error)) {
      console.log('🚫 요청이 취소되었습니다.');
      return Promise.reject(new Error('요청이 취소되었습니다.'));
    }
    
    // 401 Unauthorized 오류 처리
    if (error.response?.status === 401) {
      console.warn('🔒 401 Unauthorized - 인증 데이터 초기화');
      clearAuthData();
      if (logoutHandler) {
        console.log('🔄 로그아웃 핸들러 호출');
        logoutHandler();
      } else {
        console.warn('⚠️ 로그아웃 핸들러가 설정되지 않음');
        window.location.href = '/login';
      }
      return Promise.reject(new Error('인증이 필요합니다.'));
    }
    
    if (error.code === 'ECONNABORTED') {
      console.error('⏰ 요청 시간 초과');
      return Promise.reject(new Error('요청 시간이 초과되었습니다.'));
    }
    
    if (!error.response) {
      console.error('🌐 네트워크 에러:', error.message);
      return Promise.reject(new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.'));
    }
    
    return Promise.reject(error);
  }
);

export default api; 