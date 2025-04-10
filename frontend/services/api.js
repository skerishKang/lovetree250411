import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // 요청 전에 토큰 등을 추가할 수 있습니다
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