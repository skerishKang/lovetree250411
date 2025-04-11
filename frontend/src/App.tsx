import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { websocketService } from './services/websocketService';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CreatePost from './components/CreatePost';
import ChatPage from './components/ChatPage';
import Layout from '@components/Layout';
import TreeView from '@components/TreeNodeDetail';
import NotFound from '@pages/NotFound';
import PrivateRoute from '@components/PrivateRoute';
import { getCurrentUser, setCredentials } from '@features/auth/authSlice';
import { getToken, clearAuthData } from '@/utils/auth';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CreateTree from './pages/CreateTree';
import TreeDetail from './pages/TreeDetail';
import Trees from './pages/Trees';
import TreeEdit from './pages/TreeEdit';

// Vite 환경에 맞는 개발 모드 체크
const isDevelopment = import.meta.env.MODE === 'development';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const token = getToken();
    if (isDevelopment) {
      console.log('App 초기화 - 토큰:', token);
      console.log('localStorage 전체 내용:', { ...localStorage });
    }

    if (token) {
      try {
        // 사용자 정보가 localStorage에 있으면 가져오기
        const storedUser = localStorage.getItem('user');
        console.log('저장된 사용자 정보:', storedUser);
        
        const user = storedUser ? JSON.parse(storedUser) : null;
        
        if (user) {
          console.log('✅ 토큰과 사용자 정보 로드됨:', { token, user });
          dispatch(setCredentials({ token, user }));
        } else {
          console.log('🔄 사용자 정보가 없어서 서버에서 가져오기 시도');
          dispatch(getCurrentUser());
        }
      } catch (error) {
        if (isDevelopment) {
          console.error('❌ 토큰/사용자 정보 파싱 에러:', error);
        }
        clearAuthData();
      }
    } else {
      if (isDevelopment) {
        console.log('토큰이 없음 - 로그인 필요');
      }
    }
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCurrentUser());
      websocketService.connect();
    }

    return () => {
      websocketService.disconnect();
    };
  }, [dispatch, isAuthenticated]);

  return (
    <Layout>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/create-post" element={<PrivateRoute><CreatePost /></PrivateRoute>} />
          <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
          <Route path="/trees" element={<PrivateRoute><Trees /></PrivateRoute>} />
          <Route path="/trees/create" element={<PrivateRoute><CreateTree /></PrivateRoute>} />
          <Route path="/trees/:id" element={<PrivateRoute><TreeDetail /></PrivateRoute>} />
          <Route path="/trees/:id/edit" element={<PrivateRoute><TreeEdit /></PrivateRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </Layout>
  );
};

export default App; 