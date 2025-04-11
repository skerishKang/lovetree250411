// websocketSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WebSocketState {
  isConnected: boolean;
  error: string | null;
  lastConnectionTime: string | null;
  connectionAttempts: number;
}

const initialState: WebSocketState = {
  isConnected: false,
  error: null,
  lastConnectionTime: null,
  connectionAttempts: 0,
};

const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    connectionEstablished: (state) => {
      const now = new Date().toISOString();
      const connectionDuration = state.lastConnectionTime
        ? new Date(now).getTime() - new Date(state.lastConnectionTime).getTime()
        : 0;

      console.log('WebSocket 연결 상태 업데이트:', {
        status: 'connected',
        timestamp: now,
        connectionAttempts: state.connectionAttempts + 1,
        previousError: state.error,
        connectionDuration: connectionDuration > 0 ? `${connectionDuration}ms` : 'N/A',
        state: {
          isConnected: true,
          error: null,
          lastConnectionTime: now
        }
      });

      state.isConnected = true;
      state.error = null;
      state.lastConnectionTime = now;
      state.connectionAttempts += 1;
    },
    connectionLost: (state, action: PayloadAction<string>) => {
      const now = new Date().toISOString();
      const connectionDuration = state.lastConnectionTime
        ? new Date(now).getTime() - new Date(state.lastConnectionTime).getTime()
        : 0;

      console.log('WebSocket 연결 상태 업데이트:', {
        status: 'disconnected',
        timestamp: now,
        error: action.payload,
        lastConnectionTime: state.lastConnectionTime,
        connectionAttempts: state.connectionAttempts,
        connectionDuration: connectionDuration > 0 ? `${connectionDuration}ms` : 'N/A',
        state: {
          isConnected: false,
          error: action.payload
        }
      });

      state.isConnected = false;
      state.error = action.payload;
    },
    resetConnection: (state) => {
      const now = new Date().toISOString();
      const connectionDuration = state.lastConnectionTime
        ? new Date(now).getTime() - new Date(state.lastConnectionTime).getTime()
        : 0;

      console.log('WebSocket 연결 상태 초기화:', {
        timestamp: now,
        previousStatus: state.isConnected ? 'connected' : 'disconnected',
        previousError: state.error,
        previousConnectionAttempts: state.connectionAttempts,
        connectionDuration: connectionDuration > 0 ? `${connectionDuration}ms` : 'N/A',
        state: {
          isConnected: false,
          error: null,
          lastConnectionTime: null,
          connectionAttempts: 0
        }
      });

      state.isConnected = false;
      state.error = null;
      state.lastConnectionTime = null;
      state.connectionAttempts = 0;
    },
  },
});

export const { connectionEstablished, connectionLost, resetConnection } = websocketSlice.actions;
export default websocketSlice.reducer;
