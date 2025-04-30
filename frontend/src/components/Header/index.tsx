import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout } from '@/features/auth/authSlice';
import { Search, User, Bell, Menu, X } from 'lucide-react';
import { getProfileImage, getLogoImage } from '@/utils/imageUtils';
import Notifications from '../Notifications';

const Header = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount } = useSelector((state: RootState) => state.notifications);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src={getLogoImage()} 
              alt="Love Tree 로고" 
              className="w-8 h-8 object-contain rounded-full"
              loading="lazy"
            />
            <span className="text-xl font-bold text-gray-900">Love Tree</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-4">
            <Link
              to="/explore"
              className="text-gray-600 hover:text-primary transition-colors"
            >
              탐색
            </Link>
            <Link
              to="/popular"
              className="text-gray-600 hover:text-primary transition-colors"
            >
              인기
            </Link>
            <Link
              to="/latest"
              className="text-gray-600 hover:text-primary transition-colors"
            >
              최신
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="검색..."
                className="py-1 px-3 pr-8 rounded-full bg-gray-100 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
              />
              <Search className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
            </div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <button
                    type="button"
                    className="relative text-gray-600 hover:text-primary focus:outline-none"
                    onClick={() => setShowNotifications((prev) => !prev)}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-96 z-50">
                      <Notifications />
                    </div>
                  )}
                </div>
                <div className="relative">
                  <Link to="/profile" className="flex items-center space-x-2">
                    <img
                      src={user?.profileImage ? getProfileImage(user.profileImage) : getProfileImage()}
                      alt={user?.name || '사용자'}
                      data-type="profile"
                      className="w-8 h-8 rounded-full object-cover"
                      loading="lazy"
                    />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-primary hover:text-primary-dark transition-colors"
                >
                  로그인
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>

          <button 
            className="md:hidden text-gray-600 p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={mobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            role="button"
            tabIndex={0}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={() => setMobileMenuOpen(false)} aria-label="메뉴 닫기 오버레이" />
          <div className="md:hidden bg-white border-t border-gray-200 px-4 py-2 z-50 relative">
            <div className="flex flex-col space-y-2">
              <Link to="/explore" className="py-3 text-lg font-medium text-gray-600 hover:text-primary active:bg-gray-100 rounded transition-colors" onClick={() => setMobileMenuOpen(false)} tabIndex={0}>탐색</Link>
              <Link to="/popular" className="py-3 text-lg font-medium text-gray-600 hover:text-primary active:bg-gray-100 rounded transition-colors" onClick={() => setMobileMenuOpen(false)} tabIndex={0}>인기</Link>
              <Link to="/latest" className="py-3 text-lg font-medium text-gray-600 hover:text-primary active:bg-gray-100 rounded transition-colors" onClick={() => setMobileMenuOpen(false)} tabIndex={0}>최신</Link>
              <div className="relative py-2">
                <input
                  type="text"
                  placeholder="검색..."
                  className="w-full py-1 px-3 pr-8 rounded-full bg-gray-100 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                />
                <Search className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
              </div>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/notifications"
                    className="py-2 text-gray-600 hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    알림
                  </Link>
                  <Link
                    to="/profile"
                    className="py-2 text-gray-600 hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    프로필
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="py-2 text-red-500 hover:text-red-600 transition-colors text-left"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="py-2 text-primary hover:text-primary-dark transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    로그인
                  </Link>
                  <Link
                    to="/register"
                    className="py-2 text-primary hover:text-primary-dark transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header; 