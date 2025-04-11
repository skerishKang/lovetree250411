import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@features/store';
import { fetchPosts } from '@features/posts/postsSlice';
import { followUser, unfollowUser, fetchFollowers, fetchFollowing } from '@features/follow/followSlice';
import PostList from '@components/PostList';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { userPosts, status: postsStatus } = useSelector((state: RootState) => state.posts);
  const { followers, following, status: followStatus } = useSelector((state: RootState) => state.follow);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following'>('posts');

  useEffect(() => {
    if (userId) {
      console.log('프로필 페이지 마운트 - 사용자 ID:', userId);
      // 사용자 정보 가져오기
      const fetchUser = async () => {
        try {
          console.log('사용자 정보 가져오기 시도:', userId);
          const response = await fetch(`/api/users/${userId}`);
          const data = await response.json();
          console.log('사용자 정보 가져오기 성공:', data);
          setProfileUser(data);
        } catch (error) {
          console.error('사용자 정보를 가져오는데 실패했습니다:', error);
        }
      };

      fetchUser();
      console.log('게시물, 팔로워, 팔로잉 정보 가져오기 시작');
      dispatch(fetchPosts({}));
      dispatch(fetchFollowers(userId));
      dispatch(fetchFollowing(userId));
    }
  }, [dispatch, userId]);

  const handleFollow = async () => {
    if (userId) {
      console.log('팔로우/언팔로우 시도:', { userId, isFollowing });
      try {
        if (isFollowing) {
          await dispatch(unfollowUser(userId));
          console.log('언팔로우 성공');
        } else {
          await dispatch(followUser(userId));
          console.log('팔로우 성공');
        }
        console.log('팔로워/팔로잉 정보 갱신');
        dispatch(fetchFollowers(userId));
        dispatch(fetchFollowing(userId));
      } catch (error) {
        console.error('팔로우/언팔로우 실패:', error);
      }
    }
  };

  if (!profileUser) {
    return <div className="flex justify-center items-center h-screen">로딩 중...</div>;
  }

  const isFollowing = followers.some((follower: any) => follower._id === currentUser?._id);
  const isOwnProfile = currentUser?._id === userId;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center mb-6">
          <img
            src={profileUser.profileImage || '/default-profile.png'}
            alt={profileUser.username}
            className="w-24 h-24 rounded-full mr-6"
          />
          <div>
            <h1 className="text-2xl font-bold mb-2">{profileUser.username}</h1>
            <p className="text-gray-600 mb-4">{profileUser.bio || '소개글이 없습니다.'}</p>
            <div className="flex items-center space-x-4 mb-4">
              <div>
                <span className="font-semibold">{userPosts.length}</span> 게시물
              </div>
              <div>
                <span className="font-semibold">{followers.length}</span> 팔로워
              </div>
              <div>
                <span className="font-semibold">{following.length}</span> 팔로잉
              </div>
            </div>
            {!isOwnProfile && (
              <button
                onClick={handleFollow}
                className={`px-4 py-2 rounded ${
                  isFollowing
                    ? 'bg-gray-200 text-gray-800'
                    : 'bg-blue-500 text-white'
                }`}
              >
                {isFollowing ? '언팔로우' : '팔로우'}
              </button>
            )}
          </div>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'posts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              게시물
            </button>
            <button
              onClick={() => setActiveTab('followers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'followers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              팔로워
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'following'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              팔로잉
            </button>
          </nav>
        </div>

        {activeTab === 'posts' && <PostList posts={userPosts} />}
        
        {activeTab === 'followers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {followers.map((follower: any) => (
              <div key={follower._id} className="flex items-center p-4 bg-white rounded-lg shadow">
                <img
                  src={follower.profileImage || '/default-profile.png'}
                  alt={follower.username}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <p className="font-semibold">{follower.username}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'following' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {following.map((followed: any) => (
              <div key={followed._id} className="flex items-center p-4 bg-white rounded-lg shadow">
                <img
                  src={followed.profileImage || '/default-profile.png'}
                  alt={followed.username}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <p className="font-semibold">{followed.username}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 