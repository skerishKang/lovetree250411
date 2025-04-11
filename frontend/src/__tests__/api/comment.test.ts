import { describe, it, expect, jest, beforeAll, afterEach, afterAll } from '@jest/globals';
import { configureStore } from '@reduxjs/toolkit';
import { setupServer } from 'msw/node';
import { handlers } from '@/__mocks__/handlers';
import { commentSlice, fetchComments, createComment, updateComment, deleteComment, likeComment } from '@/features/comments/commentsSlice';

// MSW 서버 설정
const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// 테스트 스토어 설정
const createTestStore = () => {
  return configureStore({
    reducer: {
      comment: commentSlice.reducer
    }
  });
};

describe('Comment API', () => {
  it('should fetch comments successfully', async () => {
    const store = createTestStore();
    await store.dispatch(fetchComments('1'));
    
    const state = store.getState().comment;
    expect(state.loading).toBe(false);
    expect(state.comments.length).toBeGreaterThan(0);
    expect(state.error).toBeNull();
  });

  it('should create a comment successfully', async () => {
    const store = createTestStore();
    await store.dispatch(createComment({ nodeId: '1', content: '새로운 댓글' }));
    
    const state = store.getState().comment;
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should update a comment successfully', async () => {
    const store = createTestStore();
    await store.dispatch(updateComment({ id: '1', content: '수정된 댓글' }));
    
    const state = store.getState().comment;
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should delete a comment successfully', async () => {
    const store = createTestStore();
    await store.dispatch(deleteComment('1'));
    
    const state = store.getState().comment;
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should like a comment successfully', async () => {
    const store = createTestStore();
    await store.dispatch(likeComment('1'));
    
    const state = store.getState().comment;
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle validation errors when creating a comment', async () => {
    const store = createTestStore();
    await store.dispatch(createComment({ nodeId: '1', content: '' }));
    
    const state = store.getState().comment;
    expect(state.loading).toBe(false);
    expect(state.error).not.toBeNull();
  });
}); 