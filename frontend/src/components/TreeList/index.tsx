import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toggleLike } from '@/features/tree/treeSlice';
import { TreeNode } from '@/types/tree';
import { formatDate } from '@/utils/date';
import Modal from '../Modal';
import { useState } from 'react';

interface TreeListProps {
  node: TreeNode;
}

const TreeList = ({ node }: TreeListProps) => {
  const dispatch = useDispatch();
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video'>("image");

  const handleLike = () => {
    dispatch(toggleLike(node._id));
  };

  const handleMediaClick = (type: 'image' | 'video') => {
    setMediaType(type);
    setMediaModalOpen(true);
  };

  return (
    <div className={`tree-node node-stage-${node.stage}`}>
      <div className="flex items-start justify-between">
        <Link to={`/tree/${node._id}`} className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {node.content}
          </h3>
          {node.description && (
            <p className="text-gray-600 text-sm mb-2">{node.description}</p>
          )}
        </Link>
        <button
          onClick={handleLike}
          className="flex items-center space-x-1 text-gray-500 hover:text-primary transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill={node.likes.length > 0 ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span className="text-sm">{node.likes.length}</span>
        </button>
      </div>

      {/* 미디어 미리보기: mediaImage > videoUrl > mediaUrl */}
      {node.mediaImage ? (
        <div className="relative aspect-video mt-2 mb-4 rounded-lg overflow-hidden cursor-pointer" onClick={() => handleMediaClick('image')}>
          <img
            src={node.mediaImage}
            alt={node.content}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      ) : node.videoUrl ? (
        <div className="relative aspect-video mt-2 mb-4 rounded-lg overflow-hidden cursor-pointer" onClick={() => handleMediaClick('video')}>
          <iframe
            src={node.videoUrl.replace('watch?v=', 'embed/')}
            title="노드 동영상"
            allowFullScreen
            className="absolute inset-0 w-full h-full object-cover rounded"
          />
        </div>
      ) : node.mediaUrl && (
        <div className="relative aspect-video mt-2 mb-4 rounded-lg overflow-hidden cursor-pointer" onClick={() => handleMediaClick(node.mediaUrl.includes('.mp4') ? 'video' : 'image')}>
          {node.mediaUrl.includes('.mp4') ? (
            <video
              src={node.mediaUrl}
              className="absolute inset-0 w-full h-full object-cover"
              controls
            />
          ) : (
            <img
              src={node.mediaUrl}
              alt={node.content}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>
      )}

      {/* 미디어 확대 모달 */}
      <Modal isOpen={mediaModalOpen} onClose={() => setMediaModalOpen(false)} size="xl">
        {mediaType === 'image' && node.mediaImage && (
          <img src={node.mediaImage} alt="확대 이미지" className="w-full h-auto rounded" />
        )}
        {mediaType === 'video' && node.videoUrl && (
          <iframe
            src={node.videoUrl.replace('watch?v=', 'embed/')}
            title="노드 동영상"
            allowFullScreen
            className="w-full h-96 rounded"
          />
        )}
        {mediaType === 'image' && !node.mediaImage && node.mediaUrl && !node.mediaUrl.includes('.mp4') && (
          <img src={node.mediaUrl} alt="확대 이미지" className="w-full h-auto rounded" />
        )}
        {mediaType === 'video' && !node.videoUrl && node.mediaUrl && node.mediaUrl.includes('.mp4') && (
          <video src={node.mediaUrl} controls className="w-full h-96 rounded" />
        )}
      </Modal>

      <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
        <div className="flex items-center space-x-4">
          <span>{formatDate(node.createdAt)}</span>
          <span>댓글 {node.comments.length}개</span>
        </div>
        <div className="flex items-center space-x-2">
          {node.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block bg-gray-100 px-2 py-1 rounded-full text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TreeList; 