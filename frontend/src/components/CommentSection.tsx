import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@features/store';
import { fetchComments, createComment, deleteComment } from '@features/comments/commentsSlice';
import { TrashIcon } from '@heroicons/react/24/outline';

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { comments, status } = useSelector((state: RootState) => state.comments);
  const { user } = useSelector((state: RootState) => state.auth);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    dispatch(fetchComments(postId));
  }, [dispatch, postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await dispatch(createComment({ content: newComment, postId }));
    setNewComment('');
  };

  const handleDelete = async (commentId: string) => {
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      await dispatch(deleteComment(commentId));
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-4">댓글</h3>
      
      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요..."
            className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
          >
            작성
          </button>
        </div>
      </form>

      {/* 댓글 목록 */}
      {status === 'loading' ? (
        <div className="text-center py-4">댓글을 불러오는 중...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-4 text-gray-500">아직 댓글이 없습니다.</div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="flex items-start space-x-3">
              <img
                src={comment.author.profileImage || '/default-profile.png'}
                alt={comment.author.username}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold">{comment.author.username}</span>
                      <p className="mt-1">{comment.content}</p>
                    </div>
                    {user?._id === comment.author._id && (
                      <button
                        onClick={() => handleDelete(comment._id)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(comment.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection; 