import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState({
    trees: [],
    users: [],
    singers: [],
    groups: []
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const search = async () => {
      if (!searchTerm.trim()) {
        setSearchResults({ trees: [], users: [], singers: [], groups: [] });
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) throw new Error('검색에 실패했습니다.');
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('검색 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(search, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const renderResults = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!searchTerm.trim()) {
      return (
        <div className="text-center text-gray-500 py-8">
          검색어를 입력하세요
        </div>
      );
    }

    const results = activeTab === 'all' 
      ? [...searchResults.trees, ...searchResults.users, ...searchResults.singers, ...searchResults.groups]
      : searchResults[activeTab];

    if (results.length === 0) {
      return (
        <div className="text-center text-gray-500 py-8">
          검색 결과가 없습니다
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            {item.type === 'tree' && (
              <Link to={`/trees/${item._id}`}>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
                <div className="mt-2 text-sm text-gray-500">
                  작성자: {item.author.username}
                </div>
              </Link>
            )}
            {item.type === 'user' && (
              <Link to={`/profile/${item._id}`}>
                <div className="flex items-center space-x-3">
                  <img
                    src={item.profileImage || '/default-profile.png'}
                    alt={item.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{item.username}</h3>
                    <p className="text-gray-600 text-sm">{item.bio}</p>
                  </div>
                </div>
              </Link>
            )}
            {item.type === 'singer' && (
              <div>
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-gray-600 text-sm">{item.group}</p>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">팔로워: {item.followers}</span>
                </div>
              </div>
            )}
            {item.type === 'group' && (
              <div>
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">팔로워: {item.followers}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="search-container min-h-screen w-full max-w-full p-2 sm:p-4 overflow-x-auto">
      <div className="bg-white rounded-lg shadow p-4 w-full max-w-3xl mx-auto flex flex-col gap-4">
        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="트리, 사용자, 가수, 그룹을 검색하세요..."
            className="w-full py-2 px-4 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setActiveTab('trees')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'trees'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              트리
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              사용자
            </button>
            <button
              onClick={() => setActiveTab('singers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'singers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              가수
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'groups'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              그룹
            </button>
          </nav>
        </div>

        {renderResults()}
      </div>
    </div>
  );
};

export default Search; 