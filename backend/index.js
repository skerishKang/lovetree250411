const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const passport = require('passport');
const connectDB = require('./config/db');
const { init: initSocket } = require('./config/socket');
const path = require('path');
const logger = require('./utils/logger');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const profileRoutes = require('./routes/profileRoutes');
const googleAuthRoutes = require('./routes/googleAuthRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const websocketManager = require('./utils/websocket');
const followRoutes = require('./routes/followRoutes');

// 서버 시작 시간 기록
const startTime = Date.now();
logger.info('서버 초기화 시작', {
  timestamp: new Date().toISOString(),
  nodeEnv: process.env.NODE_ENV || 'development',
  pid: process.pid
});

// Passport 설정
require('./config/passport');
logger.info('Passport 설정 완료', {
  timestamp: new Date().toISOString()
});

const app = express();
const server = http.createServer(app);

// WebSocket 초기화
const io = websocketManager.initialize(server);
app.set('io', io);
logger.info('WebSocket 초기화 완료', {
  timestamp: new Date().toISOString()
});

// 데이터베이스 연결
connectDB();
logger.info('데이터베이스 연결 시도', {
  timestamp: new Date().toISOString()
});

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(passport.initialize());
logger.info('미들웨어 설정 완료', {
  timestamp: new Date().toISOString(),
  middleware: ['cors', 'express.json', 'passport']
});

// 정적 파일 서빙
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
logger.info('정적 파일 서빙 설정 완료', {
  timestamp: new Date().toISOString(),
  path: '/uploads'
});

// 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/follow', followRoutes);
logger.info('라우트 설정 완료', {
  timestamp: new Date().toISOString(),
  routes: [
    '/api/auth',
    '/api/posts',
    '/api/profile',
    '/api/notifications',
    '/api/users',
    '/api/chat',
    '/api/follow'
  ]
});

// 기본 라우트
app.get('/', (req, res) => {
  logger.info('기본 라우트 요청', {
    timestamp: new Date().toISOString(),
    ip: req.ip
  });
  res.json({ message: '서버가 정상적으로 실행중입니다.' });
});

// 에러 핸들링
app.use((err, req, res, next) => {
  logger.error('서버 에러 발생', {
    timestamp: new Date().toISOString(),
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    request: {
      path: req.path,
      method: req.method,
      ip: req.ip
    }
  });
  res.status(500).json({
    error: '서버 에러 발생',
    message: process.env.NODE_ENV === 'development' ? err.message : '서버 에러가 발생했습니다.'
  });
});

// 서버 시작
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info('서버 시작 완료', {
    timestamp: new Date().toISOString(),
    port: PORT,
    startupTime: `${Date.now() - startTime}ms`
  });
});

// Socket.IO 초기화
initSocket(server);
logger.info('Socket.IO 초기화 완료', {
  timestamp: new Date().toISOString()
});

// 프로세스 종료 시 로깅
process.on('SIGTERM', () => {
  logger.info('서버 종료 신호 수신', {
    timestamp: new Date().toISOString()
  });
  server.close(() => {
    logger.info('서버 종료 완료', {
      timestamp: new Date().toISOString(),
      uptime: `${process.uptime()}s`
    });
    process.exit(0);
  });
});

process.on('uncaughtException', (err) => {
  logger.error('처리되지 않은 예외 발생', {
    timestamp: new Date().toISOString(),
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    }
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('처리되지 않은 프로미스 거부', {
    timestamp: new Date().toISOString(),
    reason: reason instanceof Error ? {
      message: reason.message,
      stack: reason.stack,
      name: reason.name
    } : reason
  });
}); 