import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import NodeDetail from '../index';
import authSlice from '../../../store/slices/authSlice';
import treeSlice from '../../../store/slices/treeSlice';
import commentSlice from '../../../store/slices/commentSlice';

const mockUser = {
  id: '1',
  username: '테스트 사용자',
  email: 'test@example.com',
  profileImage: 'test-image.jpg'
};

const mockNode = {
  id: '1',
  title: '테스트 노드',
  content: '테스트 내용',
  author: mockUser,
  tags: ['태그1', '태그2'],
  likes: 5,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
};

const mockComments = [
  {
    id: '1',
    content: '테스트 댓글 1',
    author: mockUser,
    createdAt: '2024-01-01T01:00:00.000Z',
    likes: 2
  },
  {
    id: '2',
    content: '테스트 댓글 2',
    author: mockUser,
    createdAt: '2024-01-01T02:00:00.000Z',
    likes: 1
  }
];

const mockStore = configureStore({
  reducer: {
    auth: authSlice,
    tree: treeSlice,
    comment: commentSlice
  },
  preloadedState: {
    auth: {
      user: mockUser,
      token: 'test-token',
      loading: false,
      error: null
    },
    tree: {
      nodes: [mockNode],
      selectedNode: mockNode,
      loading: false,
      error: null
    },
    comment: {
      comments: mockComments,
      loading: false,
      error: null
    }
  }
});

describe('NodeDetail Page', () => {
  it('should render node details', () => {
    render(
      <Provider store={mockStore}>
        <MemoryRouter initialEntries={['/node/1']}>
          <Routes>
            <Route path="/node/:id" element={<NodeDetail />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('테스트 노드')).toBeInTheDocument();
    expect(screen.getByText('테스트 내용')).toBeInTheDocument();
    expect(screen.getByText('테스트 사용자')).toBeInTheDocument();
    expect(screen.getByText('태그1')).toBeInTheDocument();
    expect(screen.getByText('태그2')).toBeInTheDocument();
  });

  it('should handle like button click', async () => {
    render(
      <Provider store={mockStore}>
        <MemoryRouter initialEntries={['/node/1']}>
          <Routes>
            <Route path="/node/:id" element={<NodeDetail />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    const likeButton = screen.getByRole('button', { name: /좋아요/ });
    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(screen.getByText('6')).toBeInTheDocument(); // likes + 1
    });
  });

  it('should handle comment submission', async () => {
    render(
      <Provider store={mockStore}>
        <MemoryRouter initialEntries={['/node/1']}>
          <Routes>
            <Route path="/node/:id" element={<NodeDetail />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    const commentInput = screen.getByPlaceholderText('댓글을 입력하세요');
    fireEvent.change(commentInput, { target: { value: '새로운 댓글' } });

    const submitButton = screen.getByRole('button', { name: /댓글 작성/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('새로운 댓글')).toBeInTheDocument();
    });
  });

  it('should handle comment like', async () => {
    render(
      <Provider store={mockStore}>
        <MemoryRouter initialEntries={['/node/1']}>
          <Routes>
            <Route path="/node/:id" element={<NodeDetail />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    const commentLikeButtons = screen.getAllByRole('button', { name: /댓글 좋아요/ });
    fireEvent.click(commentLikeButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument(); // likes + 1
    });
  });

  it('should handle node edit', async () => {
    render(
      <Provider store={mockStore}>
        <MemoryRouter initialEntries={['/node/1']}>
          <Routes>
            <Route path="/node/:id" element={<NodeDetail />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    const editButton = screen.getByText('수정');
    fireEvent.click(editButton);

    const titleInput = screen.getByLabelText('제목');
    const contentInput = screen.getByLabelText('내용');

    fireEvent.change(titleInput, { target: { value: '수정된 제목' } });
    fireEvent.change(contentInput, { target: { value: '수정된 내용' } });

    const saveButton = screen.getByText('저장');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('수정된 제목')).toBeInTheDocument();
      expect(screen.getByText('수정된 내용')).toBeInTheDocument();
    });
  });

  it('should handle node deletion', async () => {
    render(
      <Provider store={mockStore}>
        <MemoryRouter initialEntries={['/node/1']}>
          <Routes>
            <Route path="/node/:id" element={<NodeDetail />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    const deleteButton = screen.getByText('삭제');
    fireEvent.click(deleteButton);

    const confirmButton = screen.getByText('확인');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/');
    });
  });

  it('should display loading state', () => {
    const loadingStore = configureStore({
      reducer: {
        auth: authSlice,
        tree: treeSlice,
        comment: commentSlice
      },
      preloadedState: {
        auth: {
          user: null,
          token: null,
          loading: true,
          error: null
        },
        tree: {
          nodes: [],
          selectedNode: null,
          loading: true,
          error: null
        },
        comment: {
          comments: [],
          loading: true,
          error: null
        }
      }
    });

    render(
      <Provider store={loadingStore}>
        <MemoryRouter initialEntries={['/node/1']}>
          <Routes>
            <Route path="/node/:id" element={<NodeDetail />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('should display error state', () => {
    const errorStore = configureStore({
      reducer: {
        auth: authSlice,
        tree: treeSlice,
        comment: commentSlice
      },
      preloadedState: {
        auth: {
          user: null,
          token: null,
          loading: false,
          error: '인증 오류'
        },
        tree: {
          nodes: [],
          selectedNode: null,
          loading: false,
          error: '노드 로딩 오류'
        },
        comment: {
          comments: [],
          loading: false,
          error: '댓글 로딩 오류'
        }
      }
    });

    render(
      <Provider store={errorStore}>
        <MemoryRouter initialEntries={['/node/1']}>
          <Routes>
            <Route path="/node/:id" element={<NodeDetail />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('인증 오류')).toBeInTheDocument();
    expect(screen.getByText('노드 로딩 오류')).toBeInTheDocument();
    expect(screen.getByText('댓글 로딩 오류')).toBeInTheDocument();
  });
}); 