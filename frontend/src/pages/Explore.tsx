import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api/axios';

const Explore = () => {
  const [activeTab, setActiveTab] = useState<'popular' | 'latest'>('popular');
  const [trees, setTrees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrees = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/trees/explore?sort=${activeTab}`);
        setTrees(response.data);
      } catch (err: any) {
        console.error('트리 목록 가져오기 실패:', err);
        setError(err.response?.data?.message || err.message || '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrees();
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">오류 발생!</strong>
          <p className="block sm:inline"> {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="explore-container min-h-screen w-full max-w-full p-2 sm:p-4 overflow-x-auto">
      <div className="bg-white rounded-lg shadow p-4 w-full max-w-4xl mx-auto flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <button
            onClick={() => setActiveTab('popular')}
            className={`w-full sm:w-auto py-2 px-4 text-base ${
              activeTab === 'popular'
                ? 'bg-blue-500 text-white rounded-lg hover:bg-blue-600'
                : 'bg-gray-500 text-white rounded-lg hover:bg-gray-600'
            }`}
          >
            인기 트리
          </button>
          <button
            onClick={() => setActiveTab('latest')}
            className={`w-full sm:w-auto py-2 px-4 text-base ${
              activeTab === 'latest'
                ? 'bg-blue-500 text-white rounded-lg hover:bg-blue-600'
                : 'bg-gray-500 text-white rounded-lg hover:bg-gray-600'
            }`}
          >
            최신 트리
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trees.map((tree) => (
            <Link
              key={tree._id}
              to={`/trees/${tree._id}`}
              className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{tree.title}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {tree.description || '설명이 없습니다.'}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{tree.author.username}</span>
                  <span>
                    {new Date(tree.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explore; 