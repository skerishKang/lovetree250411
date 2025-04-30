import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  isAxiosError, // isAxiosError 임포트 추가
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

// 백엔드 에러 응답 타입 정의 (필요에 따라 확장)
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

// --- 중요: updateApiInstance 함수는 현재 코드에 정의되어 있지 않으므로 export 할 수 없습니다. ---
// 만약 이 기능이 필요하다면 별도로 정의해야 합니다.
// export const updateApiInstance = () => { ... }

// 동적 baseURL을 사용하는 API 인스턴스 생성 함수
export const createApi = () => {
  const baseURL = getApiUrl();
  if (isDevelopment) {
    console.log('🌐 [axios.ts] API baseURL:', baseURL);
  }

  const apiInstance = axios.create({
    baseURL,
    timeout: 70000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });

  // 요청 인터셉터
  apiInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getToken();
      const url = config.url || '';
      const isPublicApi = publicApiPaths.some(path => url.includes(path));

      if (token && !isPublicApi) {
        config.headers.Authorization = `Bearer ${token}`;
        if (isDevelopment) {
          console.log('🔑 [axios.ts] 토큰이 요청에 포함됨:', token.substring(0, 20) + '...');
        }
      } else if (!isPublicApi && isDevelopment) {
        if (!['/login', '/register'].some(path => url.includes(path))) {
          console.warn('⚠️ [axios.ts] 인증이 필요한 요청에 토큰이 없음:', config.url);
        }
      }

      if (isDevelopment) {
        console.log('🚀 [axios.ts] 요청:', {
          url: config.url,
          method: config.method,
          data: config.data,
          isPublicApi,
        });
      }
      return config;
    },
    (error: AxiosError) => {
      console.error('❌ [axios.ts] 요청 설정 에러:', error);
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
    async (error: any) => {
      if (isAxiosError(error)) {
        if (isDevelopment) {
          console.error('❌ [axios.ts] Axios 응답 에러:', {
            status: error?.response?.status,
            data: error?.response?.data,
            message: typeof error?.message === 'string' ? error.message : '',
            code: typeof error?.code === 'string' ? error.code : '',
          });
        }
        if (axios.isCancel(error)) {
          console.log('🚫 [axios.ts] 요청이 취소되었습니다.');
          return Promise.reject(new Error('Request canceled'));
        }
        // @ts-ignore
        if (error?.response?.status === 401) {
          console.warn('🔒 [axios.ts] 401 Unauthorized - 인증 데이터 초기화');
          clearAuthData();
          if (logoutHandler) {
            logoutHandler();
          } else {
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }
          return Promise.reject(new Error('인증 만료 또는 실패'));
        }
        // @ts-ignore
        if (typeof error?.code === 'string' && error.code === 'ECONNABORTED') {
          console.error('⏰ [axios.ts] 요청 시간 초과');
          return Promise.reject(new Error('요청 시간이 초과되었습니다.'));
        }
        // @ts-ignore
        if (!error?.response) {
          // @ts-ignore
          console.error('🌐 [axios.ts] 네트워크 에러 또는 응답 없음:', typeof error?.message === 'string' ? error.message : '');
          return Promise.reject(new Error('서버에 연결할 수 없습니다.'));
        }
        // 타입 안전하게 에러 응답 데이터 접근
        // @ts-ignore
        const errorData = error?.response?.data as ErrorResponse | undefined;
        // @ts-ignore
        const errorMessage = (errorData?.message && typeof errorData.message === 'string')
          ? errorData.message
          : (// @ts-ignore
            typeof error?.message === 'string' ? error.message : '알 수 없는 API 오류가 발생했습니다.');
        return Promise.reject(new Error(errorMessage));
      } else {
        // AxiosError가 아닌 일반 에러 처리
        const err: any = error;
        console.error('❌ [axios.ts] 일반 자바스크립트 에러:', err);
        const errorMessage = typeof err?.message === 'string' ? err.message : '알 수 없는 오류가 발생했습니다.';
        return Promise.reject(new Error(errorMessage));
      }
    }
  );

  return apiInstance;
};

// 기본 API 인스턴스 생성
const api = createApi();

// --- 중요: 중복 export 제거 ---
// 이전에 Netlify 빌드 로그에서 오류를 발생시킨 export 구문은 여기에 없어야 합니다.
// export { api, updateApiInstance }; // <<< 이와 같은 라인 삭제!

// --- 기본 인스턴스를 default로 export ---
export default api;