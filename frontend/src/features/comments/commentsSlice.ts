import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/api/axios';
import { RootState } from '@/store';

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    profileImage?: string;
  };
  post: string;
  createdAt: string;
  likes: number;
}

interface CommentsState {
  comments: Comment[];
  loading: boolean;
  error: string | null;
}

const initialState: CommentsState = {
  comments: [],
  loading: false,
  error: null,
};

export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async (postId: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      console.log('댓글 가져오기 시도:', { 
        postId,
        currentUserId: state.auth.user?.id,
        currentUsername: state.auth.user?.username
      });
      const response = await api.get(`/api/comments/post/${postId}`);
      console.log('댓글 가져오기 응답:', { 
        postId,
        commentsCount: response.data.length,
        firstComment: response.data[0] 
      });
      return response.data;
    } catch (error: any) {
      console.error('댓글 가져오기 실패:', { 
        postId,
        error: error.response?.data?.message || error.message,
        status: error.response?.status
      });
      return rejectWithValue(error.response?.data?.message || '댓글을 불러오는데 실패했습니다.');
    }
  }
);

export const createComment = createAsyncThunk(
  'comments/createComment',
  async ({ content, nodeId }: { content: string; nodeId: string }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      console.log('댓글 작성 시도:', { 
        content: content.substring(0, 50) + '...',
        nodeId,
        authorId: state.auth.user?.id,
        authorUsername: state.auth.user?.username
      });
      if (!content.trim()) {
        console.log('댓글 내용이 비어있음');
        return rejectWithValue('댓글 내용은 필수입니다.');
      }
      const response = await api.post('/api/comments', { content, postId: nodeId });
      console.log('댓글 작성 응답:', { 
        commentId: response.data._id,
        author: response.data.author.username
      });
      return response.data;
    } catch (error: any) {
      console.error('댓글 작성 실패:', { 
        nodeId,
        error: error.response?.data?.message || error.message,
        status: error.response?.status
      });
      return rejectWithValue(error.response?.data?.message || '댓글 작성에 실패했습니다.');
    }
  }
);

export const updateComment = createAsyncThunk(
  'comments/updateComment',
  async ({ id, content }: { id: string; content: string }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      console.log('댓글 수정 시도:', { 
        id,
        content: content.substring(0, 50) + '...',
        authorId: state.auth.user?.id,
        authorUsername: state.auth.user?.username
      });
      const response = await api.put(`/api/comments/${id}`, { content });
      console.log('댓글 수정 응답:', { 
        commentId: response.data._id,
        author: response.data.author.username
      });
      return response.data;
    } catch (error: any) {
      console.error('댓글 수정 실패:', { 
        id,
        error: error.response?.data?.message || error.message,
        status: error.response?.status
      });
      return rejectWithValue(error.response?.data?.message || '댓글 수정에 실패했습니다.');
    }
  }
);

export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async (commentId: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      console.log('댓글 삭제 시도:', { 
        commentId,
        authorId: state.auth.user?.id,
        authorUsername: state.auth.user?.username
      });
      await api.delete(`/api/comments/${commentId}`);
      console.log('댓글 삭제 성공:', { commentId });
      return commentId;
    } catch (error: any) {
      console.error('댓글 삭제 실패:', { 
        commentId,
        error: error.response?.data?.message || error.message,
        status: error.response?.status
      });
      return rejectWithValue(error.response?.data?.message || '댓글 삭제에 실패했습니다.');
    }
  }
);

export const likeComment = createAsyncThunk(
  'comments/likeComment',
  async (commentId: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      console.log('댓글 좋아요 시도:', { 
        commentId,
        userId: state.auth.user?.id,
        username: state.auth.user?.username
      });
      const response = await api.post(`/api/comments/${commentId}/like`);
      console.log('댓글 좋아요 응답:', { 
        commentId,
        likes: response.data.likes,
        isLiked: response.data.isLiked
      });
      return response.data;
    } catch (error: any) {
      console.error('댓글 좋아요 실패:', { 
        commentId,
        error: error.response?.data?.message || error.message,
        status: error.response?.status
      });
      return rejectWithValue(error.response?.data?.message || '좋아요 처리에 실패했습니다.');
    }
  }
);

