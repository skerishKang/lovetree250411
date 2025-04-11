import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import TreeNode from '../index';
import treeSlice from '../../../store/slices/treeSlice';

const mockNode = {
  id: '1',
  title: '테스트 노드',
  content: '테스트 내용',
  author: {
    id: '1',
    username: '테스트 사용자',
    email: 'test@example.com',
    profileImage: 'test-image.jpg'
  },
  tags: ['태그1', '태그2'],
  likes: 5,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
};

const mockStore = configureStore({
  reducer: {
    tree: treeSlice
  },
  preloadedState: {
    tree: {
      nodes: [mockNode],
      selectedNode: null,
      loading: false,
      error: null
    }
  }
});

describe('TreeNode Component', () => {
  it('should render node information correctly', () => {
    render(
      <Provider store={mockStore}>
        <MemoryRouter>
          <TreeNode node={mockNode} />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('테스트 노드')).toBeInTheDocument();
    expect(screen.getByText('테스트 내용')).toBeInTheDocument();
    expect(screen.getByText('테스트 사용자')).toBeInTheDocument();
    expect(screen.getByText('태그1')).toBeInTheDocument();
    expect(screen.getByText('태그2')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should handle like button click', () => {
    render(
      <Provider store={mockStore}>
        <MemoryRouter>
          <TreeNode node={mockNode} />
        </MemoryRouter>
      </Provider>
    );

    const likeButton = screen.getByRole('button', { name: /좋아요/ });
    fireEvent.click(likeButton);
    
    // TODO: 좋아요 상태 변경 확인
  });

  it('should navigate to node detail page when clicked', () => {
    render(
      <Provider store={mockStore}>
        <MemoryRouter>
          <TreeNode node={mockNode} />
        </MemoryRouter>
      </Provider>
    );

    const nodeLink = screen.getByRole('link', { name: /테스트 노드/ });
    expect(nodeLink).toHaveAttribute('href', '/node/1');
  });

  it('should display formatted date', () => {
    render(
      <Provider store={mockStore}>
        <MemoryRouter>
          <TreeNode node={mockNode} />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/2024년 1월 1일/)).toBeInTheDocument();
  });

  it('should display loading state', () => {
    const loadingStore = configureStore({
      reducer: {
        tree: treeSlice
      },
      preloadedState: {
        tree: {
          nodes: [],
          selectedNode: null,
          loading: true,
          error: null
        }
      }
    });

    render(
      <Provider store={loadingStore}>
        <MemoryRouter>
          <TreeNode node={mockNode} />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });
}); 