import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import Header from '../index';
import { logout } from '@/features/auth/authSlice';

// Redux store 모킹
jest.mock('@/features/auth/authSlice', () => ({
  logout: jest.fn(() => ({ type: 'auth/logout' })),
}));

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { user: null }, action) => {
        if (action.type === 'auth/logout') {
          return { ...state, user: null };
        }
        return state;
      },
    },
    preloadedState: {
      auth: {
        user: null,
        ...initialState,
      },
    },
  });
};

describe('Header', () => {
  it('renders logo and navigation links', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </Provider>
    );

    // 로고 확인
    expect(screen.getByText('Love Tree')).toBeInTheDocument();

    // 네비게이션 링크 확인
    expect(screen.getByText('탐색')).toBeInTheDocument();
    expect(screen.getByText('인기')).toBeInTheDocument();
    expect(screen.getByText('최신')).toBeInTheDocument();
  });

  it('shows login and register buttons when user is not logged in', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('로그인')).toBeInTheDocument();
    expect(screen.getByText('회원가입')).toBeInTheDocument();
  });

  it('shows user profile and logout button when user is logged in', () => {
    const store = createTestStore({
      user: {
        name: '테스트 사용자',
        profileImage: '/test-avatar.png',
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </Provider>
    );

    // 사용자 이름 확인
    expect(screen.getByText('테스트 사용자')).toBeInTheDocument();

    // 프로필 이미지 확인
    const profileImage = screen.getByAltText('프로필') as HTMLImageElement;
    expect(profileImage.src).toContain('/test-avatar.png');

    // 새 트리 만들기 버튼 확인
    expect(screen.getByText('새 트리 만들기')).toBeInTheDocument();
  });

  it('calls logout when logout button is clicked', () => {
    const store = createTestStore({
      user: {
        name: '테스트 사용자',
        profileImage: '/test-avatar.png',
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </Provider>
    );

    // 로그아웃 버튼 클릭
    fireEvent.click(screen.getByText('로그아웃'));

    // logout 액션이 디스패치되었는지 확인
    expect(logout).toHaveBeenCalled();
  });
}); 