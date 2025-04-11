import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { useAuth } from '../useAuth';
import authReducer from '../../features/auth/authSlice';

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer
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

// 래퍼 컴포넌트를 만들어서 Provider와 MemoryRouter를 모두 제공
const wrapper = ({ children, store }) => (
  <MemoryRouter>
    <Provider store={store}>
      {children}
    </Provider>
  </MemoryRouter>
);

describe('useAuth', () => {
  it('should return initial auth state', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => wrapper({ children, store })
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should return authenticated state when user is logged in', () => {
    const store = createTestStore({
      user: {
        id: '1',
        name: '테스트 사용자',
        profileImage: 'https://example.com/profile.jpg'
      },
      token: 'test-token'
    });
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => wrapper({ children, store })
    });

    expect(result.current.user).toEqual({
      id: '1',
      name: '테스트 사용자',
      profileImage: 'https://example.com/profile.jpg'
    });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle loading state', () => {
    const store = createTestStore({ loading: true });
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => wrapper({ children, store })
    });

    expect(result.current.loading).toBe(true);
  });

  it('should handle error state', () => {
    const error = '인증 오류가 발생했습니다.';
    const store = createTestStore({ error });
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => wrapper({ children, store })
    });

    expect(result.current.error).toBe(error);
  });
}); 