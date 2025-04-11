import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../features/store';
import { setSortBy } from '../features/posts/postsSlice';
import { Menu } from '@headlessui/react';

const SortPosts = () => {
  const dispatch = useDispatch();
  const { sortBy } = useSelector((state: RootState) => state.posts);

  const handleSort = (value: 'latest' | 'popular') => {
    dispatch(setSortBy(value));
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
        <span className="text-sm font-medium">
          {sortBy === 'latest' ? '최신순' : '인기순'}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </Menu.Button>
      <Menu.Items className="absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div className="py-1">
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => handleSort('latest')}
                className={`${
                  active ? 'bg-gray-100' : ''
                } block w-full text-left px-4 py-2 text-sm ${
                  sortBy === 'latest' ? 'text-blue-600 font-medium' : 'text-gray-700'
                }`}
              >
                최신순
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => handleSort('popular')}
                className={`${
                  active ? 'bg-gray-100' : ''
                } block w-full text-left px-4 py-2 text-sm ${
                  sortBy === 'popular' ? 'text-blue-600 font-medium' : 'text-gray-700'
                }`}
              >
                인기순
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
};

export default SortPosts; 