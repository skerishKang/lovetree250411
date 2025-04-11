import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchNodes } from '@/features/tree/treeSlice';
import { useDebounce } from '@/hooks/useDebounce';

const SearchBar = () => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const debouncedSearch = useDebounce(search, 500);

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleTagSelect = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      fetchNodes({
        search: debouncedSearch,
        tag: selectedTags.join(','),
      })
    );
  };

  const popularTags = ['입덕', '팬심', '폴인럽', '썸'];

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="검색어를 입력하세요"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {popularTags.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagSelect(tag)}
            className={`rounded-full px-3 py-1 text-sm transition-colors ${
              selectedTags.includes(tag)
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar; 