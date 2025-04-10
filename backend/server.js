require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const chatRoutes = require('./routes/chatRoutes');
const commentRoutes = require('./routes/commentRoutes');
const auth = require('./middleware/auth');
const path = require('path');
const logger = require('./utils/logger');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const ports = require('./config/ports');
const treesRoutes = require('./routes/trees');

const startTime = Date.now();
logger.info('서버 초기화 시작', {
  timestamp: new Date().toISOString(),
  nodeEnv: process.env.NODE_ENV || 'development',
  pid: process.pid
});

const app = express();
const server = http.createServer(app);

// URL 설정 가져오기
const urls = ports.getUrls();

// CORS 설정
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// WebSocket 설정
const io = socketIo(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

logger.info('미들웨어 설정', {
  timestamp: new Date().toISOString(),
  corsOrigins: corsOptions.origin,
  allowedMethods: corsOptions.methods,
  allowedHeaders: corsOptions.allowedHeaders
});

// 미들웨어
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 요청 제한 설정
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 900000,
  max: process.env.RATE_LIMIT_MAX || 100
});
app.use(limiter);

// Passport 설정
require('./config/passport');
app.use(passport.initialize());

// 요청 로깅 미들웨어
app.use((req, res, next) => {
  const requestStart = Date.now();
  logger.info('요청 수신', {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  res.on('finish', () => {
    const duration = Date.now() - requestStart;
    logger.info('응답 전송', {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
});

logger.info('라우트 설정', {
  timestamp: new Date().toISOString(),
  routes: [
    { path: '/api/auth', auth: false },
    { path: '/api/posts', auth: true },
    { path: '/api/chat', auth: true },
    { path: '/api/comments', auth: true },
    { path: '/api/trees', auth: true }
  ]
});

// 라우트
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', auth, chatRoutes);
app.use('/api/comments', auth, commentRoutes);
app.use('/api/trees', treesRoutes);

// 프로덕션 환경에서 정적 파일 서빙
if (process.env.NODE_ENV === 'production') {
  logger.info('프로덕션 환경 설정', {
    timestamp: new Date().toISOString(),
    staticPath: path.join(__dirname, '../frontend/dist')
  });
  
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  app.get('*', (req, res) => {
    logger.info('정적 파일 요청', {
      timestamp: new Date().toISOString(),
      path: req.path,
      referer: req.get('referer')
    });
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

logger.info('소켓 설정', {
  timestamp: new Date().toISOString(),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3005'
});

// 소켓 연결
io.on('connection', (socket) => {
  const connectionTime = new Date().toISOString();
  logger.info('새로운 클라이언트 연결', {
    timestamp: connectionTime,
    socketId: socket.id,
    handshake: {
      address: socket.handshake.address,
      headers: socket.handshake.headers,
      query: socket.handshake.query
    }
  });

  socket.on('disconnect', (reason) => {
    const duration = new Date().getTime() - new Date(connectionTime).getTime();
    logger.info('클라이언트 연결 해제', {
      timestamp: new Date().toISOString(),
      socketId: socket.id,
      reason,
      connectionDuration: `${duration}ms`
    });
  });

  // 트리 노드 업데이트 이벤트
  socket.on('updateNode', (data) => {
    logger.info('트리 노드 업데이트 이벤트', {
      timestamp: new Date().toISOString(),
      socketId: socket.id,
      data
    });
    socket.broadcast.emit('nodeUpdated', data);
  });
});

// 서버 시작 함수
const startServer = (port) => {
  return new Promise((resolve, reject) => {
    try {
      const serverInstance = server.listen(port, () => {
        logger.info('서버 시작 완료', {
          timestamp: new Date().toISOString(),
          port: port,
          startupTime: `${Date.now() - startTime}ms`,
          nodeVersion: process.version,
          platform: process.platform,
          memoryUsage: process.memoryUsage()
        });
        resolve(serverInstance);
      });

      serverInstance.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          logger.error('포트가 이미 사용 중입니다', {
            timestamp: new Date().toISOString(),
            port: port,
            error: error.message
          });
          reject(new Error(`포트 ${port}가 이미 사용 중입니다. 다른 프로세스를 종료하고 다시 시도해주세요.`));
        } else {
          logger.error('서버 시작 중 에러 발생', {
            timestamp: new Date().toISOString(),
            error: error.message
          });
          reject(error);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

// 데이터베이스 연결 및 서버 시작
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
  })
  .then(async () => {
    logger.info('MongoDB 연결 성공', {
      timestamp: new Date().toISOString(),
      connectionTime: `${Date.now() - startTime}ms`
    });
    
    try {
      await startServer(ports.SERVER);
    } catch (error) {
      logger.error('서버 시작 실패', {
        timestamp: new Date().toISOString(),
        error: error.message
      });
      process.exit(1);
    }
  })
  .catch((err) => {
    logger.error('MongoDB 연결 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack
      }
    });
    process.exit(1);
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
      query: req.query,
      body: req.body,
      headers: req.headers
    }
  });
  res.status(500).json({
    error: '서버 에러 발생',
    message: process.env.NODE_ENV === 'development' ? err.message : '서버 에러가 발생했습니다.'
  });
});

// 프로세스 종료 처리
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    logger.info('MongoDB 연결 종료');
    process.exit(0);
  });
}); 