import api from '@/utils/axios';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export const authService = {
  // 로그인
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // 회원가입
  register: async (userData: RegisterData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // 현재 사용자 정보 조회
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // 프로필 업데이트
  updateProfile: async (userId: string, profileData: Partial<{ name: string; profileImage: string; bio: string }>) => {
    const response = await api.put(`/auth/profile/${userId}`, profileData);
    return response.data;
  },

  // 비밀번호 변경
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await api.put('/auth/password', data);
    return response.data;
  },

  // 비밀번호 재설정 요청
  requestPasswordReset: async (email: string) => {
    const response = await api.post('/auth/password-reset', { email });
    return response.data;
  },

  // 비밀번호 재설정
  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post(`/auth/password-reset/${token}`, { password: newPassword });
    return response.data;
  },
}; 