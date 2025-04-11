import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// API 기본 URL 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Thunk에서 AbortController signal 처리
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async ({ page = 1, limit = 10, signal, sortBy = 'latest', category = 'all' } = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const response = await axios.get(`${API_BASE_URL}/api/posts`, {
        params: { 
          page, 
          limit,
          sortBy,
          category
        },
        headers: {
          Authorization: `Bearer ${token}`
        },
        signal
      });
      
      console.log('✅ 게시물 응답 성공:', response.status);
      return response.data;
    } catch (error) {
      // 요청 취소 에러는 별도 처리
      if (axios.isCancel(error)) {
        console.log('🚫 요청이 취소되었습니다.');
        return rejectWithValue('요청이 취소되었습니다.');
      }

      // 인증 에러 처리
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        return rejectWithValue('인증이 만료되었습니다. 다시 로그인해주세요.');
      }
      
      // 기타 에러 처리
      console.log('게시물 가져오기 실패:', error);
      return rejectWithValue(error.response?.data?.message || '게시물을 불러오는데 실패했습니다.');
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    loading: false,
    error: null,
    postsCount: 0,
    hasMore: false,
    currentPage: 1,
    sortBy: 'latest',
    category: 'all'
  },
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setCategory: (state, action) => {
      state.category = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.posts || [];
        state.postsCount = action.payload.postsCount || 0;
        state.hasMore = action.payload.hasMore || false;
        console.log('게시물 가져오기 성공:', {
          postsCount: state.postsCount,
          hasMore: state.hasMore
        });
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || '게시물을 불러오는데 실패했습니다.';
        console.log('게시물 가져오기 실패:', {
          error: state.error,
          currentPostsCount: state.postsCount
        });
      });
  }
});

export const { setCurrentPage, setSortBy, setCategory } = postsSlice.actions;
export default postsSlice.reducer; 