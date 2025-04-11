import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCategory } from '../features/posts/postsSlice';
import { RootState } from '../store';

const categories = [
  { value: 'all', label: '전체' },
  { value: '일상', label: '일상' },
  { value: '여행', label: '여행' },
  { value: '음식', label: '음식' },
  { value: '취미', label: '취미' },
  { value: '스포츠', label: '스포츠' },
  { value: 'IT', label: 'IT' },
  { value: '기타', label: '기타' }
];

const PostCategoryFilter: React.FC = () => {
  const dispatch = useDispatch();
  const { category } = useSelector((state: RootState) => state.posts);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setCategory(e.target.value));
  };

  return (
    <div className="mb-4">
      <select
        value={category}
        onChange={handleCategoryChange}
        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        {categories.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PostCategoryFilter; 