import React from 'react';

const LatestPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">최신 페이지</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-700">
          가장 최근에 생성되거나 업데이트된 트리들을 보여주는 페이지입니다.
          추후 여기에 최신 트리 목록이 시간 순서대로 표시될 예정입니다.
        </p>
        <div className="mt-6 space-y-6">
          <div className="border p-4 rounded shadow bg-gray-100">
            <h3 className="font-semibold mb-2">최신 트리 제목 1</h3>
            <p className="text-sm text-gray-600">내용 미리보기...</p>
          </div>
          <div className="border p-4 rounded shadow bg-gray-100">
            <h3 className="font-semibold mb-2">최신 트리 제목 2</h3>
            <p className="text-sm text-gray-600">내용 미리보기...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatestPage; 