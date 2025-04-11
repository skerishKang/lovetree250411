import { describe, it, expect, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import CommentList from '../index';
import { commentSlice } from '@/features/comments/commentsSlice';

// MSW 서버 설정 추가
import { setupServer } from 'msw/node';
import { handlers } from '@/__mocks__/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const mockComments = [
  {
    id: '1',
    content: '첫 번째 댓글',
    author: {
      id: 'user1',
      name: '사용자1',
      profileImage: 'https://example.com/profile1.jpg'
    },
    createdAt: '2024-01-01T00:00:00Z',
    likes: 5
  },
  {
    id: '2',
    content: '두 번째 댓글',
    author: {
      id: 'user2',
      name: '사용자2',
      profileImage: 'https://example.com/profile2.jpg'
    },
    createdAt: '2024-01-02T00:00:00Z',
    likes: 3
  }
];

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      comment: commentSlice.reducer
    },
    preloadedState: {
      comment: {
        comments: mockComments,
        loading: false,
        error: null,
        ...initialState
      }
    }
  });
};

describe('CommentList', () => {
  it('should render comments', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CommentList />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('첫 번째 댓글')).toBeInTheDocument();
    expect(screen.getByText('두 번째 댓글')).toBeInTheDocument();
  });

  it('should display comment metadata', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CommentList />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('사용자1')).toBeInTheDocument();
    expect(screen.getByText('사용자2')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should handle comment submission', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CommentList />
        </MemoryRouter>
      </Provider>
    );

    const commentInput = screen.getByPlaceholderText('댓글을 입력하세요');
    const submitButton = screen.getByRole('button', { name: '댓글 작성' });

    fireEvent.change(commentInput, { target: { value: '새로운 댓글' } });
    fireEvent.click(submitButton);

    // Check if commentInput is cleared after submission
    expect(commentInput.value).toBe('');
  });

  it('should handle comment likes', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CommentList />
        </MemoryRouter>
      </Provider>
    );

    const likeButtons = screen.getAllByRole('button', { name: /좋아요/ });
    fireEvent.click(likeButtons[0]);

    // Check if likes count is updated
    expect(store.getState().comment.comments[0].likes).toBe(5);
  });

  it('should display loading state', () => {
    const store = createTestStore({ loading: true });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CommentList />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('should display error state', () => {
    const store = createTestStore({ error: '댓글을 불러오는 중 오류가 발생했습니다.' });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CommentList />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('댓글을 불러오는 중 오류가 발생했습니다.')).toBeInTheDocument();
  });
}); 