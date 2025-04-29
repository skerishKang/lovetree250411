import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchPosts } from '@/features/posts/postsSlice';
import { followUser, unfollowUser, fetchFollowers, fetchFollowing } from '@/features/follow/followSlice';
import PostList from '@/components/PostList';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getProfileImage } from '@/utils/imageUtils';

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { userPosts, status: postsStatus } = useSelector((state: RootState) => state.posts);
  const { followers, following, status: followStatus } = useSelector((state: RootState) => state.follow);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    username: '',
    bio: '',
    profileImage: ''
  });

  useEffect(() => {
    const loadProfileData = async () => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        console.log('프로필 데이터 로딩 시작:', userId);
        
        // 사용자 정보 가져오기
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          throw new Error('사용자 정보를 가져오는데 실패했습니다.');
        }
        const data = await response.json();
        setProfileUser(data);
        setEditedProfile({
          username: data.username,
          bio: data.bio || '',
          profileImage: data.profileImage || ''
        });

        // 게시물, 팔로워, 팔로잉 정보 가져오기
        await Promise.all([
          dispatch(fetchPosts({})),
          dispatch(fetchFollowers(userId)),
          dispatch(fetchFollowing(userId))
        ]);

        console.log('프로필 데이터 로딩 완료');
      } catch (err) {
        console.error('프로필 데이터 로딩 실패:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [dispatch, userId]);

  const handleFollow = async () => {
    if (!userId) return;

    try {
      console.log('팔로우/언팔로우 시도:', { userId, isFollowing });
      
      if (isFollowing) {
        await dispatch(unfollowUser(userId));
        console.log('언팔로우 성공');
      } else {
        await dispatch(followUser(userId));
        console.log('팔로우 성공');
      }

      // 팔로워/팔로잉 정보 갱신
      await Promise.all([
        dispatch(fetchFollowers(userId)),
        dispatch(fetchFollowing(userId))
      ]);
    } catch (err) {
      console.error('팔로우/언팔로우 실패:', err);
    }
  };

  const handleEditProfile = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editedProfile)
      });

      if (!response.ok) {
        throw new Error('프로필 수정에 실패했습니다.');
      }

      const updatedUser = await response.json();
      setProfileUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      console.error('프로필 수정 실패:', err);
      setError(err instanceof Error ? err.message : '프로필 수정 중 오류가 발생했습니다.');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('이미지 업로드에 실패했습니다.');
      }

      const data = await response.json();
      setEditedProfile(prev => ({ ...prev, profileImage: data.url }));
    } catch (err) {
      console.error('이미지 업로드 실패:', err);
      setError(err instanceof Error ? err.message : '이미지 업로드 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">프로필을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">오류 발생!</strong>
          <p className="block sm:inline"> {error}</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">알림</strong>
          <p className="block sm:inline"> 사용자를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const isFollowing = followers.some((follower: any) => follower._id === currentUser?._id);
  const isOwnProfile = currentUser?._id === userId;

  return (
    <div className="profile-container min-h-screen w-full max-w-full p-2 sm:p-4 overflow-x-auto">
      <div className="bg-white rounded-lg shadow p-4 w-full max-w-2xl mx-auto flex flex-col gap-4">
        <div className="flex items-center mb-6">
          <div className="relative">
            <img
              src={isEditing ? editedProfile.profileImage : getProfileImage(profileUser.profileImage)}
              alt={profileUser.username}
              className="w-24 h-24 rounded-full mr-6 object-cover"
              data-type="profile"
              loading="lazy"
            />
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full cursor-pointer hover:bg-blue-600">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </label>
            )}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editedProfile.username}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="사용자 이름"
                />
                <textarea
                  value={editedProfile.bio}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="자기 소개"
                  rows={3}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleEditProfile}
                    className="w-full sm:w-auto py-2 px-4 text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedProfile({
                        username: profileUser.username,
                        bio: profileUser.bio || '',
                        profileImage: profileUser.profileImage || ''
                      });
                    }}
                    className="w-full sm:w-auto py-2 px-4 text-base bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
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
                {isOwnProfile ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full sm:w-auto py-2 px-4 text-base bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    프로필 편집
                  </button>
                ) : (
                  <button
                    onClick={handleFollow}
                    className={`w-full sm:w-auto py-2 px-4 text-base rounded-lg ${
                      isFollowing
                        ? 'bg-gray-500 text-white hover:bg-gray-600'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {isFollowing ? '언팔로우' : '팔로우'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'posts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              게시물
            </button>
            <button
              onClick={() => setActiveTab('followers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'followers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              팔로워
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'following'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              팔로잉
            </button>
          </nav>
        </div>

        {activeTab === 'posts' && (
          postsStatus === 'loading' ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <PostList posts={userPosts} />
          )
        )}
        
        {activeTab === 'followers' && (
          followStatus === 'loading' ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {followers.map((follower: any) => (
                <div key={follower._id} className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
                  <img
                    src={follower.profileImage || '/default-profile.png'}
                    alt={follower.username}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <p className="font-semibold">{follower.username}</p>
                    <p className="text-sm text-gray-500">{follower.bio ? follower.bio.substring(0, 50) + '...' : '소개글이 없습니다.'}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'following' && (
          followStatus === 'loading' ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {following.map((followed: any) => (
                <div key={followed._id} className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
                  <img
                    src={followed.profileImage || '/default-profile.png'}
                    alt={followed.username}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <p className="font-semibold">{followed.username}</p>
                    <p className="text-sm text-gray-500">{followed.bio ? followed.bio.substring(0, 50) + '...' : '소개글이 없습니다.'}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Profile; 