export const commentSlice = createSlice({
  name: 'comment',
  initialState,
  reducers: {
    resetComments: (state) => {
      console.log('댓글 상태 초기화:', { 
        commentsCount: state.comments.length,
        loading: state.loading,
        error: state.error
      });
      state.comments = [];
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchComments
      .addCase(fetchComments.pending, (state) => {
        console.log('댓글 가져오기 시작');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        console.log('댓글 가져오기 성공:', { 
          commentsCount: action.payload.length,
          firstComment: action.payload[0] 
        });
        state.loading = false;
        state.comments = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        console.error('댓글 가져오기 실패:', { 
          error: action.payload,
          currentCommentsCount: state.comments.length
        });
        state.loading = false;
        state.error = action.payload as string;
      })
      // createComment
      .addCase(createComment.pending, (state) => {
        console.log('댓글 작성 시작');
        state.loading = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        console.log('댓글 작성 성공:', { 
          commentId: action.payload._id,
          author: action.payload.author.username,
          totalComments: state.comments.length + 1
        });
        state.loading = false;
        state.comments.unshift(action.payload);
      })
      .addCase(createComment.rejected, (state, action) => {
        console.error('댓글 작성 실패:', { 
          error: action.payload,
          currentCommentsCount: state.comments.length
        });
        state.loading = false;
        state.error = action.payload as string;
      })
      // updateComment
      .addCase(updateComment.pending, (state) => {
        console.log('댓글 수정 시작');
        state.loading = true;
        state.error = null;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        console.log('댓글 수정 성공:', { 
          commentId: action.payload._id,
          author: action.payload.author.username,
          content: action.payload.content.substring(0, 50) + '...'
        });
        state.loading = false;
        const index = state.comments.findIndex(comment => comment._id === action.payload._id);
        if (index !== -1) {
          state.comments[index] = action.payload;
        }
      })
      .addCase(updateComment.rejected, (state, action) => {
        console.error('댓글 수정 실패:', { 
          error: action.payload,
          currentCommentsCount: state.comments.length
        });
        state.loading = false;
        state.error = action.payload as string;
      })
      // deleteComment
      .addCase(deleteComment.pending, (state) => {
        console.log('댓글 삭제 시작');
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        console.log('댓글 삭제 성공:', { 
          commentId: action.payload,
          remainingComments: state.comments.length - 1
        });
        state.loading = false;
        state.comments = state.comments.filter(comment => comment._id !== action.payload);
      })
      .addCase(deleteComment.rejected, (state, action) => {
        console.error('댓글 삭제 실패:', { 
          error: action.payload,
          currentCommentsCount: state.comments.length
        });
        state.loading = false;
        state.error = action.payload as string;
      })
      // likeComment
      .addCase(likeComment.pending, (state) => {
        console.log('댓글 좋아요 시작');
        state.loading = true;
        state.error = null;
      })
      .addCase(likeComment.fulfilled, (state, action) => {
        console.log('댓글 좋아요 성공:', { 
          commentId: action.payload._id,
          likes: action.payload.likes,
          isLiked: action.payload.isLiked
        });
        state.loading = false;
        const index = state.comments.findIndex(comment => comment._id === action.payload._id);
        if (index !== -1) {
          state.comments[index] = action.payload;
        }
      })
      .addCase(likeComment.rejected, (state, action) => {
        console.error('댓글 좋아요 실패:', { 
          error: action.payload,
          currentCommentsCount: state.comments.length
        });
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { resetComments } = commentSlice.actions;
export default commentSlice.reducer; 