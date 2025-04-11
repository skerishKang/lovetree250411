import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/api/axios';

interface TreeNode {
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
}

interface TreeState {
  nodes: TreeNode[];
  loading: boolean;
  error: string | null;
  selectedNode: TreeNode | null;
}

const initialState: TreeState = {
  nodes: [],
  loading: false,
  error: null,
  selectedNode: null,
};

export const fetchTreeNodes = createAsyncThunk(
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

export const createTreeNode = createAsyncThunk(
  'tree/createNode',
  async (nodeData: { title: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/tree', nodeData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '트리 노드 생성에 실패했습니다.');
    }
  }
);

const treeSlice = createSlice({
  name: 'tree',
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
      .addCase(fetchTreeNodes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTreeNodes.fulfilled, (state, action) => {
        state.loading = false;
        state.nodes = action.payload;
      })
      .addCase(fetchTreeNodes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createTreeNode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTreeNode.fulfilled, (state, action) => {
        state.loading = false;
        state.nodes.push(action.payload);
      })
      .addCase(createTreeNode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedNode, clearSelectedNode, addComment, toggleLike } = treeSlice.actions;
export default treeSlice.reducer;