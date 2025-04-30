import React from 'react';

const ExplorePage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">탐색 페이지</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-700">
          다양한 트리들을 탐색할 수 있는 페이지입니다.
          추후 여기에 트리 목록, 검색 필터 등이 표시될 예정입니다.
        </p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border p-4 rounded shadow h-32 bg-gray-100 flex items-center justify-center text-gray-500">트리 카드 1</div>
          <div className="border p-4 rounded shadow h-32 bg-gray-100 flex items-center justify-center text-gray-500">트리 카드 2</div>
          <div className="border p-4 rounded shadow h-32 bg-gray-100 flex items-center justify-center text-gray-500">트리 카드 3</div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage; 