import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { fetchTrees } from '../features/trees/treeSlice';

const Trees = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { trees, loading, error } = useSelector((state: RootState) => state.trees);

  useEffect(() => {
    console.log('트리 목록을 불러오는 중...');
    dispatch(fetchTrees() as any)
      .then(() => console.log('트리 목록 불러오기 성공'))
      .catch((err: any) => console.error('트리 목록 불러오기 실패:', err));
  }, [dispatch]);

  // 로딩 상태 처리
  if (loading === 'pending') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="text-gray-600">
            <svg className="animate-spin h-8 w-8 text-gray-500 mr-2 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            트리 목록을 불러오는 중...
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">오류가 발생했습니다</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => dispatch(fetchTrees() as any)} 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            다시 시도하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="trees-container min-h-screen w-full max-w-full p-2 sm:p-4 overflow-x-auto">
      <div className="bg-white rounded-lg shadow p-4 w-full max-w-4xl mx-auto flex flex-col gap-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">트리 목록</h1>
          <button
            onClick={() => navigate('/trees/create')}
            className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
          >
            새 트리 만들기
          </button>
        </div>

        {!trees || trees.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-6 rounded-lg text-center">
            <h2 className="text-lg font-semibold mb-4">아직 생성된 트리가 없습니다</h2>
            <p className="mb-4">새로운 트리를 만들어보세요!</p>
            <button
              onClick={() => navigate('/trees/create')}
              className="px-6 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
            >
              첫 번째 트리 만들기
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {trees.map((tree) => (
              <div
                key={tree._id}
                className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">{tree.title}</h2>
                      <p className="text-gray-600">{tree.description}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(tree.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">ID:</span> {tree._id}
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/trees/${tree._id}`}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                      >
                        자세히 보기
                      </Link>
                      <Link
                        to={`/trees/${tree._id}/edit`}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
                      >
                        편집하기
                      </Link>
                    </div>
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

export default Trees; 