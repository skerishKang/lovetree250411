import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { followUser, unfollowUser } from '../features/follow/followSlice';
import { RootState } from '../store';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
      toast('언팔로우 완료!', {
        position: 'bottom-right',
        autoClose: 1200,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        icon: '🚫',
        style: { fontWeight: 500, fontSize: '1rem' }
      });
    } else {
      dispatch(followUser(userId));
      toast('팔로우 완료!', {
        position: 'bottom-right',
        autoClose: 1200,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        icon: '🤝',
        style: { fontWeight: 500, fontSize: '1rem' }
      });
    }
  };

  return (
    <button
      onClick={handleFollow}
      disabled={status === 'loading'}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none
        ${isFollowing
          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          : 'bg-blue-500 text-white hover:bg-blue-600'}
        active:scale-105`}
      aria-label={isFollowing ? '언팔로우' : '팔로우'}
    >
      {status === 'loading' ? '처리 중...' : isFollowing ? '팔로잉' : '팔로우'}
    </button>
  );
};

export default FollowButton; 