import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSortBy } from '../features/posts/postsSlice';
import { RootState } from '../store';

const PostSort: React.FC = () => {
  const dispatch = useDispatch();
  const { sortBy } = useSelector((state: RootState) => state.posts);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setSortBy(e.target.value as 'latest' | 'popular' | 'oldest'));
  };

  return (
    <div className="mb-4">
      <select
        value={sortBy}
        onChange={handleSortChange}
        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="latest">최신순</option>
        <option value="popular">인기순</option>
        <option value="oldest">오래된순</option>
      </select>
    </div>
  );
};

export default PostSort; 