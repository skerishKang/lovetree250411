import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import Home from '../index';
import { treeSlice } from '../../../store/slices/treeSlice';
import { authSlice } from '../../../store/slices/authSlice';

const mockTreeNodes = [
  {
    id: '1',
    title: '첫 번째 노드',
    content: '첫 번째 노드의 내용',
    author: {
      id: 'user1',
      name: '사용자1',
      profileImage: 'https://example.com/profile1.jpg'
    },
    createdAt: '2024-01-01T00:00:00Z',
    likes: 5,
    comments: 3,
    tags: ['태그1', '태그2']
  },
  {
    id: '2',
    title: '두 번째 노드',
    content: '두 번째 노드의 내용',
    author: {
      id: 'user2',
      name: '사용자2',
      profileImage: 'https://example.com/profile2.jpg'
    },
    createdAt: '2024-01-02T00:00:00Z',
    likes: 3,
    comments: 1,
    tags: ['태그2', '태그3']
  }
];

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      tree: treeSlice.reducer,
      auth: authSlice.reducer
    },
    preloadedState: {
      tree: {
        nodes: mockTreeNodes,
        selectedNode: null,
        loading: false,
        error: null
      },
      auth: {
        user: null,
        token: null,
        loading: false,
        error: null
      },
      ...initialState
    }
  });
};

describe('Home Page Integration', () => {
  it('should render tree nodes and handle search', async () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      </Provider>
    );

    // 트리 노드들이 렌더링되는지 확인
    expect(screen.getByText('첫 번째 노드')).toBeInTheDocument();
    expect(screen.getByText('두 번째 노드')).toBeInTheDocument();

    // 검색 기능 테스트
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    fireEvent.change(searchInput, { target: { value: '첫 번째' } });
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

    // 태그 필터링 테스트
    const tagButton = screen.getByText('태그1');
    fireEvent.click(tagButton);

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

    // 좋아요 버튼 클릭 테스트
    const likeButton = screen.getAllByText('좋아요')[0];
    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(store.getState().tree.nodes[0].likes).toBe(6);
    });
  });

  it('should handle authentication state changes', async () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      </Provider>
    );

    // 로그인 버튼이 보이는지 확인
    expect(screen.getByText('로그인')).toBeInTheDocument();

    // 로그인 상태로 변경
    store.dispatch(authSlice.actions.loginSuccess({
      user: {
        id: '1',
        name: '테스트 사용자',
        profileImage: 'https://example.com/profile.jpg'
      },
      token: 'test-token'
    }));

    await waitFor(() => {
      expect(screen.getByText('테스트 사용자')).toBeInTheDocument();
      expect(screen.getByText('로그아웃')).toBeInTheDocument();
    });
  });
}); 