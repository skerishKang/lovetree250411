import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchPost, toggleLike } from '../features/posts/postsSlice';
import CommentSection from './CommentSection';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedPost: post, status, error } = useSelector((state: RootState) => state.posts);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (id) {
      dispatch(fetchPost(id));
    }
  }, [dispatch, id]);

  const handleLike = () => {
    if (post?._id) {
      dispatch(toggleLike(post._id));
    }
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen">로딩 중...</div>;
  }

  if (error || !post) {
    return <div className="flex justify-center items-center h-screen">게시물을 찾을 수 없습니다.</div>;
  }

  const isLiked = post.likes.includes(user?._id || '');

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <img
            src={post.author.profileImage || '/default-profile.png'}
            alt={post.author.username}
            className="w-10 h-10 rounded-full mr-3"
            loading="lazy"
          />
          <div>
            <p className="font-semibold">{post.author.username}</p>
            <p className="text-gray-500 text-sm">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
            </p>
          </div>
        </div>
        <p className="mb-4">{post.content}</p>
        {post.image && (
          <img
            src={post.image}
            alt="게시물 이미지"
            className="w-full rounded-lg mb-4"
            loading="lazy"
          />
        )}
        <div className="flex items-center mb-4">
          <button
            onClick={handleLike}
            className={`flex items-center mr-4 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
          >
            <svg
              className="w-6 h-6 mr-1"
              fill={isLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>{post.likes.length}</span>
          </button>
          <div className="flex items-center text-gray-500">
            <svg
              className="w-6 h-6 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>{post.commentCount}</span>
          </div>
        </div>
        <CommentSection postId={post._id} />
      </div>
    </div>
  );
};

export default PostDetail; 