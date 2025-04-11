import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import PostCard from './PostCard';

const PostsList = () => {
  const { posts, loading, error, sortBy, hasMore } = useSelector((state: RootState) => state.posts);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-600">게시글을 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="text-red-500 mb-4">{error}</div>
        <p className="text-gray-600">잠시 후 다시 시도해주세요.</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <p className="text-gray-500 mb-4">게시물이 없습니다.</p>
        <p className="text-gray-400 text-sm">첫 번째 게시물을 작성해보세요!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
};

export default PostsList; 