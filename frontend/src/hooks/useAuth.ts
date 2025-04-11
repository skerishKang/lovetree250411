import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { login, register, logout } from '@/features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLogin = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        setAuthError(null);
        await dispatch(login(credentials)).unwrap();
        navigate('/');
      } catch (error) {
        setAuthError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
      }
    },
    [dispatch, navigate]
  );

  const handleRegister = useCallback(
    async (data: RegisterData) => {
      if (data.password !== data.confirmPassword) {
        setAuthError('비밀번호가 일치하지 않습니다.');
        return;
      }

      try {
        setAuthError(null);
        await dispatch(register(data)).unwrap();
        navigate('/login');
      } catch (error) {
        setAuthError('회원가입에 실패했습니다. 다시 시도해주세요.');
      }
    },
    [dispatch, navigate]
  );

  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/login');
    } catch (error) {
      setAuthError('로그아웃에 실패했습니다.');
    }
  }, [dispatch, navigate]);

  const isAuthenticated = !!user;

  return {
    user,
    loading,
    error: error || authError,
    isAuthenticated,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };
}; 