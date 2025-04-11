import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '@/store';

interface Message {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  createdAt: string;
  read: boolean;
}

interface ChatUser {
  _id: string;
  username: string;
  profileImage?: string;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  unreadCount: number;
  isOnline: boolean;
}

interface ChatState {
  users: ChatUser[];
  messages: Message[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  activeChatId: string | null;
}

const initialState: ChatState = {
  users: [],
  messages: [],
  status: 'idle',
  error: null,
  activeChatId: null,
};

export const getChatUsers = createAsyncThunk(
  'chat/getChatUsers',
  async (_, { rejectWithValue, getState }) => {
    const state = getState() as RootState;
    try {
      console.log('채팅 사용자 목록 가져오기 시도:', { 
        currentUserId: state.auth.user?.id,
        currentUsername: state.auth.user?.username
      });
      const response = await axios.get('/api/chat/users');
      console.log('채팅 사용자 목록 가져오기 성공:', { 
        usersCount: response.data.length,
        onlineUsers: response.data.filter((user: ChatUser) => user.isOnline).length
      });
      return response.data;
    } catch (error: any) {
      console.error('채팅 사용자 목록 가져오기 실패:', { 
        error: error.response?.data?.message || error.message,
        status: error.response?.status
      });
      return rejectWithValue(error.response?.data?.message || '채팅 목록을 불러오는데 실패했습니다.');
    }
  }
);

export const getChatMessages = createAsyncThunk(
  'chat/getChatMessages',
  async (userId: string, { rejectWithValue, getState }) => {
    const state = getState() as RootState;
    try {
      console.log('채팅 메시지 가져오기 시도:', { 
        targetUserId: userId,
        currentUserId: state.auth.user?.id,
        currentUsername: state.auth.user?.username
      });
      const response = await axios.get(`/api/chat/messages/${userId}`);
      console.log('채팅 메시지 가져오기 성공:', { 
        messagesCount: response.data.length,
        unreadCount: response.data.filter((msg: Message) => !msg.read).length
      });
      return response.data;
    } catch (error: any) {
      console.error('채팅 메시지 가져오기 실패:', { 
        targetUserId: userId,
        error: error.response?.data?.message || error.message,
        status: error.response?.status
      });
      return rejectWithValue(error.response?.data?.message || '메시지를 불러오는데 실패했습니다.');
    }
  }
);

export const createMessage = createAsyncThunk(
  'chat/createMessage',
  async ({ receiver, content }: { receiver: string; content: string }, { rejectWithValue, getState }) => {
    const state = getState() as RootState;
    try {
      console.log('메시지 전송 시도:', { 
        receiver,
        contentPreview: content.substring(0, 20) + '...',
        senderId: state.auth.user?.id,
        senderUsername: state.auth.user?.username
      });
      const response = await axios.post('/api/chat/messages', { receiver, content });
      console.log('메시지 전송 성공:', { 
        messageId: response.data._id,
        receiver,
        createdAt: response.data.createdAt
      });
      return response.data;
    } catch (error: any) {
      console.error('메시지 전송 실패:', { 
        receiver,
        error: error.response?.data?.message || error.message,
        status: error.response?.status
      });
      return rejectWithValue(error.response?.data?.message || '메시지 전송에 실패했습니다.');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      console.log('새 메시지 추가:', { 
        messageId: action.payload._id,
        sender: action.payload.sender,
        receiver: action.payload.receiver,
        contentPreview: action.payload.content.substring(0, 20) + '...'
      });
      state.messages.push(action.payload);
    },
    setActiveChat: (state, action) => {
      console.log('활성 채팅 설정:', { 
        chatId: action.payload,
        previousActiveChat: state.activeChatId
      });
      state.activeChatId = action.payload;
    },
    updateUserStatus: (state, action) => {
      console.log('사용자 상태 업데이트:', { 
        userId: action.payload.userId,
        isOnline: action.payload.isOnline,
        currentUsersCount: state.users.length
      });
      const { userId, isOnline } = action.payload;
      const user = state.users.find(user => user._id === userId);
      if (user) {
        user.isOnline = isOnline;
      }
    },
    setOnlineUsers: (state, action) => {
      console.log('온라인 사용자 목록 설정:', { 
        usersCount: action.payload.length,
        onlineUsers: action.payload.filter((user: ChatUser) => user.isOnline).length
      });
      state.users = action.payload;
    },
    addOnlineUser: (state, action) => {
      console.log('온라인 사용자 추가:', { 
        userId: action.payload._id,
        username: action.payload.username,
        currentUsersCount: state.users.length
      });
      const user = state.users.find(user => user._id === action.payload._id);
      if (!user) {
        state.users.push(action.payload);
      }
    },
    removeOnlineUser: (state, action) => {
      console.log('온라인 사용자 제거:', { 
        userId: action.payload,
        currentUsersCount: state.users.length
      });
      state.users = state.users.filter(user => user._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // getChatUsers
      .addCase(getChatUsers.pending, (state) => {
        console.log('채팅 사용자 목록 가져오기 시작:', { 
          currentUsersCount: state.users.length
        });
        state.status = 'loading';
      })
      .addCase(getChatUsers.fulfilled, (state, action) => {
        console.log('채팅 사용자 목록 가져오기 완료:', { 
          newUsersCount: action.payload.length,
          onlineUsers: action.payload.filter((user: ChatUser) => user.isOnline).length
        });
        state.status = 'succeeded';
        state.users = action.payload;
      })
      .addCase(getChatUsers.rejected, (state, action) => {
        console.error('채팅 사용자 목록 가져오기 실패:', { 
          error: action.payload,
          currentUsersCount: state.users.length
        });
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // getChatMessages
      .addCase(getChatMessages.pending, (state) => {
        console.log('채팅 메시지 가져오기 시작:', { 
          currentMessagesCount: state.messages.length
        });
        state.status = 'loading';
      })
      .addCase(getChatMessages.fulfilled, (state, action) => {
        console.log('채팅 메시지 가져오기 완료:', { 
          newMessagesCount: action.payload.length,
          unreadCount: action.payload.filter((msg: Message) => !msg.read).length
        });
        state.status = 'succeeded';
        state.messages = action.payload;
      })
      .addCase(getChatMessages.rejected, (state, action) => {
        console.error('채팅 메시지 가져오기 실패:', { 
          error: action.payload,
          currentMessagesCount: state.messages.length
        });
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // createMessage
      .addCase(createMessage.fulfilled, (state, action) => {
        console.log('메시지 생성 완료:', { 
          messageId: action.payload._id,
          sender: action.payload.sender,
          receiver: action.payload.receiver,
          contentPreview: action.payload.content.substring(0, 20) + '...'
        });
        state.messages.push(action.payload);
      });
  },
});

export const { 
  addMessage, 
  setActiveChat,
  updateUserStatus, 
  setOnlineUsers, 
  addOnlineUser, 
  removeOnlineUser 
} = chatSlice.actions;
export default chatSlice.reducer; 