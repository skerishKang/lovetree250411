import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../features/store';
import { searchAll, clearResults } from '../features/search/searchSlice';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Transition } from '@headlessui/react';

const Search: React.FC = () => {
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { results, loading } = useSelector((state: RootState) => state.search);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (query.trim()) {
      const timer = setTimeout(() => {
        dispatch(searchAll(query));
      }, 300);

      return () => clearTimeout(timer);
    } else {
      dispatch(clearResults());
    }
  }, [dispatch, query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative" ref={searchRef}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="검색..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <Transition
        show={isOpen && query.trim() !== ''}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
        className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg"
      >
        <div className="p-4">
          {loading ? (
            <div className="text-center py-4">검색 중...</div>
          ) : (
            <>
              {results.users.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">사용자</h3>
                  <div className="space-y-2">
                    {results.users.map((user) => (
                      <Link
                        key={user.id}
                        to={`/profile/${user.id}`}
                        onClick={handleResultClick}
                        className="flex items-center p-2 hover:bg-gray-50 rounded-lg"
                      >
                        <img
                          src={user.profileImage || '/default-profile.png'}
                          alt={user.username}
                          className="w-8 h-8 rounded-full mr-3"
                        />
                        <span>{user.username}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.posts.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">게시물</h3>
                  <div className="space-y-2">
                    {results.posts.map((post) => (
                      <Link
                        key={post.id}
                        to={`/post/${post.id}`}
                        onClick={handleResultClick}
                        className="block p-2 hover:bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center mb-2">
                          <img
                            src={post.author.profileImage || '/default-profile.png'}
                            alt={post.author.username}
                            className="w-6 h-6 rounded-full mr-2"
                          />
                          <span className="font-semibold">{post.author.username}</span>
                          <span className="text-gray-500 text-sm ml-2">
                            {formatDistanceToNow(new Date(post.createdAt), {
                              addSuffix: true,
                              locale: ko,
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {post.content}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.users.length === 0 && results.posts.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  검색 결과가 없습니다.
                </div>
              )}
            </>
          )}
        </div>
      </Transition>
    </div>
  );
};

export default Search; 