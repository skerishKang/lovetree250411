import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import { RootState } from '@/store';

interface User {
  _id: string;
  username: string;
  profileImage?: string;
  bio?: string;
}

interface FollowState {
  followers: User[];
  following: User[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: FollowState = {
  followers: [],
  following: [],
  status: 'idle',
  error: null,
};

// 팔로우
export const followUser = createAsyncThunk(
  'follow/followUser',
  async (userId: string, { getState }) => {
    const state = getState() as RootState;
    console.log('팔로우 시도:', { 
      targetUserId: userId,
      currentUserId: state.auth.user?._id,
      currentUsername: state.auth.user?.name,
      timestamp: new Date().toISOString()
    });
    try {
      const response = await api.post(`/api/users/${userId}/follow`);
      console.log('팔로우 성공:', { 
        targetUserId: userId,
        targetUsername: response.data.username,
        followersCount: response.data.followersCount,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error: any) {
      console.error('팔로우 실패:', { 
        targetUserId: userId,
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
);

// 언팔로우
export const unfollowUser = createAsyncThunk(
  'follow/unfollowUser',
  async (userId: string, { getState }) => {
    const state = getState() as RootState;
    console.log('언팔로우 시도:', { 
      targetUserId: userId,
      currentUserId: state.auth.user?._id,
      currentUsername: state.auth.user?.name,
      timestamp: new Date().toISOString()
    });
    try {
      const response = await api.delete(`/api/users/${userId}/follow`);
      console.log('언팔로우 성공:', { 
        targetUserId: userId,
        targetUsername: response.data.username,
        followersCount: response.data.followersCount,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error: any) {
      console.error('언팔로우 실패:', { 
        targetUserId: userId,
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
);

// 팔로워 목록 조회
export const fetchFollowers = createAsyncThunk(
  'follow/fetchFollowers',
  async (userId: string, { getState }) => {
    const state = getState() as RootState;
    console.log('팔로워 목록 조회 시도:', { 
      targetUserId: userId,
      currentUserId: state.auth.user?._id,
      currentUsername: state.auth.user?.name,
      timestamp: new Date().toISOString()
    });
    try {
      const response = await api.get(`/api/users/${userId}/followers`);
      console.log('팔로워 목록 조회 성공:', { 
        targetUserId: userId,
        followersCount: response.data.length,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error: any) {
      console.error('팔로워 목록 조회 실패:', { 
        targetUserId: userId,
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
);

// 팔로잉 목록 조회
export const fetchFollowing = createAsyncThunk(
  'follow/fetchFollowing',
  async (userId: string, { getState }) => {
    const state = getState() as RootState;
    console.log('팔로잉 목록 조회 시도:', { 
      targetUserId: userId,
      currentUserId: state.auth.user?._id,
      currentUsername: state.auth.user?.name,
      timestamp: new Date().toISOString()
    });
    try {
      const response = await api.get(`/api/users/${userId}/following`);
      console.log('팔로잉 목록 조회 성공:', { 
        targetUserId: userId,
        followingCount: response.data.length,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error: any) {
      console.error('팔로잉 목록 조회 실패:', { 
        targetUserId: userId,
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
);

const followSlice = createSlice({
  name: 'follow',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 팔로워 목록 조회
      .addCase(fetchFollowers.pending, (state) => {
        console.log('팔로워 목록 조회 시작:', { 
          currentFollowersCount: state.followers.length,
          timestamp: new Date().toISOString()
        });
        state.status = 'loading';
      })
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        console.log('팔로워 목록 조회 완료:', { 
          newFollowersCount: action.payload.length,
          timestamp: new Date().toISOString()
        });
        state.status = 'succeeded';
        state.followers = action.payload;
      })
      .addCase(fetchFollowers.rejected, (state, action) => {
        console.error('팔로워 목록 조회 실패:', { 
          error: action.error.message,
          currentFollowersCount: state.followers.length,
          timestamp: new Date().toISOString()
        });
        state.status = 'failed';
        state.error = action.error.message || '팔로워 목록을 불러오는데 실패했습니다.';
      })
      // 팔로잉 목록 조회
      .addCase(fetchFollowing.pending, (state) => {
        console.log('팔로잉 목록 조회 시작:', { 
          currentFollowingCount: state.following.length,
          timestamp: new Date().toISOString()
        });
        state.status = 'loading';
      })
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        console.log('팔로잉 목록 조회 완료:', { 
          newFollowingCount: action.payload.length,
          timestamp: new Date().toISOString()
        });
        state.status = 'succeeded';
        state.following = action.payload;
      })
      .addCase(fetchFollowing.rejected, (state, action) => {
        console.error('팔로잉 목록 조회 실패:', { 
          error: action.error.message,
          currentFollowingCount: state.following.length,
          timestamp: new Date().toISOString()
        });
        state.status = 'failed';
        state.error = action.error.message || '팔로잉 목록을 불러오는데 실패했습니다.';
      });
  },
});

export const selectFollowers = (state: RootState) => state.follow.followers;
export const selectFollowing = (state: RootState) => state.follow.following;
export const selectFollowStatus = (state: RootState) => state.follow.status;
export const selectFollowError = (state: RootState) => state.follow.error;

export default followSlice.reducer; 