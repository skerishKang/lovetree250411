import React from 'react';

const PopularPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">인기 페이지</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-700">
          가장 인기 있는 트리들을 보여주는 페이지입니다.
          추후 여기에 좋아요 순위, 댓글 많은 순위 등이 표시될 예정입니다.
        </p>
        <ul className="mt-6 space-y-4">
          <li className="border p-4 rounded shadow bg-gray-100 text-gray-500">인기 트리 1</li>
          <li className="border p-4 rounded shadow bg-gray-100 text-gray-500">인기 트리 2</li>
          <li className="border p-4 rounded shadow bg-gray-100 text-gray-500">인기 트리 3</li>
        </ul>
      </div>
    </div>
  );
};

export default PopularPage; 