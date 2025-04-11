import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../features/store';
import { fetchComments, createComment } from '../features/comments/commentsSlice';
import Comment from './Comment';

interface CommentsSectionProps {
  postId: string;
}

const CommentsSection = ({ postId }: CommentsSectionProps) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { comments, loading, error } = useSelector((state: RootState) => state.comments);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    console.log('CommentsSection 마운트 - 댓글 가져오기 시작:', { 
      postId,
      userId: user?.id,
      username: user?.username 
    });
    dispatch(fetchComments(postId));
  }, [dispatch, postId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      console.log('댓글 내용이 비어있음');
      return;
    }
    console.log('댓글 작성 시도:', { 
      postId, 
      content: newComment,
      userId: user?.id,
      username: user?.username 
    });
    try {
      await dispatch(createComment({ postId, content: newComment })).unwrap();
      console.log('댓글 작성 성공');
      setNewComment('');
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    }
  };

  const postComments = comments[postId] || [];
  console.log('현재 댓글 상태:', { 
    postId, 
    commentsCount: postComments.length,
    loading, 
    error,
    userId: user?.id 
  });

  return (
    <div className="mt-4">
      {user && (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => {
                console.log('댓글 입력 변경:', { 
                  postId,
                  length: e.target.value.length 
                });
                setNewComment(e.target.value);
              }}
              placeholder="댓글을 입력하세요..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              작성
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500">
          <p>댓글을 불러오는데 실패했습니다.</p>
          <button
            onClick={() => {
              console.log('댓글 다시 불러오기 시도:', { 
                postId,
                userId: user?.id 
              });
              dispatch(fetchComments(postId));
            }}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {postComments.length === 0 ? (
            <p className="text-center text-gray-500">아직 댓글이 없습니다.</p>
          ) : (
            postComments.map((comment) => (
              <Comment key={comment.id} comment={comment} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CommentsSection; 