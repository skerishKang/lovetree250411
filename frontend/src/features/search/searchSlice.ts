import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface SearchResult {
  users: Array<{
    id: string;
    username: string;
    profileImage?: string;
  }>;
  posts: Array<{
    id: string;
    content: string;
    image?: string;
    author: {
      id: string;
      username: string;
      profileImage?: string;
    };
    createdAt: string;
  }>;
}

interface SearchState {
  results: SearchResult;
  loading: boolean;
  error: string | null;
}

const initialState: SearchState = {
  results: {
    users: [],
    posts: [],
  },
  loading: false,
  error: null,
};

export const searchAll = createAsyncThunk(
  'search/searchAll',
  async (query: string) => {
    const response = await axios.get(`/api/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }
);

export const searchUsers = createAsyncThunk(
  'search/searchUsers',
  async (query: string) => {
    const response = await axios.get(`/api/search/users?q=${encodeURIComponent(query)}`);
    return response.data;
  }
);

export const searchPosts = createAsyncThunk(
  'search/searchPosts',
  async (query: string) => {
    const response = await axios.get(`/api/search/posts?q=${encodeURIComponent(query)}`);
    return response.data;
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    clearResults: (state) => {
      state.results = {
        users: [],
        posts: [],
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Search All
      .addCase(searchAll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchAll.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(searchAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '검색에 실패했습니다.';
      })
      // Search Users
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.results.users = action.payload;
      })
      // Search Posts
      .addCase(searchPosts.fulfilled, (state, action) => {
        state.results.posts = action.payload;
      });
  },
});

export const { clearResults } = searchSlice.actions;
export default searchSlice.reducer; 