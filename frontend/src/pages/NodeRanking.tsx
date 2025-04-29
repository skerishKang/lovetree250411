import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const NodeRanking: React.FC = () => {
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/nodes/rank');
        if (!res.ok) throw new Error('인기 노드 정보를 불러오지 못했습니다.');
        const data = await res.json();
        setNodes(data);
      } catch (err: any) {
        setError(err.message || '에러가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, []);

  return (
    <div className="node-ranking-container min-h-screen w-full max-w-full p-2 sm:p-4 overflow-x-auto">
      <div className="bg-white rounded-lg shadow p-4 w-full max-w-2xl mx-auto flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-6">노드 랭킹</h1>
        {loading ? (
          <div className="text-center text-gray-500 py-8">로딩 중...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {nodes.map((node, idx) => (
              <div key={node.id || node._id} className="bg-white rounded-xl shadow hover:shadow-lg transition-all p-5 flex gap-4 items-center relative">
                <div className="absolute -top-3 -left-3 bg-yellow-400 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center text-lg shadow">{idx+1}</div>
                <div className="flex-1">
                  <Link to={`/trees/${node.tree?.id || node.treeId || node.tree?._id}`} className="text-blue-600 text-sm hover:underline">[{node.tree?.title || node.treeTitle || '트리'}]</Link>
                  <div className="text-lg font-semibold mt-1">{node.title}</div>
                  <div className="text-sm text-gray-500 mt-1">by {node.author?.name || node.authorName || '알 수 없음'}</div>
                  <div className="flex gap-4 mt-2">
                    <span className="text-red-500 font-bold">❤️ {node.likes?.length ?? node.likes ?? 0}</span>
                    <span className="text-blue-500 font-bold">💬 {node.comments?.length ?? node.comments ?? 0}</span>
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

export default NodeRanking; 