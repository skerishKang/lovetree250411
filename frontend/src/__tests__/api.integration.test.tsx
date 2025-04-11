import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { handlers } from '../__mocks__/handlers';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import { authSlice } from '../store/slices/authSlice';
import { treeSlice } from '../store/slices/treeSlice';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice.reducer,
      tree: treeSlice.reducer
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        loading: false,
        error: null
      },
      tree: {
        nodes: [],
        selectedNode: null,
        loading: false,
        error: null
      },
      ...initialState
    }
  });
};

describe('API Integration Tests', () => {
  describe('Authentication API', () => {
    it('should handle successful login', async () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <BrowserRouter>
            <Login />
          </BrowserRouter>
        </Provider>
      );

      fireEvent.change(screen.getByPlaceholderText('이메일'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('비밀번호'), {
        target: { value: 'Password123!' }
      });
      fireEvent.click(screen.getByText('로그인'));

      await waitFor(() => {
        expect(store.getState().auth.user).not.toBeNull();
        expect(store.getState().auth.token).toBe('test-token');
      });
    });

    it('should handle failed login', async () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <BrowserRouter>
            <Login />
          </BrowserRouter>
        </Provider>
      );

      fireEvent.change(screen.getByPlaceholderText('이메일'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('비밀번호'), {
        target: { value: 'wrongpassword' }
      });
      fireEvent.click(screen.getByText('로그인'));

      await waitFor(() => {
        expect(screen.getByText('로그인에 실패했습니다.')).toBeInTheDocument();
      });
    });

    it('should handle successful registration', async () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <BrowserRouter>
            <Register />
          </BrowserRouter>
        </Provider>
      );

      fireEvent.change(screen.getByPlaceholderText('이름'), {
        target: { value: '테스트 사용자' }
      });
      fireEvent.change(screen.getByPlaceholderText('이메일'), {
        target: { value: 'new@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('비밀번호'), {
        target: { value: 'Password123!' }
      });
      fireEvent.change(screen.getByPlaceholderText('비밀번호 확인'), {
        target: { value: 'Password123!' }
      });
      fireEvent.click(screen.getByText('회원가입'));

      await waitFor(() => {
        expect(store.getState().auth.user).not.toBeNull();
        expect(store.getState().auth.token).toBe('test-token');
      });
    });
  });

  describe('Tree API', () => {
    it('should fetch and display tree nodes', async () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <BrowserRouter>
            <Home />
          </BrowserRouter>
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByText('첫 번째 노드')).toBeInTheDocument();
        expect(screen.getByText('두 번째 노드')).toBeInTheDocument();
      });
    });

    it('should handle search functionality', async () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <BrowserRouter>
            <Home />
          </BrowserRouter>
        </Provider>
      );

      fireEvent.change(screen.getByPlaceholderText('검색어를 입력하세요'), {
        target: { value: '첫 번째' }
      });
      fireEvent.click(screen.getByText('검색'));

      await waitFor(() => {
        expect(screen.getByText('첫 번째 노드')).toBeInTheDocument();
        expect(screen.queryByText('두 번째 노드')).not.toBeInTheDocument();
      });
    });

    it('should handle tag filtering', async () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <BrowserRouter>
            <Home />
          </BrowserRouter>
        </Provider>
      );

      fireEvent.click(screen.getByText('태그1'));

      await waitFor(() => {
        expect(screen.getByText('첫 번째 노드')).toBeInTheDocument();
        expect(screen.queryByText('두 번째 노드')).not.toBeInTheDocument();
      });
    });

    it('should handle node like interaction', async () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <BrowserRouter>
            <Home />
          </BrowserRouter>
        </Provider>
      );

      const likeButton = screen.getAllByText('좋아요')[0];
      fireEvent.click(likeButton);

      await waitFor(() => {
        expect(store.getState().tree.nodes[0].likes).toBe(6);
      });
    });
  });
}); 