import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import Register from '../Register';
import { authSlice } from '../../../store/slices/authSlice';

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice.reducer
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        loading: false,
        error: null,
        ...initialState
      }
    }
  });
};

describe('Auth Pages Integration', () => {
  describe('Login Page', () => {
    it('should handle successful login', async () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <BrowserRouter>
            <Login />
          </BrowserRouter>
        </Provider>
      );

      // 로그인 폼 입력
      fireEvent.change(screen.getByPlaceholderText('이메일'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('비밀번호'), {
        target: { value: 'Password123!' }
      });

      // 로그인 버튼 클릭
      fireEvent.click(screen.getByText('로그인'));

      // 로그인 성공 액션 디스패치
      store.dispatch(authSlice.actions.loginSuccess({
        user: {
          id: '1',
          name: '테스트 사용자',
          profileImage: 'https://example.com/profile.jpg'
        },
        token: 'test-token'
      }));

      await waitFor(() => {
        expect(store.getState().auth.user).not.toBeNull();
        expect(store.getState().auth.token).toBe('test-token');
      });
    });

    it('should handle login error', async () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <BrowserRouter>
            <Login />
          </BrowserRouter>
        </Provider>
      );

      // 로그인 폼 입력
      fireEvent.change(screen.getByPlaceholderText('이메일'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('비밀번호'), {
        target: { value: 'wrongpassword' }
      });

      // 로그인 버튼 클릭
      fireEvent.click(screen.getByText('로그인'));

      // 로그인 실패 액션 디스패치
      store.dispatch(authSlice.actions.loginFailure('로그인에 실패했습니다.'));

      await waitFor(() => {
        expect(screen.getByText('로그인에 실패했습니다.')).toBeInTheDocument();
      });
    });
  });

  describe('Register Page', () => {
    it('should handle successful registration', async () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <BrowserRouter>
            <Register />
          </BrowserRouter>
        </Provider>
      );

      // 회원가입 폼 입력
      fireEvent.change(screen.getByPlaceholderText('이름'), {
        target: { value: '테스트 사용자' }
      });
      fireEvent.change(screen.getByPlaceholderText('이메일'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('비밀번호'), {
        target: { value: 'Password123!' }
      });
      fireEvent.change(screen.getByPlaceholderText('비밀번호 확인'), {
        target: { value: 'Password123!' }
      });

      // 회원가입 버튼 클릭
      fireEvent.click(screen.getByText('회원가입'));

      // 회원가입 성공 액션 디스패치
      store.dispatch(authSlice.actions.registerSuccess());

      await waitFor(() => {
        expect(store.getState().auth.error).toBeNull();
      });
    });

    it('should handle registration error', async () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <BrowserRouter>
            <Register />
          </BrowserRouter>
        </Provider>
      );

      // 회원가입 폼 입력
      fireEvent.change(screen.getByPlaceholderText('이름'), {
        target: { value: '테스트 사용자' }
      });
      fireEvent.change(screen.getByPlaceholderText('이메일'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('비밀번호'), {
        target: { value: 'Password123!' }
      });
      fireEvent.change(screen.getByPlaceholderText('비밀번호 확인'), {
        target: { value: 'Password123!' }
      });

      // 회원가입 버튼 클릭
      fireEvent.click(screen.getByText('회원가입'));

      // 회원가입 실패 액션 디스패치
      store.dispatch(authSlice.actions.registerFailure('회원가입에 실패했습니다.'));

      await waitFor(() => {
        expect(screen.getByText('회원가입에 실패했습니다.')).toBeInTheDocument();
      });
    });

    it('should validate password match', async () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <BrowserRouter>
            <Register />
          </BrowserRouter>
        </Provider>
      );

      // 비밀번호 불일치 입력
      fireEvent.change(screen.getByPlaceholderText('비밀번호'), {
        target: { value: 'Password123!' }
      });
      fireEvent.change(screen.getByPlaceholderText('비밀번호 확인'), {
        target: { value: 'Different123!' }
      });

      // 회원가입 버튼 클릭
      fireEvent.click(screen.getByText('회원가입'));

      await waitFor(() => {
        expect(screen.getByText('비밀번호가 일치하지 않습니다.')).toBeInTheDocument();
      });
    });
  });
}); 