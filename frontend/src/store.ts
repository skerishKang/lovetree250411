import { configureStore } from '@reduxjs/toolkit';
import { setLogoutHandler } from '@/utils/axios';
import postsReducer from '@/features/posts/postsSlice';
import authReducer, { logout } from '@/features/auth/authSlice';
import commentsReducer from './features/comments/commentsSlice';
import searchReducer from './features/search/searchSlice';
import chatReducer from './features/chat/chatSlice';
import followReducer from './features/follow/followSlice';
import notificationsReducer from './features/notifications/notificationsSlice';
import treeReducer from './features/trees/treeSlice';

export const store = configureStore({
  reducer: {
    posts: postsReducer,
    auth: authReducer,
    comments: commentsReducer,
    search: searchReducer,
    chat: chatReducer,
    follow: followReducer,
    notifications: notificationsReducer,
    trees: treeReducer,
  },
});

// 로그아웃 핸들러 설정
setLogoutHandler(() => {
  console.log('🔄 로그아웃 핸들러 실행');
  store.dispatch(logout());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 