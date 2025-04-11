import { io, Socket } from 'socket.io-client';
import { store } from '../features/store';
import { addNotification } from '../features/notifications/notificationsSlice';

let socket: Socket | null = null;

export const initializeSocket = (userId: string) => {
  if (!socket) {
    socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      query: { userId },
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