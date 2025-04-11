import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import SearchBar from '../index';
import { treeSlice } from '../../../store/slices/treeSlice';

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      tree: treeSlice.reducer,
    },
    preloadedState: {
      tree: {
        nodes: [],
        loading: false,
        error: null,
        ...initialState,
      },
    },
  });
};

describe('SearchBar', () => {
  it('should render search input and submit button', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchBar />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByPlaceholderText('검색어를 입력하세요')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '검색' })).toBeInTheDocument();
  });

  it('should update search input value', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchBar />
        </MemoryRouter>
      </Provider>
    );

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    fireEvent.change(searchInput, { target: { value: '테스트 검색어' } });
    expect(searchInput).toHaveValue('테스트 검색어');
  });

  it('should render popular tags', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchBar />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('인기 태그')).toBeInTheDocument();
    expect(screen.getByText('사랑')).toBeInTheDocument();
    expect(screen.getByText('감사')).toBeInTheDocument();
    expect(screen.getByText('축하')).toBeInTheDocument();
  });

  it('should handle tag selection', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchBar />
        </MemoryRouter>
      </Provider>
    );

    const tagButton = screen.getByText('사랑');
    fireEvent.click(tagButton);
    expect(tagButton).toHaveClass('bg-pink-500');
  });

  it('should handle tag deselection', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchBar />
        </MemoryRouter>
      </Provider>
    );

    const tagButton = screen.getByText('사랑');
    fireEvent.click(tagButton);
    fireEvent.click(tagButton);
    expect(tagButton).not.toHaveClass('bg-pink-500');
  });

  it('should handle search submission', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchBar />
        </MemoryRouter>
      </Provider>
    );

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    const submitButton = screen.getByRole('button', { name: '검색' });

    fireEvent.change(searchInput, { target: { value: 'test query' } });
    fireEvent.click(submitButton);

    // Add assertions for search submission behavior
  });

  it('should display loading state', () => {
    const loadingStore = createTestStore({ loading: true });
    render(
      <Provider store={loadingStore}>
        <MemoryRouter>
          <SearchBar />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('검색 중...')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    const errorStore = createTestStore({ error: '검색 중 오류가 발생했습니다.' });
    render(
      <Provider store={errorStore}>
        <MemoryRouter>
          <SearchBar />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('검색 중 오류가 발생했습니다.')).toBeInTheDocument();
  });

  it('should clear search input and selected tags', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchBar />
        </MemoryRouter>
      </Provider>
    );

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    const clearButton = screen.getByRole('button', { name: '초기화' });

    fireEvent.change(searchInput, { target: { value: 'test query' } });
    fireEvent.click(clearButton);

    expect(searchInput).toHaveValue('');
    // Add assertions for cleared tags
  });
}); 