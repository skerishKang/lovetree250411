const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./utils/logger');

const app = express();

// 미들웨어 설정 로깅
logger.info('애플리케이션 미들웨어 설정 시작', {
  timestamp: new Date().toISOString()
});

// CORS 설정
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
logger.info('CORS 미들웨어 설정 완료', {
  timestamp: new Date().toISOString()
});

// JSON 파싱
app.use(express.json());
logger.info('JSON 파싱 미들웨어 설정 완료', {
  timestamp: new Date().toISOString()
});

// URL 인코딩
app.use(express.urlencoded({ extended: true }));
logger.info('URL 인코딩 미들웨어 설정 완료', {
  timestamp: new Date().toISOString()
});

// HTTP 요청 로깅
app.use(morgan('combined', {
  stream: {
    write: (message) => {
      logger.info('HTTP 요청', {
        timestamp: new Date().toISOString(),
        message: message.trim()
      });
    }
  }
}));
logger.info('HTTP 요청 로깅 미들웨어 설정 완료', {
  timestamp: new Date().toISOString()
});

// 라우트 등록 로깅
logger.info('라우트 등록 시작', {
  timestamp: new Date().toISOString()
});

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const searchRoutes = require('./routes/searchRoutes');
const chatRoutes = require('./routes/chatRoutes');
const commentRoutes = require('./routes/commentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const treeRoutes = require('./routes/trees');
const likeRoutes = require('./routes/likeRoutes');
const followRoutes = require('./routes/followRoutes');

// 라우트 등록
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/trees', treeRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/follows', followRoutes);

logger.info('라우트 등록 완료', {
  timestamp: new Date().toISOString(),
  routes: [
    '/api/auth',
    '/api/users',
    '/api/posts',
    '/api/search',
    '/api/chat',
    '/api/comments',
    '/api/notifications',
    '/api/trees',
    '/api/likes',
    '/api/follows'
  ]
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  logger.error('애플리케이션 에러 발생', {
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
    success: false,
    error: '서버 에러가 발생했습니다.'
  });
});

logger.info('에러 핸들링 미들웨어 설정 완료', {
  timestamp: new Date().toISOString()
});

module.exports = app; 