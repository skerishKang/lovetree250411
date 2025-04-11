import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addComment, deleteComment } from '@/features/tree/treeSlice';
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

interface CommentListProps {
  nodeId: string;
  comments: Comment[];
  currentUserId?: string;
}

const CommentList = ({ nodeId, comments, currentUserId }: CommentListProps) => {
  const dispatch = useDispatch();
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsLoading(true);
      await dispatch(addComment({ nodeId, content: newComment }));
      setNewComment('');
    } catch (error) {
      console.error('댓글 작성 중 오류 발생:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      setIsLoading(true);
      await dispatch(deleteComment({ nodeId, commentId }));
    } catch (error) {
      console.error('댓글 삭제 중 오류 발생:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">댓글 {comments.length}</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 작성하세요..."
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          rows={3}
        />
        <button
          type="submit"
          disabled={isLoading || !newComment.trim()}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? '작성 중...' : '댓글 작성'}
        </button>
      </form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-4">
            <img
              src={comment.author.profileImage}
              alt={comment.author.name}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{comment.author.name}</span>
                  <span className="text-gray-500 text-sm">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                {currentUserId === comment.author.id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    삭제
                  </button>
                )}
              </div>
              <p className="text-gray-700 mt-1">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentList; 