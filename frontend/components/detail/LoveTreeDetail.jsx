import React, { useState } from 'react';
import { Heart, Plus, Settings, Share2, Clock } from 'lucide-react';

const LoveTreeDetail = () => {
  const [currentStage, setCurrentStage] = useState('썸');
  const stages = ['썸', '입덕', '팬심', '폴인럽'];
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <button className="text-gray-700 hover:text-gray-900">
            ← 뒤로
          </button>
          <h1 className="text-xl font-bold">Felix 러브 트리</h1>
          <button className="p-2 rounded-full hover:bg-gray-100 transition">
            <Share2 size={20} />
          </button>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          {/* 트리 정보 헤더 */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden mr-3">
                <img src="/api/placeholder/50/50" alt="User" className="object-cover" />
              </div>
              <div>
                <h2 className="font-bold">Felix 러브 트리</h2>
                <p className="text-sm text-gray-500">felix_fan님의 트리</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center text-gray-500 text-sm hover:text-gray-700">
                <Heart className="w-4 h-4 mr-1" />
                <span>245</span>
              </button>
              <button className="p-1.5 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition flex items-center">
                <Plus size={18} />
                <span className="ml-1 text-xs font-medium">노드 추가</span>
              </button>
              <button className="p-1.5 rounded-full hover:bg-gray-100 transition">
                <Settings size={18} className="text-gray-600" />
              </button>
            </div>
          </div>
          
          {/* 스테이지 선택기 */}
          <div className="flex space-x-2 mb-4">
            {stages.map((stage) => (
              <button
                key={stage}
                onClick={() => setCurrentStage(stage)}
                className={`py-1.5 px-3 rounded-full text-sm ${
                  currentStage === stage 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
          
          {/* 진행 상태 바 */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div 
              className="bg-red-500 h-2.5 rounded-full" 
              style={{ 
                width: currentStage === '썸' ? '25%' : 
                       currentStage === '입덕' ? '50%' : 
                       currentStage === '팬심' ? '75%' : '100%' 
              }}
            ></div>
          </div>
          
          {/* 트리 시각화 영역 */}
          <div className="relative bg-gray-50 rounded-lg p-2 mb-6 border border-gray-200 overflow-hidden" style={{ height: '500px' }}>
            {/* 노드와 연결선 시각화 */}
            <TreeVisualization currentStage={currentStage} />
          </div>
          
          {/* 노드 목록 */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-lg">최근 추가된 노드</h3>
              <button className="text-sm text-gray-500 hover:text-gray-700">모두 보기</button>
            </div>
            <div className="space-y-3">
              <NodeItem 
                title="[Kids Room(키즈룸)] Ep.02 Felix" 
                type="유튜브" 
                time="2일 전" 
              />
              <NodeItem 
                title="스트레이 키즈/필릭스 직캠 4K" 
                type="유튜브" 
                time="3일 전" 
              />
              <NodeItem 
                title="Felix 인스타 스토리 모음" 
                type="SNS" 
                time="5일 전" 
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// 노드 아이템 컴포넌트
const NodeItem = ({ title, type, time }) => (
  <div className="flex items-center bg-white border border-gray-200 rounded-md p-3 hover:shadow-sm transition cursor-pointer">
    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center mr-3">
      <img src="/api/placeholder/60/60" alt="Node thumbnail" className="rounded object-cover w-full h-full" />
    </div>
    <div className="flex-grow">
      <h4 className="font-medium text-sm">{title}</h4>
      <div className="flex items-center text-xs text-gray-500 mt-1">
        <span className="bg-gray-100 px-2 py-0.5 rounded">{type}</span>
        <span className="ml-2">{time}</span>
      </div>
    </div>
  </div>
);

// 트리 시각화 컴포넌트
const TreeVisualization = ({ currentStage }) => {
  // 단계별 트리 구조 시각화
  const nodeCount = currentStage === '썸' ? 3 : 
                    currentStage === '입덕' ? 6 : 
                    currentStage === '팬심' ? 9 : 12;
                    
  return (
    <div className="relative w-full h-full">
      {/* SVG 기반 연결선 */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {/* 루트에서 첫 레벨 노드로의 연결선 */}
        <path d="M400,80 C400,120 220,140 220,180" stroke="#FFC0CB" strokeWidth="3" fill="none" />
        <path d="M400,80 C400,120 400,180 400,220" stroke="#FFCBA4" strokeWidth="3" fill="none" />
        <path d="M400,80 C400,120 580,140 580,180" stroke="#AEEEEE" strokeWidth="3" fill="none" />

        {/* 추가적인 연결선 (단계에 따라 조건부 렌더링) */}
        {nodeCount > 3 && (
          <>
            <path d="M220,180 C220,220 150,240 150,280" stroke="#B0E0E6" strokeWidth="3" fill="none" />
            <path d="M400,220 C400,260 300,280 300,320" stroke="#FFB6C1" strokeWidth="3" fill="none" />
            <path d="M580,180 C580,220 500,280 500,320" stroke="#FFF8DC" strokeWidth="3" fill="none" />
          </>
        )}
        
        {nodeCount > 6 && (
          <>
            <path d="M150,280 C150,320 180,360 180,400" stroke="#FFDAB9" strokeWidth="3" fill="none" />
            <path d="M300,320 C300,360 350,410 350,450" stroke="#E6E6FA" strokeWidth="3" fill="none" />
            <path d="M500,320 C500,360 520,360 520,400" stroke="#DDA0DD" strokeWidth="3" fill="none" />
          </>
        )}
        
        {nodeCount > 9 && (
          <>
            <path d="M180,400 C180,450 250,480 250,520" stroke="#FFC0CB" strokeWidth="3" fill="none" />
            <path d="M520,400 C520,450 450,480 450,520" stroke="#FFCBA4" strokeWidth="3" fill="none" />
            <path d="M250,520 C250,550 350,560 400,600" stroke="#FF6B81" strokeWidth="3" fill="none" />
            <path d="M450,520 C450,550 450,560 400,600" stroke="#FF6B81" strokeWidth="3" fill="none" />
            <path d="M350,450 C350,500 350,550 400,600" stroke="#FF6B81" strokeWidth="3" fill="none" />
          </>
        )}
      </svg>
      
      {/* 루트 노드 */}
      <div className="absolute bg-red-100 border-2 border-red-400 rounded-lg p-2 shadow-md flex flex-col items-center"
           style={{left: '360px', top: '30px', width: '80px', height: '80px', zIndex: 10}}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-100 border border-red-400 mb-1">
          <Heart className="w-6 h-6 text-red-500 fill-current" />
        </div>
        <span className="text-xs font-medium text-center">Felix</span>
      </div>
      
      {/* 첫 단계 노드들 */}
      <div className="absolute bg-red-50 border-2 border-red-300 rounded-lg p-2 shadow-md flex flex-col items-center"
           style={{left: '180px', top: '150px', width: '80px', height: '60px', zIndex: 10}}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50 border border-red-300 mb-1">
          <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-white text-xs">▶</span>
          </div>
        </div>
        <span className="text-xs font-medium text-center">첫 입덕 영상</span>
      </div>
      
      <div className="absolute bg-red-50 border-2 border-red-300 rounded-lg p-2 shadow-md flex flex-col items-center"
           style={{left: '360px', top: '190px', width: '80px', height: '60px', zIndex: 10}}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50 border border-red-300 mb-1">
          <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-white text-xs">▶</span>
          </div>
        </div>
        <span className="text-xs font-medium text-center">무대 영상</span>
      </div>
      
      <div className="absolute bg-blue-50 border-2 border-blue-300 rounded-lg p-2 shadow-md flex flex-col items-center"
           style={{left: '540px', top: '150px', width: '80px', height: '60px', zIndex: 10}}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50 border border-blue-300 mb-1">
          <div className="w-5 h-5 text-blue-500">🌐</div>
        </div>
        <span className="text-xs font-medium text-center">인스타 게시물</span>
      </div>
      
      {/* 입덕 단계 노드들 - 조건부 렌더링 */}
      {nodeCount > 3 && (
        <>
          <div className="absolute bg-red-50 border-2 border-red-300 rounded-lg p-2 shadow-md flex flex-col items-center"
               style={{left: '110px', top: '250px', width: '80px', height: '60px', zIndex: 10}}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50 border border-red-300 mb-1">
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-xs">▶</span>
              </div>
            </div>
            <span className="text-xs font-medium text-center">팬캠 모음</span>
          </div>
          
          <div className="absolute bg-green-50 border-2 border-green-300 rounded-lg p-2 shadow-md flex flex-col items-center"
               style={{left: '260px', top: '290px', width: '80px', height: '60px', zIndex: 10}}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-50 border border-green-300 mb-1">
              <div className="w-5 h-5 text-green-500">💬</div>
            </div>
            <span className="text-xs font-medium text-center">더쿠 게시글</span>
          </div>
          
          <div className="absolute bg-yellow-50 border-2 border-yellow-300 rounded-lg p-2 shadow-md flex flex-col items-center"
               style={{left: '460px', top: '290px', width: '80px', height: '60px', zIndex: 10}}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-yellow-50 border border-yellow-300 mb-1">
              <div className="w-5 h-5 text-yellow-500">🛍️</div>
            </div>
            <span className="text-xs font-medium text-center">앨범 구매</span>
          </div>
        </>
      )}
      
      {/* 팬심 단계 노드들 */}
      {nodeCount > 6 && (
        <>
          <div className="absolute bg-purple-50 border-2 border-purple-300 rounded-lg p-2 shadow-md flex flex-col items-center"
               style={{left: '140px', top: '370px', width: '80px', height: '60px', zIndex: 10}}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-50 border border-purple-300 mb-1">
              <div className="w-5 h-5 text-purple-500">🎉</div>
            </div>
            <span className="text-xs font-medium text-center">팬사인회</span>
          </div>
          
          <div className="absolute bg-pink-50 border-2 border-pink-300 rounded-lg p-2 shadow-md flex flex-col items-center"
               style={{left: '310px', top: '420px', width: '80px', height: '60px', zIndex: 10}}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-pink-50 border border-pink-300 mb-1">
              <div className="w-5 h-5 text-pink-500">🌟</div>
            </div>
            <span className="text-xs font-medium text-center">팬클럽 가입</span>
          </div>
          
          <div className="absolute bg-blue-50 border-2 border-blue-300 rounded-lg p-2 shadow-md flex flex-col items-center"
               style={{left: '480px', top: '370px', width: '80px', height: '60px', zIndex: 10}}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50 border border-blue-300 mb-1">
              <div className="w-5 h-5 text-blue-500">🌐</div>
            </div>
            <span className="text-xs font-medium text-center">위버스 가입</span>
          </div>
        </>
      )}
      
      {/* 폴인럽 단계 노드들 */}
      {nodeCount > 9 && (
        <>
          <div className="absolute bg-yellow-50 border-2 border-yellow-300 rounded-lg p-2 shadow-md flex flex-col items-center"
               style={{left: '210px', top: '490px', width: '80px', height: '60px', zIndex: 10}}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-yellow-50 border border-yellow-300 mb-1">
              <div className="w-5 h-5 text-yellow-500">🛍️</div>
            </div>
            <span className="text-xs font-medium text-center">굿즈 구매</span>
          </div>
          
          <div className="absolute bg-purple-50 border-2 border-purple-300 rounded-lg p-2 shadow-md flex flex-col items-center"
               style={{left: '410px', top: '490px', width: '80px', height: '60px', zIndex: 10}}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-50 border border-purple-300 mb-1">
              <div className="w-5 h-5 text-purple-500">🎉</div>
            </div>
            <span className="text-xs font-medium text-center">콘서트 참여</span>
          </div>
          
          <div className="absolute bg-red-100 border-2 border-red-500 rounded-lg p-2 shadow-md flex flex-col items-center"
               style={{left: '360px', top: '570px', width: '80px', height: '80px', zIndex: 10}}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-100 border border-red-500 mb-1">
              <Heart className="w-6 h-6 text-red-500 fill-current" />
            </div>
            <span className="text-xs font-medium text-center">완전한 러브</span>
          </div>
        </>
      )}
      
      {/* 진행 상태 표시 */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-gray-500">
        <p>{currentStage} 단계: {nodeCount}/100 노드 완성</p>
        <p className="mt-1">다음 단계까지 {currentStage === '폴인럽' ? '완료!' : `${10 - (nodeCount % 10)}개 남음`}</p>
      </div>
    </div>
  );
};

export default LoveTreeDetail;