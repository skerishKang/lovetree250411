import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deletePost, likePost, toggleLike } from '../features/posts/postsSlice';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import EditPost from './EditPost';
import CommentSection from './CommentSection';
import { Link } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    image?: string;
    author: {
      id: string;
      username: string;
      profileImage?: string;
    };
    createdAt: string;
    likes: string[];
    comments: string[];
  };
  currentUserId: string;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUserId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const isLiked = post.likes.includes(user?._id || '');

  const handleLike = async () => {
    await dispatch(toggleLike(post.id));
  };

  const handleDelete = () => {
    if (window.confirm('정말로 이 게시물을 삭제하시겠습니까?')) {
      dispatch(deletePost(post.id));
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex items-center mb-4">
          <Link to={`/profile/${post.author.id}`}>
            <img
              src={post.author.profileImage || '/default-profile.png'}
              alt={post.author.username}
              className="w-10 h-10 rounded-full mr-3"
            />
          </Link>
          <div>
            <Link to={`/profile/${post.author.id}`} className="font-semibold hover:underline">
              {post.author.username}
            </Link>
            <p className="text-gray-500 text-sm">
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
                locale: ko,
              })}
            </p>
          </div>
          {post.author.id === currentUserId && (
            <div className="ml-auto flex space-x-2">
              <button
                onClick={handleEdit}
                className="text-blue-500 hover:text-blue-700"
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700"
              >
                삭제
              </button>
            </div>
          )}
        </div>
        <p className="mb-4">{post.content}</p>
        {post.image && (
          <img
            src={post.image}
            alt="게시물 이미지"
            className="w-full rounded-lg mb-4"
          />
        )}
        <div className="flex items-center text-gray-500">
          <button
            onClick={handleLike}
            className={`flex items-center ${
              isLiked ? 'text-red-500' : 'text-gray-500'
            }`}
          >
            <svg
              className="w-5 h-5 mr-1"
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
            {post.likes.length}
          </button>
          <button
            onClick={toggleComments}
            className="flex items-center hover:text-blue-500"
          >
            <svg
              className="w-5 h-5 mr-1"
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
            {post.comments.length}
          </button>
        </div>
        {showComments && (
          <CommentSection postId={post.id} currentUserId={currentUserId} />
        )}
      </div>
      {isEditing && (
        <EditPost
          post={{
            id: post.id,
            content: post.content,
            image: post.image,
          }}
          onClose={handleCloseEdit}
        />
      )}
    </>
  );
};

export default PostCard; 