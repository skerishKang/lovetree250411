import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { toggleLike, addComment } from '@/features/tree/treeSlice';
import { formatDate } from '@/utils/date';
import Loading from '../Loading';

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    profileImage: string;
  };
  createdAt: string;
}

interface TreeNodeDetailProps {
  node: {
    id: string;
    title: string;
    content: string;
    author: {
      id: string;
      name: string;
      profileImage: string;
    };
    createdAt: string;
    likes: number;
    isLiked: boolean;
    media?: {
      type: 'image' | 'video';
      url: string;
    };
    comments: Comment[];
  };
}

const TreeNodeDetail = ({ node }: TreeNodeDetailProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (node.isLiked) {
        await dispatch(toggleLike(node.id));
      } else {
        await dispatch(toggleLike(node.id));
      }
    } catch (error) {
      console.error('좋아요 처리 중 오류 발생:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!comment.trim()) return;

    try {
      setIsLoading(true);
      await dispatch(addComment({ nodeId: node.id, content: comment }));
      setComment('');
    } catch (error) {
      console.error('댓글 작성 중 오류 발생:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4 mb-6">
          <img
            src={node.author.profileImage}
            alt={node.author.name}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h2 className="text-xl font-semibold">{node.author.name}</h2>
            <p className="text-gray-500">{formatDate(node.createdAt)}</p>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-4">{node.title}</h1>
        <p className="text-gray-700 mb-6 whitespace-pre-wrap">{node.content}</p>

        {node.media && (
          <div className="mb-6">
            {node.media.type === 'image' ? (
              <img
                src={node.media.url}
                alt="첨부 이미지"
                className="w-full rounded-lg"
              />
            ) : (
              <video
                src={node.media.url}
                controls
                className="w-full rounded-lg"
              />
            )}
          </div>
        )}

        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 ${
              node.isLiked ? 'text-red-500' : 'text-gray-500'
            }`}
          >
            <svg
              className="w-6 h-6"
              fill={node.isLiked ? 'currentColor' : 'none'}
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
            <span>{node.likes}</span>
          </button>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">댓글</h3>
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="댓글을 작성하세요..."
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? '작성 중...' : '댓글 작성'}
            </button>
          </form>

          <div className="space-y-4">
            {node.comments.map((comment) => (
              <div key={comment.id} className="flex space-x-4">
                <img
                  src={comment.author.profileImage}
                  alt={comment.author.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{comment.author.name}</span>
                    <span className="text-gray-500 text-sm">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreeNodeDetail; 