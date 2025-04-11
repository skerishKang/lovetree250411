import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { fetchTreeById } from '../features/trees/treeSlice';

const TreeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentTree, loading, error } = useSelector((state: RootState) => state.trees);

  useEffect(() => {
    if (id) {
      console.log('트리 상세 정보 조회 시도:', id);
      dispatch(fetchTreeById(id) as any);
    }
  }, [dispatch, id]);

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
            트리 정보를 불러오는 중...
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
            onClick={() => navigate('/trees')} 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            트리 목록으로 이동
          </button>
        </div>
      </div>
    );
  }

  // 트리 데이터가 없는 경우 처리
  if (!currentTree) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">트리를 찾을 수 없습니다</h2>
          <p className="mb-4">요청하신 트리가 존재하지 않거나 삭제되었을 수 있습니다.</p>
          <button 
            onClick={() => navigate('/trees')} 
            className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
          >
            트리 목록으로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">{currentTree.title}</h1>
              <p className="text-gray-600">{currentTree.description}</p>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(currentTree.createdAt).toLocaleDateString()}
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-2">트리 정보</h2>
            <p className="mb-2"><strong>ID:</strong> {currentTree._id}</p>
            <p><strong>생성일:</strong> {new Date(currentTree.createdAt).toLocaleDateString()}</p>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/trees')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              목록으로 돌아가기
            </button>
            <button 
              onClick={() => navigate(`/trees/${currentTree._id}/edit`)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              트리 편집하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreeDetail; 