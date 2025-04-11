import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createPost } from '@/features/posts/postsSlice';

export const PostForm: React.FC = () => {
  const dispatch = useDispatch();
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('content', content);
    if (image) {
      formData.append('image', image);
    }

    try {
      await dispatch(createPost(formData)).unwrap();
      setContent('');
      setImage(null);
    } catch (error) {
      console.error('게시물 작성 실패:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="bg-white rounded-lg shadow p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="무슨 생각을 하고 계신가요?"
          className="w-full h-24 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <div className="flex items-center justify-between mt-4">
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 cursor-pointer"
            >
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>이미지 추가</span>
            </label>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            게시하기
          </button>
        </div>
      </div>
    </form>
  );
}; 