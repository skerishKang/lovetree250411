import axios from 'axios';
import { toast } from 'react-toastify';

const isDevelopment = process.env.NODE_ENV === 'development';

// axios 인스턴스 생성
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

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