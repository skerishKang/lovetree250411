import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../features/store';
import { search, setQuery, clearResults } from '../features/search/searchSlice';
import { Link } from 'react-router-dom';
import { Transition } from '@headlessui/react';
import { Fragment } from 'react';

const SearchBar = () => {
  const dispatch = useDispatch();
  const { results, loading, error, query } = useSelector((state: RootState) => state.search);
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery) {
      dispatch(search(debouncedQuery));
    } else {
      dispatch(clearResults());
    }
  }, [debouncedQuery, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setQuery(e.target.value));
    setIsOpen(true);
  };

  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div className="relative">
      <div className="flex items-center">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          placeholder="검색..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {query && (
          <button
            onClick={() => dispatch(clearResults())}
            className="absolute right-10 text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      <Transition
        show={isOpen && (query.length > 0 || loading || error)}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-150"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <div className="py-2">
              {results.posts.length > 0 && (
                <div className="px-4 py-2">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">게시물</h3>
                  {results.posts.map((post) => (
                    <Link
                      key={post.id}
                      to={`/posts/${post.id}`}
                      className="block p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <img
                          src={post.author.profileImage || 'https://via.placeholder.com/32'}
                          alt={post.author.username}
                          className="w-6 h-6 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium">{post.author.username}</p>
                          <p className="text-xs text-gray-500 truncate">{post.content}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {results.users.length > 0 && (
                <div className="px-4 py-2">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">사용자</h3>
                  {results.users.map((user) => (
                    <Link
                      key={user.id}
                      to={`/profile/${user.id}`}
                      className="block p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <img
                          src={user.profileImage || 'https://via.placeholder.com/32'}
                          alt={user.username}
                          className="w-6 h-6 rounded-full"
                        />
                        <p className="text-sm font-medium">{user.username}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {results.posts.length === 0 && results.users.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  <p>검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Transition>
    </div>
  );
};

export default SearchBar; 