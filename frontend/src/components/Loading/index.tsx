import React from 'react';

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-full min-h-[200px]" data-testid="loading-container">
      <div className="relative">
        <div className="h-12 w-12">
          <div role="status" className="absolute h-12 w-12 rounded-full border-4 border-solid border-gray-200 border-t-blue-500 animate-spin"></div>
        </div>
        <span className="sr-only">로딩 중...</span>
      </div>
    </div>
  );
};

export default Loading; 