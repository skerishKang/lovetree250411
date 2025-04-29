import React, { memo, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { getYoutubeID } from '@/utils/imageUtils';

// 색상별 스타일 매핑
const colorStyles = {
  pink: {
    border: 'border-pink-200',
    bg: 'bg-pink-50',
    text: 'text-pink-600',
    handle: 'bg-pink-400'
  },
  blue: {
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    handle: 'bg-blue-400'
  },
  green: {
    border: 'border-green-200',
    bg: 'bg-green-50',
    text: 'text-green-600',
    handle: 'bg-green-400'
  },
  purple: {
    border: 'border-purple-200',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    handle: 'bg-purple-400'
  },
  orange: {
    border: 'border-orange-200',
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    handle: 'bg-orange-400'
  }
};

// 크기별 스타일 매핑
const sizeStyles = {
  small: {
    width: 'min-w-[120px]',
    padding: 'px-3 py-2'
  },
  medium: {
    width: 'min-w-[180px]',
    padding: 'px-4 py-3'
  },
  large: {
    width: 'min-w-[240px]',
    padding: 'px-5 py-4'
  }
};

// 게시물 노드
export const PostNode = memo(({ data }: NodeProps) => {
  const colorStyle = colorStyles[data.color || 'pink'];
  const sizeStyle = sizeStyles[data.size || 'medium'];
  const fontSize = `text-[${data.fontSize || '14'}px]`;
  const videoId = data.videoUrl ? getYoutubeID(data.videoUrl) : null;
  
  useEffect(() => {
    console.log('PostNode 렌더링:', { data, videoId });
  }, [data, videoId]);

  return (
    <div className={`shadow-lg rounded-lg border-2 ${colorStyle.border} ${colorStyle.bg} ${sizeStyle.width}`}>
      <Handle 
        type="target" 
        position={Position.Top} 
        className={`w-3 h-3 ${colorStyle.handle}`} 
      />
      <div className={`${sizeStyle.padding}`}>
        <div className={`font-bold ${colorStyle.text} ${fontSize}`}>
          {data.videoTitle || data.label}
        </div>
        {videoId && (
          <div className="mt-2 rounded overflow-hidden">
            <img 
              src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
              alt="YouTube Thumbnail"
              className="w-full h-auto rounded"
            />
          </div>
        )}
        {data.content && (
          <div className={`mt-2 text-gray-600 max-h-20 overflow-y-auto ${fontSize}`}>
            {data.content}
          </div>
        )}
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={`w-3 h-3 ${colorStyle.handle}`} 
      />
    </div>
  );
});

// 커스텀 노드
export const CustomNode = memo(({ data }: NodeProps) => {
  const colorStyle = colorStyles[data.color || 'blue'];
  const sizeStyle = sizeStyles[data.size || 'medium'];
  const fontSize = `text-[${data.fontSize || '14'}px]`;
  const videoId = data.videoUrl ? getYoutubeID(data.videoUrl) : null;
  
  useEffect(() => {
    console.log('CustomNode 렌더링:', { data, videoId });
  }, [data, videoId]);

  return (
    <div className={`shadow-lg rounded-lg border-2 ${colorStyle.border} ${colorStyle.bg} ${sizeStyle.width}`}>
      <Handle 
        type="target" 
        position={Position.Top} 
        className={`w-3 h-3 ${colorStyle.handle}`} 
      />
      <div className={`${sizeStyle.padding}`}>
        <div className={`font-bold ${colorStyle.text} ${fontSize}`}>
          {data.videoTitle || data.label}
        </div>
        {videoId && (
          <div className="mt-2 rounded overflow-hidden">
            <img 
              src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
              alt="YouTube Thumbnail"
              className="w-full h-auto rounded"
            />
          </div>
        )}
        {data.content && (
          <div className={`mt-2 text-gray-600 max-h-20 overflow-y-auto ${fontSize}`}>
            {data.content}
          </div>
        )}
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={`w-3 h-3 ${colorStyle.handle}`} 
      />
    </div>
  );
}); 