import React, { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../features/store';
import { fetchPosts, resetPosts } from '../features/posts/postsSlice';
import Post from './Post';
import CreatePost from './CreatePost';

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const { posts, loading, hasMore, page } = useSelector((state: RootState) => state.posts);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        dispatch(fetchPosts(page));
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, page, dispatch]);

  useEffect(() => {
    dispatch(resetPosts());
    dispatch(fetchPosts(1));
  }, [dispatch]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <CreatePost />
      <div className="space-y-4">
        {posts.map((post, index) => (
          <div
            key={post._id}
            ref={index === posts.length - 1 ? lastPostElementRef : null}
          >
            <Post post={post} />
          </div>
        ))}
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <div className="text-center py-4 text-gray-500">
            더 이상 게시물이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 