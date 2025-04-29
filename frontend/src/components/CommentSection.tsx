import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchComments, createComment, deleteComment } from '@features/comments/commentsSlice';
import { TrashIcon } from '@heroicons/react/24/outline';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './comment-animations.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { comments, status } = useSelector((state: RootState) => state.comments);
  const { user } = useSelector((state: RootState) => state.auth);
  const [newComment, setNewComment] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchComments(postId));
  }, [dispatch, postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await dispatch(createComment({ content: newComment, postId })).unwrap();
      setNewComment('');
      toast.success('댓글이 등록되었습니다!', {
        position: 'bottom-right',
        autoClose: 1200,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        icon: '💬',
        style: { fontWeight: 500, fontSize: '1rem' }
      });
      if (inputRef.current) inputRef.current.focus();
    } catch (error) {
      toast.error('댓글 등록에 실패했습니다.', {
        position: 'bottom-right',
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        icon: '❌',
        style: { fontWeight: 500, fontSize: '1rem' }
      });
    }
  };

  const handleDelete = async (commentId: string) => {
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      await dispatch(deleteComment(commentId));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [comments]);

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-4">댓글</h3>
      
      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex">
          <input
            ref={inputRef}
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="댓글을 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
            className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm bg-white"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 active:scale-95 transition-transform duration-150 shadow"
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
        <div ref={listRef} className="space-y-4 max-h-80 overflow-y-auto pr-2">
          <TransitionGroup>
            {comments.map((comment) => (
              <CSSTransition key={comment._id} timeout={300} classNames="fade">
                <div className="flex items-start space-x-3 bg-gray-50 rounded-xl shadow p-3 transition-all duration-200 hover:shadow-md">
                  <img
                    src={comment.author.profileImage || '/default-profile.png'}
                    alt={comment.author.username}
                    className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-semibold text-blue-700">{comment.author.username}</span>
                        <p className="mt-1 text-gray-800 break-words">{comment.content}</p>
                      </div>
                      {user?._id === comment.author._id && (
                        <button
                          onClick={() => handleDelete(comment._id)}
                          className="text-gray-400 hover:text-red-500 transition-colors duration-150"
                          aria-label="댓글 삭제"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      {new Date(comment.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </CSSTransition>
            ))}
          </TransitionGroup>
        </div>
      )}
    </div>
  );
};

export default CommentSection; 