import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { followUser, unfollowUser } from '../features/follow/followSlice';
import { RootState } from '../store';

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
}

const FollowButton: React.FC<FollowButtonProps> = ({ userId, isFollowing }) => {
  const dispatch = useDispatch();
  const { status } = useSelector((state: RootState) => state.follow);

  const handleFollow = () => {
    if (isFollowing) {
      dispatch(unfollowUser(userId));
    } else {
      dispatch(followUser(userId));
    }
  };

  return (
    <button
      onClick={handleFollow}
      disabled={status === 'loading'}
      className={`px-4 py-2 rounded-full text-sm font-medium ${
        isFollowing
          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          : 'bg-blue-500 text-white hover:bg-blue-600'
      }`}
    >
      {status === 'loading' ? '처리 중...' : isFollowing ? '팔로잉' : '팔로우'}
    </button>
  );
};

export default FollowButton; 