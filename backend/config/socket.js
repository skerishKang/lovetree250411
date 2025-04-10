const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

let io;

// Socket.IO 초기화
exports.init = (server) => {
  const startTime = Date.now();
  logger.info('Socket.IO 초기화 시작', {
    timestamp: new Date().toISOString(),
    clientUrl: process.env.CLIENT_URL
  });

  io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  logger.info('Socket.IO 서버 설정 완료', {
    timestamp: new Date().toISOString(),
    setupTime: `${Date.now() - startTime}ms`
  });

  // 미들웨어: JWT 인증
  io.use(async (socket, next) => {
    const authStartTime = Date.now();
    logger.info('소켓 인증 시도', {
      timestamp: new Date().toISOString(),
      socketId: socket.id,
      handshake: {
        address: socket.handshake.address,
        headers: socket.handshake.headers
      }
    });

    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        logger.warn('인증 토큰 없음', {
          timestamp: new Date().toISOString(),
          socketId: socket.id
        });
        return next(new Error('인증 토큰이 없습니다.'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        logger.warn('사용자 찾을 수 없음', {
          timestamp: new Date().toISOString(),
          socketId: socket.id,
          userId: decoded.id
        });
        return next(new Error('사용자를 찾을 수 없습니다.'));
      }

      socket.user = user;
      logger.info('소켓 인증 성공', {
        timestamp: new Date().toISOString(),
        socketId: socket.id,
        userId: user._id,
        username: user.name,
        authTime: `${Date.now() - authStartTime}ms`
      });
      next();
    } catch (error) {
      logger.error('소켓 인증 실패', {
        timestamp: new Date().toISOString(),
        socketId: socket.id,
        error: {
          message: error.message,
          name: error.name,
          stack: error.stack
        }
      });
      next(new Error('인증에 실패했습니다.'));
    }
  });

  // 연결 이벤트
  io.on('connection', (socket) => {
    const connectionTime = new Date().toISOString();
    logger.info('새로운 소켓 연결', {
      timestamp: connectionTime,
      socketId: socket.id,
      userId: socket.user._id,
      username: socket.user.name
    });

    // 사용자별 방 생성
    socket.join(`user_${socket.user._id}`);
    logger.info('사용자 방 생성', {
      timestamp: new Date().toISOString(),
      socketId: socket.id,
      userId: socket.user._id,
      room: `user_${socket.user._id}`
    });

    // 연결 해제 이벤트
    socket.on('disconnect', (reason) => {
      const duration = new Date().getTime() - new Date(connectionTime).getTime();
      logger.info('소켓 연결 해제', {
        timestamp: new Date().toISOString(),
        socketId: socket.id,
        userId: socket.user._id,
        username: socket.user.name,
        reason,
        connectionDuration: `${duration}ms`
      });
    });

    // 에러 이벤트
    socket.on('error', (error) => {
      logger.error('소켓 에러 발생', {
        timestamp: new Date().toISOString(),
        socketId: socket.id,
        userId: socket.user._id,
        error: {
          message: error.message,
          name: error.name,
          stack: error.stack
        }
      });
    });
  });

  return io;
};

// 알림 전송 함수
exports.sendNotification = (userId, notification) => {
  const startTime = Date.now();
  logger.info('알림 전송 시도', {
    timestamp: new Date().toISOString(),
    userId,
    notificationType: notification.type
  });

  if (io) {
    io.to(`user_${userId}`).emit('notification', notification);
    logger.info('알림 전송 완료', {
      timestamp: new Date().toISOString(),
      userId,
      notificationType: notification.type,
      deliveryTime: `${Date.now() - startTime}ms`
    });
  } else {
    logger.error('알림 전송 실패: Socket.IO 서버가 초기화되지 않음', {
      timestamp: new Date().toISOString(),
      userId
    });
  }
}; 