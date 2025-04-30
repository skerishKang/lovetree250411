import axios from 'axios';

// 수정된 코드: Vite 환경변수 사용
const API_BASE_URL = import.meta.env.VITE_API_URL + '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// API 요청 인터셉터
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

// API 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 에러 처리 로직을 추가할 수 있습니다
    return Promise.reject(error);
  }
);

export const treesService = {
  getAll: () => api.get('/trees'),
  getById: (id) => api.get(`/trees/${id}`),
  create: (data) => api.post('/trees', data),
  update: (id, data) => api.put(`/trees/${id}`, data),
  delete: (id) => api.delete(`/trees/${id}`),
};

export const nodesService = {
  create: (treeId, data) => api.post(`/trees/${treeId}/nodes`, data),
  update: (treeId, nodeId, data) => api.put(`/trees/${treeId}/nodes/${nodeId}`, data),
  delete: (treeId, nodeId) => api.delete(`/trees/${treeId}/nodes/${nodeId}`),
};

export default api;