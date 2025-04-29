import { io, Socket } from 'socket.io-client';
import { store } from '../store';
import { addNotification } from '../features/notifications/notificationsSlice';
import { getWsUrl } from './apiConfig';

let socket: Socket | null = null;

export const initializeSocket = (userId: string) => {
  if (!socket) {
    // 동적으로 가져온 WebSocket URL 사용
    const wsUrl = getWsUrl();
    console.log('🌐 WebSocket 연결:', wsUrl);
    
    socket = io(wsUrl, {
      query: { userId },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'], // 웹소켓을 우선 시도
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('notification', (notification) => {
      store.dispatch(addNotification(notification));
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket 연결 오류:', error);
    });
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
  return socket;
}; 