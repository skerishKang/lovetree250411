import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useTree } from '../useTree';
import treeReducer from '../../features/tree/treeSlice';

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
    comments: 3
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
    comments: 1
  }
];

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      tree: treeReducer
    },
    preloadedState: {
      tree: {
        nodes: mockTreeNodes,
        loading: false,
        error: null,
        ...initialState
      }
    }
  });
};

describe('useTree', () => {
  it('should return initial tree state', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useTree(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    });

    expect(result.current.nodes).toEqual(mockTreeNodes);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    // 함수들이 존재하는지 확인
    expect(typeof result.current.getNodes).toBe('function');
    expect(typeof result.current.createTreeNode).toBe('function');
    expect(typeof result.current.updateTreeNode).toBe('function');
    expect(typeof result.current.deleteTreeNode).toBe('function');
    expect(typeof result.current.toggleLike).toBe('function');
    expect(typeof result.current.addNodeComment).toBe('function');
    expect(typeof result.current.deleteNodeComment).toBe('function');
  });

  it('should handle loading state', () => {
    const store = createTestStore({ loading: true });
    const { result } = renderHook(() => useTree(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    });

    expect(result.current.loading).toBe(true);
  });

  it('should handle error state', () => {
    const error = '트리 노드를 불러오는 중 오류가 발생했습니다.';
    const store = createTestStore({ error });
    const { result } = renderHook(() => useTree(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    });

    expect(result.current.error).toBe(error);
  });
}); 