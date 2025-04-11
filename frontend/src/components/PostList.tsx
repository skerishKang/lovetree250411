import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts } from '../features/posts/postsSlice';
import { RootState } from '../store';
import PostSort from './PostSort';
import PostCategoryFilter from './PostCategoryFilter';
import PostCard from './PostCard';

const PostList: React.FC = () => {
  const dispatch = useDispatch();
  const { posts, currentPage, totalPages, sortBy, category, status } = useSelector(
    (state: RootState) => state.posts
  );

  useEffect(() => {
    dispatch(fetchPosts({ page: currentPage, sortBy, category }));
  }, [dispatch, currentPage, sortBy, category]);

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      dispatch(fetchPosts({ page: currentPage + 1, sortBy, category }));
    }
  };

  if (status === 'loading' && posts.length === 0) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between mb-4">
        <PostSort />
        <PostCategoryFilter />
      </div>
      
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>

      {currentPage < totalPages && (
        <div className="mt-4 text-center">
          <button
            onClick={handleLoadMore}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            더 보기
          </button>
        </div>
      )}
    </div>
  );
};

export default PostList; 