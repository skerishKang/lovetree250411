import React, { useState } from 'react';
import { X, ChevronDown, Youtube, Instagram, Twitter, Users, ShoppingBag, Calendar, Image } from 'lucide-react';

const AddNodeModal = () => {
  const [nodeType, setNodeType] = useState('');
  const [nodeTitle, setNodeTitle] = useState('');
  const [nodeUrl, setNodeUrl] = useState('');
  const [nodeMemo, setNodeMemo] = useState('');
  const currentStage = '입덕';
  
  const nodeTypes = [
    { id: 'youtube', name: '유튜브', icon: <Youtube className="w-5 h-5" /> },
    { id: 'instagram', name: '인스타그램', icon: <Instagram className="w-5 h-5" /> },
    { id: 'twitter', name: '트위터', icon: <Twitter className="w-5 h-5" /> },
    { id: 'community', name: '커뮤니티', icon: <Users className="w-5 h-5" /> },
    { id: 'shop', name: '쇼핑', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'event', name: '이벤트', icon: <Calendar className="w-5 h-5" /> }
  ];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">새 노드 추가하기</h3>
          <button className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">단계</label>
          <div className="relative">
            <select className="w-full border border-gray-300 rounded-md p-2 text-sm appearance-none pr-10">
              <option>{currentStage}</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">노드 유형</label>
          <div className="grid grid-cols-3 gap-2">
            {nodeTypes.map(type => (
              <button 
                key={type.id}
                className={`flex flex-col items-center p-2 rounded-lg border ${
                  nodeType === type.id 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setNodeType(type.id)}
              >
                <div className={`w-8 h-8 rounded-full mb-1 flex items-center justify-center ${
                  nodeType === type.id ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500'
                }`}>
                  {type.icon}
                </div>
                <span className="text-xs">{type.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">노드 제목</label>
          <input 
            type="text" 
            value={nodeTitle}
            onChange={(e) => setNodeTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm" 
            placeholder="예: Felix 댄스 영상"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">콘텐츠 URL</label>
          <input 
            type="text"
            value={nodeUrl}
            onChange={(e) => setNodeUrl(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm" 
            placeholder="https://youtube.com/..."
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">썸네일</label>
          <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
            <div className="flex flex-col items-center justify-center text-gray-400">
              <Image size={24} className="mb-2" />
              <span className="text-xs">썸네일 이미지 추가</span>
              <span className="text-xs">(자동으로 생성됩니다)</span>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2">메모</label>
          <textarea 
            value={nodeMemo}
            onChange={(e) => setNodeMemo(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm" 
            rows="3"
            placeholder="이 콘텐츠에 대한 메모나 느낌을 기록하세요"
          ></textarea>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
            취소
          </button>
          <button className="px-4 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600">
            추가하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNodeModal;