import React, { useState } from 'react';

interface YoutubeSearchProps {
  onSelect: (videoUrl: string, title?: string, description?: string) => void;
  onClose: () => void;
}

interface VideoItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    thumbnails: {
      default: {
        url: string;
      };
      medium?: {
        url: string;
      };
    };
    description: string;
  };
}

const YoutubeSearch: React.FC<YoutubeSearchProps> = ({ onSelect, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // API 키 확인
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      if (!apiKey) {
        throw new Error('YouTube API 키가 설정되지 않았습니다.');
      }

      console.log('Searching with query:', searchQuery); // 디버깅용

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(
          searchQuery
        )}&type=video&key=${apiKey}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData); // 디버깅용
        throw new Error(errorData.error?.message || '검색 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      console.log('API Response:', data); // 디버깅용
      
      if (!data.items) {
        throw new Error('검색 결과를 찾을 수 없습니다.');
      }

      setVideos(data.items);
    } catch (err) {
      console.error('Error details:', err); // 디버깅용
      setError(err instanceof Error ? err.message : '검색 중 오류가 발생했습니다.');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  // 썸네일 드래그 시작 핸들러
  const handleDragStart = (e: React.DragEvent<HTMLImageElement>, videoId: string) => {
    // 드래그 데이터 설정
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    e.dataTransfer.setData('text/plain', videoUrl);
    e.dataTransfer.effectAllowed = 'copy';
    
    // 비디오 ID 콘솔에 출력 (디버깅용)
    console.log('드래그 시작: 비디오 ID', videoId);
    console.log('드래그 데이터 URL:', videoUrl);

    // 드래그 이미지 설정 (선택사항)
    const dragIcon = new Image();
    dragIcon.src = `https://img.youtube.com/vi/${videoId}/default.jpg`;
    e.dataTransfer.setDragImage(dragIcon, 10, 10);
  };

  // 비디오 선택 핸들러
  const handleVideoSelect = (videoId: string, title?: string, description?: string) => {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    onSelect(videoUrl, title, description);
  };

  // API 키 확인용 디버깅
  console.log('Current API Key:', import.meta.env.VITE_YOUTUBE_API_KEY ? 'Set' : 'Not set');

  return (
    <div className="fixed inset-y-0 right-0 w-1/2 bg-white shadow-lg flex flex-col border-l">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-bold">유튜브 검색</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="p-4 border-b">
        <form onSubmit={handleSearch}>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="검색어를 입력하세요"
              className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400"
            >
              {loading ? '검색 중...' : '검색'}
            </button>
          </div>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="text-red-500 text-center my-4 p-2 bg-red-50 rounded">
            {error}
            {!import.meta.env.VITE_YOUTUBE_API_KEY && (
              <p className="mt-2 text-sm">
                YouTube API 키가 설정되지 않았습니다. 환경 변수를 확인해주세요.
              </p>
            )}
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            </div>
          ) : videos.length > 0 ? (
            videos.map((video) => (
              <div
                key={video.id.videoId}
                onClick={() => handleVideoSelect(video.id.videoId, video.snippet.title, video.snippet.description)}
                className="flex gap-3 p-3 hover:bg-gray-100 rounded cursor-pointer border"
              >
                <img
                  src={video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url}
                  alt={video.snippet.title}
                  className="w-24 h-18 object-cover rounded"
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, video.id.videoId)}
                  title="클릭하여 선택하거나 드래그하여 사용하세요"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium line-clamp-2">
                    {video.snippet.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    드래그하여 사용할 수 있습니다
                  </p>
                </div>
              </div>
            ))
          ) : searchQuery ? (
            <div className="text-gray-500 text-center">
              검색 결과가 없습니다.
            </div>
          ) : (
            <div className="text-gray-500 text-center space-y-2">
              <p>1. 검색어를 입력하고 검색 버튼을 클릭하세요</p>
              <p>2. 검색 결과에서 원하는 영상을 선택하세요</p>
              <p>3. 선택한 영상의 URL이 자동으로 입력됩니다</p>
              <p>4. 또는 썸네일을 드래그하여 입력 필드에 놓을 수 있습니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YoutubeSearch; 