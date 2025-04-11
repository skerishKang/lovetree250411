import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">페이지를 찾을 수 없습니다</p>
        <p className="text-gray-500 mb-8">요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.</p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            홈으로 이동
          </button>
          <button 
            onClick={() => navigate('/trees')}
            className="px-6 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
          >
            트리 목록으로 이동
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 