import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { setToken, getToken, clearAuthData } from '@/utils/auth';
import { getApiUrl } from '@/utils/apiConfig';

interface User {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterResponse {
  token: string;
  user: User;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// 동적 API URL을 사용하는 axios 인스턴스 생성
const createApiInstance = () => {
  const baseURL = getApiUrl();
  console.log('🌐 Auth API URL 설정:', baseURL);
  
  return axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

// API 인스턴스 생성
let api = createApiInstance();

// API 인스턴스 업데이트 함수 (URL이 변경되었을 때 호출)
export const updateAuthApiInstance = () => {
  api = createApiInstance();
  console.log('🔄 Auth API 인스턴스 업데이트됨');
  return api;
};

export const login = createAsyncThunk<LoginResponse, { email: string; password: string }>(
  'auth/login',
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      // 로그인 전에 API 인스턴스 업데이트
      updateAuthApiInstance();
      
      console.log('🔍 login 요청 준비 중:', credentials);
      console.log('🔗 요청 URL:', `${getApiUrl()}/auth/login`);
      
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      console.log('✅ 로그인 응답:', response.data);
      
      // 토큰 저장
      if (response.data.token) {
        try {
          // 1. 토큰 저장 전 확인
          console.log('🔑 저장할 토큰:', response.data.token.substring(0, 20) + '...');
          
          // 2. auth.ts의 setToken 함수 사용
          setToken(response.data.token);
          console.log('🔐 토큰 저장 완료');
          
          // 3. 저장 후 바로 확인
          const savedToken = getToken();
          console.log('🔍 저장 후 바로 읽은 토큰:', savedToken ? savedToken.substring(0, 20) + '...' : 'null');
          
          if (!savedToken) {
            console.error('❌ 토큰 저장 실패 - 저장 후 읽어도 null');
            return rejectWithValue('토큰 저장에 실패했습니다.');
          }
          
          // 4. 사용자 정보 저장
          localStorage.setItem('user', JSON.stringify(response.data.user));
          console.log('✅ 사용자 정보 저장 완료');
          
          // 5. Redux 상태 업데이트
          console.log('🔄 Redux 상태 업데이트 시도');
          dispatch(setCredentials({ 
            token: response.data.token, 
            user: response.data.user 
          }));
          
          // 6. localStorage 전체 내용 확인
          console.log('📦 localStorage 전체 내용:', { ...localStorage });
          
          // 7. 최종 확인
          const finalToken = getToken();
          console.log('🔍 최종 토큰 확인:', finalToken ? finalToken.substring(0, 20) + '...' : 'null');
          
          if (!finalToken) {
            throw new Error('토큰이 저장되지 않았습니다.');
          }
        } catch (error) {
          console.error('❌ 토큰/사용자 정보 저장 실패:', error);
          clearAuthData(); // 저장 실패 시 모든 인증 데이터 정리
          return rejectWithValue('인증 정보 저장에 실패했습니다.');
        }
      } else {
        console.error('❌ 토큰이 응답에 없습니다:', response.data);
        return rejectWithValue('토큰이 응답에 없습니다.');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ 로그인 실패:', error);
      return rejectWithValue(error.response?.data?.message || '로그인에 실패했습니다.');
    }
  }
);

export const register = createAsyncThunk<RegisterResponse, { name: string; email: string; password: string }>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('🔍 register 요청 준비 중:', userData);
      console.log('🔗 요청 URL:', '/auth/register');
      const response = await api.post<RegisterResponse>('/auth/register', userData);
      console.log('✅ 회원가입 응답:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ 회원가입 실패:', error);
      return rejectWithValue(error.response?.data?.message || '회원가입에 실패했습니다.');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  console.log('🔄 로그아웃 액션 실행');
  clearAuthData();
  console.log('✅ 인증 데이터 삭제 완료');
});

export const getCurrentUser = createAsyncThunk<User>(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      // 사용자 정보 조회 전 API 인스턴스 업데이트
      updateAuthApiInstance();
      
      console.log('🔍 현재 사용자 정보 요청');
      console.log('🔗 요청 URL:', `${getApiUrl()}/auth/me`);
      const response = await api.get<User>('/auth/me');
      console.log('✅ 사용자 정보 응답:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ 사용자 정보 조회 실패:', error);
      return rejectWithValue(error.response?.data?.message || '사용자 정보를 가져오는데 실패했습니다.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;