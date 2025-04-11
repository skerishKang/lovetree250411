import { configureStore } from '@reduxjs/toolkit';
import searchSlice from '../../store/slices/searchSlice';
import { searchNodes, searchUsers, searchTags } from '../../store/thunks/searchThunks';

const mockStore = configureStore({
  reducer: {
    search: searchSlice
  }
});

describe('Search API Tests', () => {
  beforeEach(() => {
    mockStore.dispatch({ type: 'RESET' });
  });

  it('should search nodes successfully', async () => {
    const mockNodes = [
      {
        id: '1',
        title: '테스트 노드',
        content: '테스트 내용',
        author: {
          id: '1',
          username: '테스트사용자'
        },
        tags: ['태그1', '태그2'],
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    ];

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockNodes)
      })
    );

    await mockStore.dispatch(searchNodes({ query: '테스트', tags: ['태그1'] }));
    const state = mockStore.getState().search;

    expect(state.nodes).toEqual(mockNodes);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle node search error', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: '서버 오류' })
      })
    );

    await mockStore.dispatch(searchNodes({ query: '테스트' }));
    const state = mockStore.getState().search;

    expect(state.nodes).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('서버 오류');
  });

  it('should search users successfully', async () => {
    const mockUsers = [
      {
        id: '1',
        username: '테스트사용자',
        profileImage: 'test-image.jpg',
        bio: '테스트 소개'
      }
    ];

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUsers)
      })
    );

    await mockStore.dispatch(searchUsers('테스트'));
    const state = mockStore.getState().search;

    expect(state.users).toEqual(mockUsers);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle user search error', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: '서버 오류' })
      })
    );

    await mockStore.dispatch(searchUsers('테스트'));
    const state = mockStore.getState().search;

    expect(state.users).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('서버 오류');
  });

  it('should search tags successfully', async () => {
    const mockTags = [
      {
        id: '1',
        name: '태그1',
        description: '첫 번째 태그',
        color: '#FF0000'
      }
    ];

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTags)
      })
    );

    await mockStore.dispatch(searchTags('태그'));
    const state = mockStore.getState().search;

    expect(state.tags).toEqual(mockTags);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle tag search error', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: '서버 오류' })
      })
    );

    await mockStore.dispatch(searchTags('태그'));
    const state = mockStore.getState().search;

    expect(state.tags).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('서버 오류');
  });

  it('should handle empty search results', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    );

    await mockStore.dispatch(searchNodes({ query: '존재하지않는검색어' }));
    const state = mockStore.getState().search;

    expect(state.nodes).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle search with multiple tags', async () => {
    const mockNodes = [
      {
        id: '1',
        title: '테스트 노드',
        content: '테스트 내용',
        author: {
          id: '1',
          username: '테스트사용자'
        },
        tags: ['태그1', '태그2'],
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    ];

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockNodes)
      })
    );

    await mockStore.dispatch(searchNodes({ 
      query: '테스트', 
      tags: ['태그1', '태그2'] 
    }));
    const state = mockStore.getState().search;

    expect(state.nodes).toEqual(mockNodes);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });
}); 