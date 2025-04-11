import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../index';

// Header, Footer, Loading 컴포넌트 모킹
jest.mock('../../Header', () => {
  return function MockHeader() {
    return <header data-testid="mock-header">Mock Header</header>;
  };
});

jest.mock('../../Footer', () => {
  return function MockFooter() {
    return <footer data-testid="mock-footer">Mock Footer</footer>;
  };
});

jest.mock('../../Loading', () => {
  return function MockLoading() {
    return <div data-testid="mock-loading">Mock Loading</div>;
  };
});

// 테스트용 store 생성 함수
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      ui: (state = { loading: false }, action) => state,
    },
    preloadedState: {
      ui: {
        loading: false,
        ...initialState,
      },
    },
  });
};

describe('Layout', () => {
  it('renders header, main content, and footer when not loading', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Layout />
        </MemoryRouter>
      </Provider>
    );

    // Header와 Footer가 렌더링되었는지 확인
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();

    // main 컨테이너가 올바른 클래스와 함께 렌더링되었는지 확인
    const mainContainer = screen.getByRole('main');
    expect(mainContainer).toHaveClass('flex-grow', 'container', 'mx-auto', 'px-4', 'py-8');

    // 전체 레이아웃 컨테이너가 올바른 클래스와 함께 렌더링되었는지 확인
    const layoutContainer = mainContainer.parentElement;
    expect(layoutContainer).toHaveClass('min-h-screen', 'flex', 'flex-col', 'bg-gray-50');
  });

  it('renders loading component when loading is true', () => {
    const store = createTestStore({ loading: true });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Layout />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId('mock-loading')).toBeInTheDocument();
  });
}); 