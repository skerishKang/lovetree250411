import { configureStore } from '@reduxjs/toolkit';
import { logger, defaultConfig } from './middleware';

// 리듀서들을 별도의 파일로 분리
import * as authReducer from '@/features/auth/authSlice';
import * as treeReducer from '@/features/tree/treeSlice';
import * as uiReducer from '@/features/ui/uiSlice';
import * as postsReducer from '../features/posts/postsSlice';
import * as commentsReducer from '../features/comments/commentsSlice';
import * as notificationsReducer from '../features/notifications/notificationsSlice';
import * as chatReducer from '../features/chat/chatSlice';
import * as followReducer from '../features/follow/followSlice';
import * as websocketReducer from '../features/websocket/websocketSlice';

const isDevelopment = process.env.NODE_ENV === 'development';

// 웹소켓 관련 액션과 상태 경로
const websocketConfig = {
  ignoredActions: [
    'websocket/setConnected',
    'websocket/updateConnectionStatus',
    'websocket/messageReceived',
  ],
  ignoredPaths: [
    'websocket.socket',
    'websocket.connectionStatus',
  ],
};

export const store = configureStore({
  reducer: {
    auth: authReducer.default,
    tree: treeReducer.default,
    ui: uiReducer.default,
    posts: postsReducer.default,
    comments: commentsReducer.default,
    notifications: notificationsReducer.default,
    chat: chatReducer.default,
    follow: followReducer.default,
    websocket: websocketReducer.default,
  },
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware({
      serializableCheck: {
        ...websocketConfig,
        // 개발 환경에서만 직렬화 검사 활성화
        warnAfter: isDevelopment ? 32 : 0,
      },
      // 개발 환경에서만 불변성 검사 활성화
      immutableCheck: isDevelopment,
    });

    // 개발 환경에서만 로깅 미들웨어 추가
    if (isDevelopment && defaultConfig.enabled) {
      return middleware.concat(logger);
    }

    return middleware;
  },
  devTools: isDevelopment,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 