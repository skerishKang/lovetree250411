import React from 'react';

export const Spinner: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
      <p className="text-gray-600">로딩 중...</p>
    </div>
  );
}; 