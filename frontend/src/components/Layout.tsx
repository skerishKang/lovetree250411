import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../app/store';
import { logout } from '../features/auth/authSlice';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-pink-500">Love Tree</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/trees"
                  className="text-gray-700 hover:text-pink-500 transition-colors"
                >
                  내 트리 목록
                </Link>
                <button
                  onClick={() => navigate('/trees/create')}
                  className="text-gray-700 hover:text-pink-500 transition-colors"
                >
                  새 트리 만들기
                </button>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">{user?.username}님</span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-pink-500 transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-pink-500 transition-colors"
                >
                  로그인
                </Link>
                <Link
                  to="/register"
                  className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-grow bg-gray-50">
        {children}
      </main>

      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Love Tree. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 