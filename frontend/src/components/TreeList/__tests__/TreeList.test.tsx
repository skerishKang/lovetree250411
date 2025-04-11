import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import TreeList from '../index';
import { treeSlice } from '../../../store/slices/treeSlice';

const mockNodes = [
  {
    id: '1',
    title: '테스트 노드 1',
    description: '테스트 설명 1',
    media: {
      type: 'image',
      url: 'https://example.com/image1.jpg',
    },
    createdAt: '2024-01-01T00:00:00Z',
    comments: 5,
    likes: 10,
  },
  {
    id: '2',
    title: '테스트 노드 2',
    description: '테스트 설명 2',
    media: {
      type: 'video',
      url: 'https://example.com/video1.mp4',
    },
    createdAt: '2024-01-02T00:00:00Z',
    comments: 3,
    likes: 8,
  },
];

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      tree: treeSlice.reducer,
    },
    preloadedState: {
      tree: {
        nodes: mockNodes,
        loading: false,
        error: null,
        ...initialState,
      },
    },
  });
};

describe('TreeList', () => {
  it('should render tree nodes', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <TreeList />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('테스트 노드 1')).toBeInTheDocument();
    expect(screen.getByText('테스트 설명 1')).toBeInTheDocument();
    expect(screen.getByText('테스트 노드 2')).toBeInTheDocument();
    expect(screen.getByText('테스트 설명 2')).toBeInTheDocument();
  });

  it('should render media content', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <TreeList />
        </MemoryRouter>
      </Provider>
    );

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(1);
    expect(images[0]).toHaveAttribute('src', 'https://example.com/image1.jpg');

    const videos = screen.getAllByRole('video');
    expect(videos).toHaveLength(1);
    expect(videos[0]).toHaveAttribute('src', 'https://example.com/video1.mp4');
  });

  it('should display metadata', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <TreeList />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should handle like button click', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <TreeList />
        </MemoryRouter>
      </Provider>
    );

    const likeButtons = screen.getAllByRole('button', { name: /좋아요/ });
    fireEvent.click(likeButtons[0]);

    // Add assertions for like behavior
  });

  it('should display loading state', () => {
    const store = createTestStore({ loading: true });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <TreeList />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('should display error state', () => {
    const store = createTestStore({ error: '데이터를 불러오는 중 오류가 발생했습니다.' });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <TreeList />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('데이터를 불러오는 중 오류가 발생했습니다.')).toBeInTheDocument();
  });
}); 