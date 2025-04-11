import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// API 인스턴스 설정
const api = axios.create({
  baseURL: 'http://localhost:3001/api',  // 프록시 대신 직접 백엔드 URL 사용
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 요청 인터셉터로 토큰 추가
api.interceptors.request.use(
  (config) => {
    console.log('API 요청 설정:', config);
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API 요청 인터셉터 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 추가
api.interceptors.response.use(
  (response) => {
    console.log('API 응답 데이터:', response.data);
    return response;
  },
  (error) => {
    console.error('API 응답 에러:', error.response || error);
    return Promise.reject(error);
  }
);

// 트리 생성
export const createTree = createAsyncThunk(
  'trees/createTree',
  async ({ title, description }: { title: string; description: string }, { rejectWithValue }) => {
    try {
      console.log('트리 생성 시도:', { title, description });
      const response = await api.post('/trees', { title, description });
      console.log('트리 생성 성공:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('트리 생성 실패:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        '트리 생성에 실패했습니다'
      );
    }
  }
);

// 트리 목록 가져오기
export const fetchTrees = createAsyncThunk(
  'trees/fetchTrees',
  async (_, { rejectWithValue }) => {
    try {
      console.log('트리 목록 조회 시도');
      const response = await api.get('/trees');
      console.log('트리 목록 조회 성공:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('트리 목록 조회 실패:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        '트리 목록을 가져오는데 실패했습니다'
      );
    }
  }
);

// 트리 상세 정보 가져오기
export const fetchTreeById = createAsyncThunk(
  'trees/fetchTreeById',
  async (id: string, { rejectWithValue }) => {
    try {
      console.log('트리 상세 조회 시도:', id);
      const response = await api.get(`/trees/${id}`);
      console.log('트리 상세 조회 성공:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('트리 상세 조회 실패:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        '트리 상세 정보를 가져오는데 실패했습니다'
      );
    }
  }
);

// 트리 노드/엣지 저장
export const updateTreeNodes = createAsyncThunk(
  'trees/updateTreeNodes',
  async ({ treeId, nodes, edges }: { treeId: string; nodes: any[]; edges: any[] }, { rejectWithValue }) => {
    try {
      console.log('노드 업데이트 시도:', { treeId, nodes, edges });
      const response = await api.put(`/trees/${treeId}/nodes`, { nodes, edges });
      console.log('노드 업데이트 성공:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('노드 업데이트 실패:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        '트리 노드 저장에 실패했습니다'
      );
    }
  }
);

interface Tree {
  id: string;
  title: string;
  description: string;
  nodes?: any[];
  edges?: any[];
  author: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface TreeState {
  trees: Tree[];
  currentTree: Tree | null;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TreeState = {
  trees: [],
  currentTree: null,
  loading: 'idle',
  error: null
};

const treeSlice = createSlice({
  name: 'trees',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTree: (state, action) => {
      state.currentTree = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // 트리 생성
      .addCase(createTree.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(createTree.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.trees.push(action.payload);
        state.currentTree = action.payload;
        state.error = null;
      })
      .addCase(createTree.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      })
      // 트리 목록 가져오기
      .addCase(fetchTrees.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchTrees.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.trees = action.payload;
        state.error = null;
      })
      .addCase(fetchTrees.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      })
      // 트리 상세 정보 가져오기
      .addCase(fetchTreeById.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
        state.currentTree = null;
      })
      .addCase(fetchTreeById.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.currentTree = action.payload;
        state.error = null;
      })
      .addCase(fetchTreeById.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
        state.currentTree = null;
      })
      // 트리 노드/엣지 저장
      .addCase(updateTreeNodes.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(updateTreeNodes.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        if (state.currentTree) {
          state.currentTree = {
            ...state.currentTree,
            nodes: action.payload.nodes,
            edges: action.payload.edges
          };
        }
        state.error = null;
      })
      .addCase(updateTreeNodes.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      });
  }
});

export const { clearError, setCurrentTree } = treeSlice.actions;
export default treeSlice.reducer; 