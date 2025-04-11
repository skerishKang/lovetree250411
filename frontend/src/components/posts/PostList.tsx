import React from 'react';
import { Post } from '@/types/post';

interface PostListProps {
  posts: Post[];
}

export const PostList: React.FC<PostListProps> = ({ posts }) => {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post._id} className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center mb-4">
            <img
              src={post.author.profileImage || '/default-profile.png'}
              alt={post.author.username}
              className="w-10 h-10 rounded-full mr-3"
            />
            <div>
              <p className="font-semibold">{post.author.username}</p>
              <p className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <p className="mb-4">{post.content}</p>
          {post.image && (
            <img
              src={post.image}
              alt="게시물 이미지"
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
          )}
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
              <svg
                className="w-5 h-5"
                fill="none"
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
            <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
              <svg
                className="w-5 h-5"
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
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}; 