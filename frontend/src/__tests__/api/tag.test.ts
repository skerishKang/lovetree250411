import { configureStore } from '@reduxjs/toolkit';
import tagSlice from '../../store/slices/tagSlice';
import { fetchTags, createTag, updateTag, deleteTag } from '../../store/thunks/tagThunks';

const mockStore = configureStore({
  reducer: {
    tag: tagSlice
  }
});

describe('Tag API Tests', () => {
  beforeEach(() => {
    mockStore.dispatch({ type: 'RESET' });
  });

  it('should fetch tags successfully', async () => {
    const mockTags = [
      {
        id: '1',
        name: '태그1',
        description: '첫 번째 태그',
        color: '#FF0000',
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    ];

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTags)
      })
    );

    await mockStore.dispatch(fetchTags());
    const state = mockStore.getState().tag;

    expect(state.tags).toEqual(mockTags);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle tag fetch error', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: '서버 오류' })
      })
    );

    await mockStore.dispatch(fetchTags());
    const state = mockStore.getState().tag;

    expect(state.tags).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('서버 오류');
  });

  it('should create tag successfully', async () => {
    const newTag = {
      name: '새 태그',
      description: '새로운 태그',
      color: '#00FF00'
    };

    const mockResponse = {
      id: '2',
      ...newTag,
      createdAt: '2024-01-02T00:00:00.000Z'
    };

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })
    );

    await mockStore.dispatch(createTag(newTag));
    const state = mockStore.getState().tag;

    expect(state.tags).toContainEqual(mockResponse);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should update tag successfully', async () => {
    const updatedTag = {
      id: '1',
      name: '수정된 태그',
      description: '수정된 설명',
      color: '#0000FF'
    };

    const mockResponse = {
      ...updatedTag,
      createdAt: '2024-01-01T00:00:00.000Z'
    };

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })
    );

    await mockStore.dispatch(updateTag(updatedTag));
    const state = mockStore.getState().tag;

    expect(state.tags.find(t => t.id === '1')?.name).toBe('수정된 태그');
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should delete tag successfully', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      })
    );

    await mockStore.dispatch(deleteTag('1'));
    const state = mockStore.getState().tag;

    expect(state.tags.find(t => t.id === '1')).toBeUndefined();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle validation errors', async () => {
    const invalidTag = {
      name: '', // 빈 이름
      description: '설명',
      color: '#FF0000'
    };

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: '태그 이름은 필수입니다.' })
      })
    );

    await mockStore.dispatch(createTag(invalidTag));
    const state = mockStore.getState().tag;

    expect(state.error).toBe('태그 이름은 필수입니다.');
    expect(state.loading).toBe(false);
  });

  it('should handle duplicate tag name', async () => {
    const duplicateTag = {
      name: '태그1', // 이미 존재하는 태그 이름
      description: '설명',
      color: '#FF0000'
    };

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 409,
        json: () => Promise.resolve({ message: '이미 존재하는 태그 이름입니다.' })
      })
    );

    await mockStore.dispatch(createTag(duplicateTag));
    const state = mockStore.getState().tag;

    expect(state.error).toBe('이미 존재하는 태그 이름입니다.');
    expect(state.loading).toBe(false);
  });
}); 