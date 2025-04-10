import React, { useState } from 'react';
import { Heart, Plus, User, Settings, Globe, Lock, Eye, Clock, Search } from 'lucide-react';

const LoveTreeHome = () => {
  const [activeTab, setActiveTab] = useState('trending');
  
  // 샘플 트리 데이터
  const sampleTrees = [
    { id: 1, username: 'felix_fan', starName: 'Felix', type: 'Kpop', likes: 245, nodes: 34, isPublic: true },
    { id: 2, username: 'drama_lover', starName: '오타니', type: '스포츠', likes: 182, nodes: 28, isPublic: true },
    { id: 3, username: 'newtron', starName: '뉴진스 하니', type: 'Kpop', likes: 312, nodes: 42, isPublic: true },
    { id: 4, username: 'anime_otaku', starName: '귀멸의 칼날', type: '애니메이션', likes: 167, nodes: 23, isPublic: true }
  ];
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Heart className="text-red-500 h-6 w-6 mr-2" />
            <h1 className="text-xl font-bold">러브 트리</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition">
              <Plus size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition">
              <User size={20} />
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-6">
        {/* 검색창 */}
        <div className="relative mb-6">
          <div className="flex items-center bg-white rounded-full border border-gray-300 px-4 py-2 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100">
            <Search size={18} className="text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="스타, 그룹, 콘텐츠 검색..." 
              className="w-full outline-none text-sm"
            />
          </div>
          <div className="absolute top-full left-0 right-0 mt-1 flex flex-wrap gap-2 py-2">
            <button className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50">
              #Kpop
            </button>
            <button className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50">
              #드라마
            </button>
            <button className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50">
              #애니
            </button>
            <button className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50">
              #뉴진스
            </button>
          </div>
        </div>
        
        {/* 탭 */}
        <div className="flex space-x-2 border-b border-gray-200">
          <button
            className={`py-2 px-4 ${activeTab === 'trending' ? 'text-red-500 border-b-2 border-red-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('trending')}
          >
            인기 트리
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'recent' ? 'text-red-500 border-b-2 border-red-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('recent')}
          >
            최신 트리
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'following' ? 'text-red-500 border-b-2 border-red-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('following')}
          >
            팔로잉
          </button>
        </div>
        
        {/* 트리 카드 목록 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleTrees.map(tree => (
            <div 
              key={tree.id}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
            >
              <div className="relative">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 h-40 flex items-center justify-center">
                  <img src="/api/placeholder/400/320" alt="Tree preview" className="object-cover w-full h-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 flex items-center text-white">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden mr-2">
                      <img src="/api/placeholder/40/40" alt={tree.username} className="object-cover" />
                    </div>
                    <span className="font-medium text-sm">{tree.username}</span>
                  </div>
                  <div className="absolute top-3 right-3">
                    {tree.isPublic ? (
                      <Globe size={18} className="text-white" />
                    ) : (
                      <Lock size={18} className="text-white" />
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg flex items-center">
                  {tree.starName}
                  <Heart className="w-4 h-4 ml-1 text-red-500 inline-block fill-current" />
                </h3>
                <p className="text-gray-500 text-sm">{tree.type}</p>
                <div className="mt-3 flex justify-between items-center">
                  <div className="flex items-center text-gray-500 text-sm">
                    <Heart className="w-4 h-4 mr-1" />
                    <span>{tree.likes}</span>
                    <div className="mx-2 h-4 border-l border-gray-300"></div>
                    <Eye className="w-4 h-4 mr-1" />
                    <span>{tree.nodes} 노드</span>
                  </div>
                  <div className="text-xs text-gray-400 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>3일 전</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      
      {/* 하단 네비게이션 */}
      <div className="bg-white border-t border-gray-200 py-3 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-around">
            <button className="flex flex-col items-center text-red-500">
              <Globe size={20} />
              <span className="text-xs mt-1">탐색</span>
            </button>
            <button className="flex flex-col items-center text-gray-500">
              <Plus size={20} />
              <span className="text-xs mt-1">생성</span>
            </button>
            <button className="flex flex-col items-center text-gray-500">
              <Heart size={20} />
              <span className="text-xs mt-1">소식</span>
            </button>
            <button className="flex flex-col items-center text-gray-500">
              <User size={20} />
              <span className="text-xs mt-1">프로필</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoveTreeHome;