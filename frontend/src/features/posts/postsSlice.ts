import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '@/utils/axios';
import { RootState } from '@/store';

interface Post {
  _id: string;
  content: string;
  image?: string;
  author: {
    _id: string;
    username: string;
    profileImage?: string;
  };
  likes: string[];
  commentCount: number;
  createdAt: string;
  category: string;
}

interface PostsState {
  posts: Post[];
  selectedPost: Post | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  hasMore: boolean;
  page: number;
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  sortBy: 'latest' | 'popular' | 'oldest';
  category: string;
}

const initialState: PostsState = {
  posts: [],
  selectedPost: null,
  status: 'idle',
  error: null,
  hasMore: true,
  page: 1,
  currentPage: 1,
  totalPages: 1,
  totalPosts: 0,
  sortBy: 'latest',
  category: 'all',
};

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async ({ page = 1, sortBy = 'latest', category = 'all', currentUserId, currentUsername, signal }: {
    page?: number;
    sortBy?: string;
    category?: string;
    currentUserId?: string;
    currentUsername?: string;
    signal?: AbortSignal;
  }, { rejectWithValue }) => {
    try {
      console.log('게시물 가져오기 시도:', { page, sortBy, category, currentUserId, currentUsername });
      
      const token = localStorage.getItem('token');
      console.log('🔑 요청 시 토큰 존재 여부:', !!token);
      
      const response = await api.get('/api/posts', {
        params: { page, sortBy, category },
        signal,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ 게시물 응답 성공:', response.status);
      
      const posts = response.data.posts.map((post: any) => ({
        ...post,
        isLiked: post.likes?.includes(currentUserId),
        isBookmarked: post.bookmarks?.includes(currentUserId),
        currentUserId,
        currentUsername
      }));

      return {
        posts,
        totalPages: response.data.totalPages,
        currentPage: page
      };
    } catch (error: any) {
      if (error.name === 'AbortError' || error?.code === 'ERR_CANCELED') {
        console.log('게시물 가져오기 취소됨');
        return rejectWithValue({ error: '요청이 취소되었습니다.' });
      }
      
      if (axios.isAxiosError(error)) {
        console.error('Axios 에러:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          headers: error.config?.headers
        });
        
        if (error.response?.status === 401) {
          return rejectWithValue({ error: '로그인이 필요합니다.' });
        }
        
        return rejectWithValue({ 
          error: error.response?.data?.message || '게시물을 불러오는데 실패했습니다.' 
        });
      }
      
      console.error('게시물 가져오기 실패:', error);
      return rejectWithValue({ error: '게시물을 불러오는데 실패했습니다.' });
    }
  }
);

export const fetchPost = createAsyncThunk(
  'posts/fetchPost',
  async (id: string, { rejectWithValue, getState }) => {
    const state = getState() as RootState;
    try {
      console.log('게시물 상세 가져오기 시도:', { 
        postId: id,
        currentUserId: state.auth.user?.id,
        currentUsername: state.auth.user?.username
      });
      const response = await api.get(`/api/posts/${id}`);
      console.log('게시물 상세 가져오기 응답:', { 
        postId: response.data._id,
        author: response.data.author.username,
        likesCount: response.data.likes.length,
        commentsCount: response.data.commentCount
      });
      return response.data;
    } catch (error: any) {
      console.error('게시물 상세 가져오기 실패:', { 
        postId: id,
        error: error.response?.data?.message || error.message,
        status: error.response?.status
      });
      return rejectWithValue(error.response?.data?.message || '게시물을 불러오는데 실패했습니다.');
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (formData: FormData, { rejectWithValue, getState }) => {
    const state = getState() as RootState;
    try {
      console.log('게시물 작성 시도:', { 
        authorId: state.auth.user?.id,
        authorUsername: state.auth.user?.username,
        hasImage: formData.has('image')
      });
      const response = await api.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('게시물 작성 응답:', { 
        postId: response.data._id,
        author: response.data.author.username,
        hasImage: !!response.data.image
      });
      return response.data;
    } catch (error: any) {
      console.error('게시물 작성 실패:', { 
        error: error.response?.data?.message || error.message,
        status: error.response?.status
      });
      return rejectWithValue(error.response?.data?.message || '게시물 작성에 실패했습니다.');
    }
  }
);

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ id, formData }: { id: string; formData: FormData }, { rejectWithValue, getState }) => {
    const state = getState() as RootState;
    try {
      console.log('게시물 수정 시도:', { 
        postId: id,
        authorId: state.auth.user?.id,
        authorUsername: state.auth.user?.username,
        hasImage: formData.has('image')
      });
      const response = await api.put(`/api/posts/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('게시물 수정 응답:', { 
        postId: response.data._id,
        author: response.data.author.username,
        hasImage: !!response.data.image
      });
      return response.data;
    } catch (error: any) {
      console.error('게시물 수정 실패:', { 
        postId: id,
        error: error.response?.data?.message || error.message,
        status: error.response?.status
      });
      return rejectWithValue(error.response?.data?.message || '게시물 수정에 실패했습니다.');
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (id: string, { rejectWithValue, getState }) => {
    const state = getState() as RootState;
    try {
      console.log('게시물 삭제 시도:', { 
        postId: id,
        authorId: state.auth.user?.id,
        authorUsername: state.auth.user?.username
      });
      await api.delete(`/api/posts/${id}`);
      console.log('게시물 삭제 성공:', { postId: id });
      return id;
    } catch (error: any) {
      console.error('게시물 삭제 실패:', { 
        postId: id,
        error: error.response?.data?.message || error.message,
        status: error.response?.status
      });
      return rejectWithValue(error.response?.data?.message || '게시물 삭제에 실패했습니다.');
    }
  }
);

export const toggleLike = createAsyncThunk(
  'posts/toggleLike',
  async (postId: string, { rejectWithValue, getState }) => {
    const state = getState() as RootState;
    try {
      console.log('좋아요 토글 시도:', { 
        postId,
        userId: state.auth.user?.id,
        username: state.auth.user?.username
      });
      const response = await api.post(`/api/posts/${postId}/like`);
      console.log('좋아요 토글 응답:', { 
        postId,
        likesCount: response.data.likes.length,
        isLiked: response.data.isLiked
      });
      return response.data;
    } catch (error: any) {
      console.error('좋아요 토글 실패:', { 
        postId,
        error: error.response?.data?.message || error.message,
        status: error.response?.status
      });
      return rejectWithValue(error.response.data);
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setSortBy: (state, action) => {
      console.log('정렬 기준 변경:', { 
        oldSort: state.sortBy,
        newSort: action.payload,
        currentPage: state.currentPage
      });
      state.sortBy = action.payload;
      state.currentPage = 1;
    },
    setCategory: (state, action) => {
      console.log('카테고리 변경:', { 
        oldCategory: state.category,
        newCategory: action.payload,
        currentPage: state.currentPage
      });
      state.category = action.payload;
      state.currentPage = 1;
    },
    resetPosts: (state) => {
      console.log('게시물 상태 초기화:', { 
        postsCount: state.posts.length,
        currentPage: state.currentPage,
        totalPages: state.totalPages,
        totalPosts: state.totalPosts
      });
      state.posts = [];
      state.selectedPost = null;
      state.status = 'idle';
      state.error = null;
      state.hasMore = true;
      state.page = 1;
      state.currentPage = 1;
      state.totalPages = 1;
      state.totalPosts = 0;
      state.sortBy = 'latest';
      state.category = 'all';
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPosts
      .addCase(fetchPosts.pending, (state) => {
        console.log('게시물 가져오기 시작:', { 
          currentPage: state.currentPage,
          sortBy: state.sortBy,
          category: state.category
        });
        state.status = 'loading';
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        console.log('게시물 가져오기 성공:', { 
          postsCount: action.payload.posts.length,
          hasMore: action.payload.hasMore,
          totalPages: action.payload.totalPages,
          totalPosts: action.payload.totalPosts
        });
        state.status = 'succeeded';
        state.posts = action.payload.posts;
        state.hasMore = action.payload.hasMore;
        state.page = action.payload.page;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.totalPosts = action.payload.totalPosts;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        console.error('게시물 가져오기 실패:', { 
          error: action.payload,
          currentPostsCount: state.posts.length
        });
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // fetchPost
      .addCase(fetchPost.pending, (state) => {
        console.log('게시물 상세 가져오기 시작');
        state.status = 'loading';
      })
      .addCase(fetchPost.fulfilled, (state, action) => {
        console.log('게시물 상세 가져오기 성공:', action.payload);
        state.status = 'succeeded';
        state.selectedPost = action.payload;
      })
      .addCase(fetchPost.rejected, (state, action) => {
        console.error('게시물 상세 가져오기 실패:', action.payload);
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // createPost
      .addCase(createPost.fulfilled, (state, action) => {
        console.log('게시물 작성 성공:', action.payload);
        state.posts.unshift(action.payload);
        state.totalPosts += 1;
      })
      // updatePost
      .addCase(updatePost.fulfilled, (state, action) => {
        console.log('게시물 수정 성공:', action.payload);
        const index = state.posts.findIndex(post => post._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        if (state.selectedPost?._id === action.payload._id) {
          state.selectedPost = action.payload;
        }
      })
      // deletePost
      .addCase(deletePost.fulfilled, (state, action) => {
        console.log('게시물 삭제 성공:', action.payload);
        state.posts = state.posts.filter(post => post._id !== action.payload);
        state.totalPosts -= 1;
      })
      // toggleLike
      .addCase(toggleLike.fulfilled, (state, action) => {
        console.log('좋아요 토글 성공:', action.payload);
        const index = state.posts.findIndex(post => post._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        if (state.selectedPost?._id === action.payload._id) {
          state.selectedPost = action.payload;
        }
      });
  },
});

export const { setSortBy, setCategory, resetPosts } = postsSlice.actions;
export { toggleLike as likePost };
export default postsSlice.reducer; 