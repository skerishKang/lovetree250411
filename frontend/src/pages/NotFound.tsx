import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="notfound-container min-h-screen w-full max-w-full p-2 sm:p-4 overflow-x-auto flex items-center justify-center">
      <div className="bg-white rounded-lg shadow p-8 w-full max-w-md mx-auto flex flex-col gap-4 items-center text-center">
        <h1 className="text-4xl font-bold text-pink-500 mb-4">404</h1>
        <p className="text-lg text-gray-700 mb-6">페이지를 찾을 수 없습니다.</p>
        <button className="w-full sm:w-auto py-2 px-4 text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">홈으로 이동</button>
      </div>
    </div>
  );
};

export default NotFound; 