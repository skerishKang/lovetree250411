import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '@/store';
import { toast } from 'react-toastify';

interface Notification {
  _id: string;
  type: 'like' | 'comment' | 'follow';
  sender: {
    _id: string;
    username: string;
    profileImage?: string;
  };
  post?: {
    _id: string;
    content: string;
  };
  comment?: {
    _id: string;
    text: string;
  };
  read: boolean;
  createdAt: string;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  status: 'idle',
  error: null
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { getState }) => {
    const state = getState() as RootState;
    console.log('알림 목록 가져오기 시도:', { 
      currentUserId: state.auth.user?._id,
      currentUsername: state.auth.user?.name,
      timestamp: new Date().toISOString()
    });
    try {
      const response = await axios.get('/api/notifications');
      console.log('알림 목록 가져오기 성공:', { 
        notificationsCount: response.data.length,
        unreadCount: response.data.filter((n: Notification) => !n.read).length,
        types: [...new Set(response.data.map((n: Notification) => n.type))],
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error: any) {
      console.error('알림 목록 가져오기 실패:', { 
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string, { getState }) => {
    const state = getState() as RootState;
    console.log('알림 읽음 표시 시도:', { 
      notificationId,
      currentUserId: state.auth.user?._id,
      currentUsername: state.auth.user?.name,
      timestamp: new Date().toISOString()
    });
    try {
      const response = await axios.put(`/api/notifications/${notificationId}/read`);
      console.log('알림 읽음 표시 성공:', { 
        notificationId,
        notificationType: response.data.type,
        sender: response.data.sender.username,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error: any) {
      console.error('알림 읽음 표시 실패:', { 
        notificationId,
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { getState }) => {
    const state = getState() as RootState;
    console.log('모든 알림 읽음 표시 시도:', { 
      currentUserId: state.auth.user?._id,
      currentUsername: state.auth.user?.name,
      currentUnreadCount: state.notifications.unreadCount,
      timestamp: new Date().toISOString()
    });
    try {
      const response = await axios.put('/api/notifications/read-all');
      console.log('모든 알림 읽음 표시 성공:', { 
        markedCount: response.data.markedCount,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error: any) {
      console.error('모든 알림 읽음 표시 실패:', { 
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: string, { getState }) => {
    const state = getState() as RootState;
    console.log('알림 삭제 시도:', { 
      notificationId,
      currentUserId: state.auth.user?._id,
      currentUsername: state.auth.user?.name,
      timestamp: new Date().toISOString()
    });
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
      console.log('알림 삭제 성공:', { 
        notificationId,
        timestamp: new Date().toISOString()
      });
      return notificationId;
    } catch (error: any) {
      console.error('알림 삭제 실패:', { 
        notificationId,
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const sender = action.payload.sender;
      const senderName = sender?.name || sender?.username || '시스템';
      console.log('새 알림 추가:', { 
        notificationId: action.payload._id,
        type: action.payload.type,
        sender: senderName,
        postId: action.payload.post?._id,
        timestamp: new Date().toISOString()
      });
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
      // 토스트 알림
      let msg = '';
      switch (action.payload.type) {
        case 'like':
          msg = `${senderName}님이 내 트리를 좋아합니다.`;
          break;
        case 'comment':
          msg = `${senderName}님이 내 노드에 댓글을 남겼습니다.`;
          break;
        case 'follow':
          msg = `${senderName}님이 나를 팔로우하기 시작했습니다.`;
          break;
        default:
          msg = action.payload.message || '새 알림이 도착했습니다!';
      }
      toast.info(msg, {
        position: 'bottom-right',
        autoClose: 3500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        icon: '🔔',
        style: { fontWeight: 500, fontSize: '1rem' }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        console.log('알림 목록 가져오기 시작:', { 
          currentNotificationsCount: state.notifications.length,
          currentUnreadCount: state.unreadCount,
          timestamp: new Date().toISOString()
        });
        state.status = 'loading';
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        console.log('알림 목록 가져오기 완료:', { 
          newNotificationsCount: action.payload.length,
          newUnreadCount: action.payload.filter((n: Notification) => !n.read).length,
          timestamp: new Date().toISOString()
        });
        state.status = 'succeeded';
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n: Notification) => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        console.error('알림 목록 가져오기 실패:', { 
          error: action.error.message,
          currentNotificationsCount: state.notifications.length,
          currentUnreadCount: state.unreadCount,
          timestamp: new Date().toISOString()
        });
        state.status = 'failed';
        state.error = action.error.message || '알림을 불러오는데 실패했습니다.';
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        console.log('알림 읽음 표시 완료:', { 
          notificationId: action.payload._id,
          type: action.payload.type,
          sender: action.payload.sender.username,
          newUnreadCount: state.notifications.filter(n => !n.read).length,
          timestamp: new Date().toISOString()
        });
        const index = state.notifications.findIndex(n => n._id === action.payload._id);
        if (index !== -1) {
          state.notifications[index] = action.payload;
          state.unreadCount = state.notifications.filter(n => !n.read).length;
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        console.log('모든 알림 읽음 표시 완료:', { 
          previousUnreadCount: state.unreadCount,
          timestamp: new Date().toISOString()
        });
        state.notifications = state.notifications.map(n => ({ ...n, read: true }));
        state.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        console.log('알림 삭제 완료:', { 
          notificationId: action.payload,
          newNotificationsCount: state.notifications.length - 1,
          newUnreadCount: state.notifications.filter(n => !n.read).length,
          timestamp: new Date().toISOString()
        });
        state.notifications = state.notifications.filter(n => n._id !== action.payload);
        state.unreadCount = state.notifications.filter(n => !n.read).length;
      });
  }
});

export const { addNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer; 