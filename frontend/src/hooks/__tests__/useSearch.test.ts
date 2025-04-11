import { renderHook, act } from '@testing-library/react';
import { useSearch } from '../useSearch';

// Mock the useDebounce hook
jest.mock('../useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

describe('useSearch', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useSearch());

    expect(result.current.searchParams).toEqual({
      query: '',
      tags: [],
    });
    expect(result.current.isSearching).toBe(false);
  });

  it('should initialize with provided values', () => {
    const initialParams = {
      query: 'test',
      tags: ['tag1'],
    };

    const { result } = renderHook(() => useSearch(initialParams));

    expect(result.current.searchParams).toEqual(initialParams);
  });

  it('should update query', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.updateQuery('new query');
    });

    expect(result.current.searchParams.query).toBe('new query');
  });

  it('should update tags', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.updateTags(['tag1', 'tag2']);
    });

    expect(result.current.searchParams.tags).toEqual(['tag1', 'tag2']);
  });

  it('should add tag', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.addTag('new tag');
    });

    expect(result.current.searchParams.tags).toEqual(['new tag']);
  });

  it('should remove tag', () => {
    const initialParams = {
      query: '',
      tags: ['tag1', 'tag2', 'tag3'],
    };

    const { result } = renderHook(() => useSearch(initialParams));

    act(() => {
      result.current.removeTag('tag2');
    });

    expect(result.current.searchParams.tags).toEqual(['tag1', 'tag3']);
  });

  it('should clear search', () => {
    const initialParams = {
      query: 'test',
      tags: ['tag1', 'tag2'],
    };

    const { result } = renderHook(() => useSearch(initialParams));

    act(() => {
      result.current.clearSearch();
    });

    expect(result.current.searchParams).toEqual({
      query: '',
      tags: [],
    });
  });

  it('should set isSearching to true when query or tags change', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.updateQuery('test');
    });

    expect(result.current.isSearching).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.isSearching).toBe(false);
  });

  it('should set isSearching to true when tags are added', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.addTag('test');
    });

    expect(result.current.isSearching).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.isSearching).toBe(false);
  });
}); 