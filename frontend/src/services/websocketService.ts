import { io, Socket } from 'socket.io-client';
import { store } from '../store';
import { connectionEstablished, connectionLost } from '../features/websocket/websocketSlice';
import { addNotification } from '../features/notifications/notificationsSlice';
import { addMessage, setOnlineUsers, addOnlineUser, removeOnlineUser } from '../features/chat/chatSlice';
import ports from '../config/ports';

const isDevelopment = process.env.NODE_ENV === 'development';

// URL 설정 가져오기
const urls = ports.getUrls();

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000; // 1초

  connect() {
    const socketURL = urls.WS;
    console.log('웹소켓 연결 시도:', socketURL);
    
    if (this.socket?.connected) {
      console.log('이미 웹소켓이 연결되어 있습니다.');
      return;
    }

    // 기존 소켓이 있다면 제거
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.close();
      this.socket = null;
    }
    
    this.socket = io(socketURL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectTimeout,
      timeout: 10000,
      autoConnect: true,
      forceNew: true,
      auth: {
        token: localStorage.getItem('token')
      }
    });

    this.socket.on('connect', () => {
      console.log('웹소켓 연결 성공:', this.socket?.id);
      this.reconnectAttempts = 0;
      store.dispatch(connectionEstablished());
    });

    this.socket.on('disconnect', (reason) => {
      console.log('웹소켓 연결 종료:', reason);
      if (reason === 'io server disconnect') {
        // 서버에서 연결을 끊은 경우 재연결 시도
        this.connect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('웹소켓 에러:', error);
    });

    this.socket.on('connect_error', (error) => {
      console.error('웹소켓 연결 에러:', error);
      if (error.message === 'Invalid token') {
        console.log('토큰이 유효하지 않습니다. 재로그인이 필요합니다.');
        // 토큰 관련 에러 처리
        localStorage.removeItem('token');
        // 로그인 페이지로 리다이렉트하는 로직 추가 필요
      }
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      if (isDevelopment) {
        console.log(`웹소켓 재연결 시도 ${attemptNumber}/${this.maxReconnectAttempts}`);
      }
    });

    this.socket.on('reconnect_failed', () => {
      if (isDevelopment) {
        console.error('웹소켓 재연결 실패');
      }
    });

    // 이벤트 핸들러 등록
    this.socket.on('notification', (data) => {
      store.dispatch(addNotification(data));
    });

    this.socket.on('message', (data) => {
      store.dispatch(addMessage(data));
    });

    this.socket.on('onlineUsers', (data) => {
      store.dispatch(setOnlineUsers(data));
    });

    this.socket.on('userJoined', (data) => {
      store.dispatch(addOnlineUser(data));
    });

    this.socket.on('userLeft', (data) => {
      store.dispatch(removeOnlineUser(data));
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        if (isDevelopment) {
          console.log(`재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        }
        this.connect();
      }, this.reconnectTimeout * this.reconnectAttempts);
    } else {
      if (isDevelopment) {
        console.error('최대 재연결 시도 횟수 도달');
      }
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('웹소켓 연결 종료');
    }
  }

  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }
}

export const websocketService = new WebSocketService(); 