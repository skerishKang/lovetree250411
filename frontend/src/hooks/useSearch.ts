import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from './useDebounce';

interface SearchParams {
  query: string;
  tags: string[];
}

export const useSearch = (initialParams: SearchParams = { query: '', tags: [] }) => {
  const [searchParams, setSearchParams] = useState<SearchParams>(initialParams);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedQuery = useDebounce(searchParams.query, 500);

  const updateQuery = useCallback((query: string) => {
    setSearchParams((prev) => ({ ...prev, query }));
  }, []);

  const updateTags = useCallback((tags: string[]) => {
    setSearchParams((prev) => ({ ...prev, tags }));
  }, []);

  const addTag = useCallback((tag: string) => {
    setSearchParams((prev) => ({
      ...prev,
      tags: [...prev.tags, tag],
    }));
  }, []);

  const removeTag = useCallback((tagToRemove: string) => {
    setSearchParams((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  }, []);

  const clearSearch = useCallback(() => {
    setSearchParams({ query: '', tags: [] });
  }, []);

  useEffect(() => {
    if (debouncedQuery || searchParams.tags.length > 0) {
      setIsSearching(true);
      // 여기에 실제 검색 API 호출 로직을 추가할 수 있습니다.
      // 예: dispatch(fetchSearchResults(debouncedQuery, searchParams.tags));
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [debouncedQuery, searchParams.tags]);

  return {
    searchParams,
    isSearching,
    updateQuery,
    updateTags,
    addTag,
    removeTag,
    clearSearch,
  };
}; 