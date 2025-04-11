import axios from 'axios';
import { store } from '@/store';
import { clearCredentials } from '@/features/auth/authSlice';
import ports from '../config/ports';

// URL 설정 가져오기
const urls = ports.getUrls();

const api = axios.create({
  baseURL: urls.API + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(clearCredentials());
    }
    return Promise.reject(error);
  }
);

export default api; 