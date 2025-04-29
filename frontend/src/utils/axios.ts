import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import { getToken, clearAuthData } from './auth';
import { getApiUrl } from './apiConfig';

// vite-env.d.ts 파일이 있어야 인식됨
const isDevelopment = import.meta.env.MODE === 'development';

let logoutHandler: (() => void) | null = null;
export const setLogoutHandler = (handler: () => void) => {
  logoutHandler = handler;
  if (isDevelopment) {
    console.log('✅ 로그아웃 핸들러가 설정되었습니다.');
  }
};

const publicApiPaths = ['/auth/login', '/auth/register', '/auth/health'];

interface ErrorResponse {
  message: string;
  status?: number;
  code?: string;
}

// YouTube API를 위한 별도의 axios 인스턴스 생성
export const youtubeApi = axios.create({
  baseURL: 'https://www.googleapis.com/youtube/v3',
  timeout: 10000,
});

// 설정 확인을 위한 임시 axios 인스턴스
export const configApi = axios.create({
  timeout: 5000,
});

// 동적 baseURL을 사용하는 API 인스턴스 생성 함수
export const createApi = () => {
  // API 기본 URL 가져오기 (apiConfig에서 가져옴)
  const baseURL = getApiUrl();
  if (isDevelopment) {
    console.log('🌐 API 기본 URL:', baseURL);
  }

  const apiInstance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
    // CORS 설정 추가
    withCredentials: true,
  });

  // 요청 인터셉터
  apiInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getToken();
      const isPublicApi = publicApiPaths.some(path => config.url?.includes(path));

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
          isPublicApi,
        });
      }
      return config;
    },
    (error: AxiosError) => {
      console.error('❌ 요청 에러:', error);
      return Promise.reject(error);
    }
  );

  // 응답 인터셉터
  apiInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      if (isDevelopment) {
        console.log('✅ 응답:', {
          status: response.status,
          data: response.data,
        });
      }
      return response;
    },
    async (error: unknown) => {
      // 명시적으로 AxiosError 타입으로 변환
      const axiosError = error as AxiosError<ErrorResponse>;
      
      if (isDevelopment) {
        console.error('❌ 응답 에러:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
          message: axiosError.message,
          code: axiosError.code,
        });
      }

      if (axios.isCancel(axiosError)) {
        console.log('🚫 요청이 취소되었습니다.');
        return Promise.reject(new Error('요청이 취소되었습니다.'));
      }

      if (axiosError.response?.status === 401) {
        console.warn('🔒 401 Unauthorized - 인증 데이터 초기화');
        clearAuthData();
        if (logoutHandler) {
          logoutHandler();
        } else {
          window.location.href = '/login';
        }
        return Promise.reject(new Error('인증이 필요합니다.'));
      }

      if (axiosError.code === 'ECONNABORTED') {
        console.error('⏰ 요청 시간 초과');
        return Promise.reject(new Error('요청 시간이 초과되었습니다.'));
      }

      if (!axiosError.response) {
        console.error('🌐 네트워크 에러:', axiosError.message);
        return Promise.reject(new Error('서버에 연결할 수 없습니다.'));
      }

      return Promise.reject(axiosError);
    }
  );

  return apiInstance;
};

// 기본 API 인스턴스 생성
const api = createApi();

export default api;
