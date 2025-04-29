import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const TreeRanking: React.FC = () => {
  const [trees, setTrees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/trees/rank');
        if (!res.ok) throw new Error('인기 트리 정보를 불러오지 못했습니다.');
        const data = await res.json();
        setTrees(data);
      } catch (err: any) {
        setError(err.message || '에러가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, []);

  return (
    <div className="tree-ranking-container min-h-screen w-full max-w-full p-2 sm:p-4 overflow-x-auto">
      <div className="bg-white rounded-lg shadow p-4 w-full max-w-2xl mx-auto flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-6">트리 랭킹</h1>
        {loading ? (
          <div className="text-center text-gray-500 py-8">로딩 중...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trees.map((tree, idx) => (
              <div key={tree.id || tree._id} className="bg-white rounded-xl shadow hover:shadow-lg transition-all p-5 flex gap-4 items-center relative">
                <div className="absolute -top-3 -left-3 bg-yellow-400 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center text-lg shadow">{idx+1}</div>
                <img
                  src={tree.mediaImage || '/tree-default.png'}
                  alt="대표 이미지"
                  className="w-20 h-20 object-cover rounded-lg border"
                />
                <div className="flex-1">
                  <Link to={`/trees/${tree.id || tree._id}`} className="text-lg font-semibold hover:underline">{tree.title}</Link>
                  <div className="text-sm text-gray-500 mt-1">by {tree.author?.name || tree.authorName || '알 수 없음'}</div>
                  <div className="flex gap-4 mt-2">
                    <span className="text-red-500 font-bold">❤️ {tree.likes?.length ?? tree.likes ?? 0}</span>
                    <span className="text-blue-500 font-bold">👥 {tree.followers?.length ?? tree.followers ?? 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TreeRanking; 