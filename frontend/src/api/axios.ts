import axios from 'axios';
import { toast } from 'react-toastify';
import { getApiUrl } from '@/utils/apiConfig';

const isDevelopment = process.env.NODE_ENV === 'development';

// axios 인스턴스 생성 함수 (baseURL 동적 적용)
export const createApiInstance = () => {
  return axios.create({
    baseURL: getApiUrl(),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// 기본 인스턴스 (초기화 이후 재생성 필요)
export let api = createApiInstance();

// API 인스턴스 재생성 함수
export const updateApiInstance = () => {
  api = createApiInstance();
  if (isDevelopment) {
    console.log('🔄 API 인스턴스 업데이트됨:', getApiUrl());
  }
  return api;
};

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (isDevelopment) {
      console.log('요청 인터셉터 - 토큰:', token);
    }
    
    if (!token) {
      if (isDevelopment) {
        console.warn('토큰 없음 - 요청 차단');
      }
      return Promise.reject({ 
        response: { 
          status: 401, 
          data: { message: '로그인이 필요합니다.' } 
        } 
      });
    }

    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    if (isDevelopment) {
      console.error('[API Request Error]', error);
    }
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    if (isDevelopment) {
      console.log('[API Response]', {
        url: response.config.url,
        method: response.config.method,
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    if (isDevelopment) {
      console.error('[API Response Error]', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data
      });
    }

    const errorMessage = error.response?.data?.message || '알 수 없는 오류가 발생했습니다.';
    
    if (error.response?.status === 401) {
      toast.error('로그인이 만료되었습니다. 다시 로그인 해주세요.');
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

// 사용 예시: 환경변수 변경, 로그인/로그아웃 등에서 updateApiInstance() 호출 필요
export { api, updateApiInstance };