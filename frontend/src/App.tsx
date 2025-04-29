import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { websocketService } from './services/websocketService';
import Layout from '@components/Layout';
import PrivateRoute from '@components/PrivateRoute';
import { getCurrentUser, setCredentials } from '@features/auth/authSlice';
import { getToken, clearAuthData } from '@/utils/auth';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TreeView from '@components/TreeNodeDetail';
const TreeDetail = lazy(() => import('./pages/TreeDetail'));
const Trees = lazy(() => import('./pages/Trees'));
const TreeEdit = lazy(() => import('./pages/TreeEdit'));
const TreeRanking = lazy(() => import('./pages/TreeRanking'));
const NodeRanking = lazy(() => import('./pages/NodeRanking'));
const CreateTree = lazy(() => import('./pages/CreateTree'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Vite 환경에 맞는 개발 모드 체크
const isDevelopment = import.meta.env.MODE === 'development';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const CreatePost = lazy(() => import('./components/CreatePost'));
const ChatPage = lazy(() => import('./components/ChatPage'));

const App: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

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
    if (isAuthenticated && user && user._id) {
      dispatch(getCurrentUser());
      websocketService.connect();
    }

    return () => {
      websocketService.disconnect();
    };
  }, [dispatch, isAuthenticated, user]);

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
      <Routes>
        <Route path="/" element={<Suspense fallback={<div>로딩 중...</div>}><Home /></Suspense>} />
        <Route path="/login" element={<Suspense fallback={<div>로딩 중...</div>}><Login /></Suspense>} />
        <Route path="/register" element={<Suspense fallback={<div>로딩 중...</div>}><Register /></Suspense>} />
        <Route path="/profile" element={<PrivateRoute><Suspense fallback={<div>로딩 중...</div>}><Profile /></Suspense></PrivateRoute>} />
        <Route path="/create-post" element={<PrivateRoute><Suspense fallback={<div>로딩 중...</div>}><CreatePost /></Suspense></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute><Suspense fallback={<div>로딩 중...</div>}><ChatPage /></Suspense></PrivateRoute>} />
        <Route path="/trees" element={<PrivateRoute><Suspense fallback={<div>로딩 중...</div>}><Trees /></Suspense></PrivateRoute>} />
        <Route path="/trees/create" element={<PrivateRoute><Suspense fallback={<div>로딩 중...</div>}><CreateTree /></Suspense></PrivateRoute>} />
        <Route path="/trees/:id" element={<PrivateRoute><Suspense fallback={<div>로딩 중...</div>}><TreeDetail /></Suspense></PrivateRoute>} />
        <Route path="/trees/:id/edit" element={<PrivateRoute><Suspense fallback={<div>로딩 중...</div>}><TreeEdit /></Suspense></PrivateRoute>} />
        <Route path="/trees/rank" element={<PrivateRoute><Suspense fallback={<div>로딩 중...</div>}><TreeRanking /></Suspense></PrivateRoute>} />
        <Route path="/nodes/rank" element={<PrivateRoute><Suspense fallback={<div>로딩 중...</div>}><NodeRanking /></Suspense></PrivateRoute>} />
        <Route path="*" element={<Suspense fallback={<div>로딩 중...</div>}><NotFound /></Suspense>} />
      </Routes>
    </Layout>
  );
};

export default App; 