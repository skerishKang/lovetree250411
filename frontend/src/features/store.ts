import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import postsReducer from './posts/postsSlice';
import commentsReducer from './comments/commentsSlice';
import notificationsReducer from './notifications/notificationsSlice';
import searchReducer from './search/searchSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    comments: commentsReducer,
    notifications: notificationsReducer,
    search: searchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 