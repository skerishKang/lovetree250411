import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/api/axios';
import { RootState } from '@/store';

// TreeNode 인터페이스 정의
export interface TreeNode {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  likes: string[];
  comments: string[];
  createdAt: string;
  updatedAt: string;
  children?: string[];
  expanded?: boolean;
  stage?: 'tree' | 'seed' | 'sprout';
}

// TreeState 인터페이스 정의
export interface TreeState {
  nodes: TreeNode[];
  loading: boolean;
  error: string | null;
  selectedNode: TreeNode | null;
}

// 초기 상태 설정
const initialState: TreeState = {
  nodes: [],
  loading: false,
  error: null,
  selectedNode: null,
};

// 트리 노드 가져오기
export const fetchNodes = createAsyncThunk(
  'tree/fetchNodes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/tree');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '트리 노드를 가져오는데 실패했습니다.');
    }
  }
);

// 사용자의 트리 가져오기
export const fetchUserTree = createAsyncThunk(
  'tree/fetchUserTree',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/tree/user/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '사용자의 트리를 가져오는데 실패했습니다.');
    }
  }
);

// 트리 노드 생성
export const createNode = createAsyncThunk(
  'tree/createNode',
  async (nodeData: { title: string; content: string; parentId?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/tree', nodeData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '트리 노드 생성에 실패했습니다.');
    }
  }
);

// 트리 노드 업데이트
export const updateNode = createAsyncThunk(
  'tree/updateNode',
  async ({ nodeId, data }: { nodeId: string; data: Partial<TreeNode> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/tree/${nodeId}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '트리 노드 업데이트에 실패했습니다.');
    }
  }
);

// 트리 노드 삭제
export const deleteNode = createAsyncThunk(
  'tree/deleteNode',
  async (nodeId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/tree/${nodeId}`);
      return nodeId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '트리 노드 삭제에 실패했습니다.');
    }
  }
);

// 노드 좋아요 추가/제거
export const likeNode = createAsyncThunk(
  'tree/likeNode',
  async (nodeId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/tree/${nodeId}/like`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '좋아요 변경에 실패했습니다.');
    }
  }
);

// 노드 좋아요 취소
export const unlikeNode = createAsyncThunk(
  'tree/unlikeNode',
  async (nodeId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/tree/${nodeId}/like`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '좋아요 취소에 실패했습니다.');
    }
  }
);

// 댓글 삭제
export const deleteComment = createAsyncThunk(
  'tree/deleteComment',
  async ({ nodeId, commentId }: { nodeId: string; commentId: string }, { rejectWithValue }) => {
    try {
      await api.delete(`/api/tree/${nodeId}/comments/${commentId}`);
      return { nodeId, commentId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '댓글 삭제에 실패했습니다.');
    }
  }
);

// 슬라이스 생성
const treeSlice = createSlice({
  name: 'trees', // 변경: 'tree' -> 'trees'로 변경하여 store와 일치시킴
  initialState,
  reducers: {
    setSelectedNode: (state, action) => {
      state.selectedNode = action.payload;
    },
    clearSelectedNode: (state) => {
      state.selectedNode = null;
    },
    addComment: (state, action) => {
      const { nodeId, commentId } = action.payload;
      const node = state.nodes.find(n => n._id === nodeId);
      if (node) {
        node.comments.push(commentId);
      }
      return state;
    },
    toggleLike: (state, action) => {
      const { nodeId, userId } = action.payload;
      const node = state.nodes.find(n => n._id === nodeId);
      if (node) {
        if (node.likes.includes(userId)) {
          node.likes = node.likes.filter(id => id !== userId);
        } else {
          node.likes.push(userId);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchNodes
      .addCase(fetchNodes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNodes.fulfilled, (state, action) => {
        state.loading = false;
        state.nodes = action.payload;
      })
      .addCase(fetchNodes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // createNode
      .addCase(createNode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNode.fulfilled, (state, action) => {
        state.loading = false;
        state.nodes.push(action.payload);
      })
      .addCase(createNode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // updateNode
      .addCase(updateNode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNode.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.nodes.findIndex(n => n._id === action.payload._id);
        if (index !== -1) {
          state.nodes[index] = action.payload;
        }
      })
      .addCase(updateNode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // deleteNode
      .addCase(deleteNode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNode.fulfilled, (state, action) => {
        state.loading = false;
        state.nodes = state.nodes.filter(n => n._id !== action.payload);
      })
      .addCase(deleteNode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// 액션 생성자 내보내기
export const { setSelectedNode, clearSelectedNode, addComment, toggleLike } = treeSlice.actions;

// 선택자(셀렉터) 내보내기
export const selectTreeNodes = (state: RootState) => state.trees.nodes;
export const selectTreeLoading = (state: RootState) => state.trees.loading;
export const selectTreeError = (state: RootState) => state.trees.error;
export const selectSelectedNode = (state: RootState) => state.trees.selectedNode;

// 리듀서 내보내기
export default treeSlice.reducer;