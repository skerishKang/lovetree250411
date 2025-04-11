import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { logout } from '../features/auth/authSlice';
import Notifications from './Notifications';
import Search from './Search';
import { ChatBubbleLeftIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Menu } from '@headlessui/react';

const Navbar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-blue-500">LoveTree</span>
            </Link>
          </div>

          <div className="flex-1 max-w-xl mx-4">
            <Search />
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/chat"
                  className="flex items-center text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <ChatBubbleLeftIcon className="w-5 h-5 mr-1" />
                  채팅
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <UserCircleIcon className="w-5 h-5 mr-1" />
                  프로필
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  로그인
                </Link>
                <Link
                  to="/register"
                  className="text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 