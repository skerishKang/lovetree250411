console.log('1. 서버 시작');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
console.log('2. dotenv 로드');
const express = require('express');
console.log('3. express 로드');
const mongoose = require('mongoose');
console.log('4. mongoose 로드');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const path = require('path');
const logger = require('./utils/logger');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const ports = require('./config/ports');
const { init: initSocket } = require('./config/socket');
const websocketManager = require('./utils/websocket');
console.log('5. 의존성 및 유틸 로드 완료');

// 라우트 임포트
console.log('5-1. authRoutes require 시도');
const authRoutes = require('./routes/authRoutes');
console.log('5-2. postRoutes require 시도');
// const postRoutes = require('./routes/postRoutes');
console.log('5-3. chatRoutes require 시도');
// const chatRoutes = require('./routes/chatRoutes');
console.log('5-4. commentRoutes require 시도');
// const commentRoutes = require('./routes/commentRoutes');
console.log('5-5. auth require 시도');
// const auth = require('./middleware/auth');
console.log('5-6. treesRoutes require 시도');
const treesRoutes = require('./routes/trees');
console.log('5-7. profileRoutes require 시도');
const profileRoutes = require('./routes/profileRoutes');
console.log('5-8. googleAuthRoutes require 시도');
// const googleAuthRoutes = require('./routes/googleAuthRoutes');
console.log('5-9. notificationRoutes require 시도');
// const notificationRoutes = require('./routes/notificationRoutes');
console.log('5-10. userRoutes require 시도');
// const userRoutes = require('./routes/userRoutes');
console.log('5-11. followRoutes require 시도');
// const followRoutes = require('./routes/followRoutes');
console.log('6. 라우트 임포트 완료');

// ngrok 포워딩 URL을 동적으로 가져오는 함수
async function getNgrokUrl() {
  try {
    const response = await axios.get('http://127.0.0.1:4040/api/tunnels');
    const publicUrl = response.data.tunnels[0]?.public_url;
    return publicUrl;
  } catch (error) {
    logger.error("ngrok URL을 가져오는 데 실패했습니다:", error);
    return null;
  }
}

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

// CORS 설정 (최상단에 위치)
const allowedOrigins = [
  'http://localhost:3000',
  'https://c550-49-168-168-61.ngrok-free.app',
  'https://lovetree250411.netlify.app',
  'https://lovetree250411.onrender.com'
];
const corsOptions = {
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
// CORS 헤더 로깅 미들웨어 (최상단)
app.use((req, res, next) => {
  const setHeader = res.setHeader;
  res.setHeader = function(name, value) {
    if (name.toLowerCase().startsWith('access-control')) {
      console.log(`[CORS-DEBUG] ${name}: ${value}`);
    }
    setHeader.apply(this, arguments);
  };
  next();
});

// WebSocket 설정
const io = socketIo(server, {
  cors: {
    origin: corsOptions.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  transports: ['websocket', 'polling']
});

// WebSocket 관리자 초기화
websocketManager.initialize(server);
app.set('io', io);

logger.info('미들웨어 설정', {
  timestamp: new Date().toISOString(),
  corsOrigins: corsOptions.origin,
  allowedMethods: corsOptions.methods,
  allowedHeaders: corsOptions.allowedHeaders
});

// 미들웨어
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       styleSrc: ["'self'", "'unsafe-inline'"],
//       scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "*.youtube.com"],
//       frameSrc: ["'self'", "*.youtube.com", "*.youtu.be"],
//       imgSrc: ["'self'", "data:", "*.ytimg.com"]
//     }
//   }
// }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use(limiter);
// app.use((req, res, next) => {
//   ...
// });
app.get('/api/config', (req, res) => {
  res.json({
    apiUrl: 'http://localhost:8080',
    wsUrl: 'ws://localhost:8080',
    version: '1.0.0',
    env: process.env.NODE_ENV || 'development'
  });
});
app.use('/api/profile', profileRoutes);
// app.get('/', (req, res) => {
//   ...
// });
// app.use((err, req, res, next) => {
//   ...
// });

console.log('[진단] 미들웨어/라우트 등록 직전');
// 미들웨어 및 라우트 등록 코드 전체 주석 처리
app.use('/api/auth', authRoutes);
// app.use('/api/auth', googleAuthRoutes);
// app.use('/api/posts', postRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/chat', auth, chatRoutes);
// app.use('/api/comments', auth, commentRoutes);
app.use('/api/trees', treesRoutes);
// app.use('/api/follow', followRoutes);
console.log('[진단] 미들웨어/라우트 등록 이후');
console.log('[진단] mongoose.connect() 실행 직전');
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  logger.info('MongoDB 연결 성공', {
    timestamp: new Date().toISOString(),
    dbName: mongoose.connection.name
  });
  console.log('[진단] mongoose.connect() then 진입');
}).catch(error => {
  logger.error('MongoDB 연결 실패', {
    timestamp: new Date().toISOString(),
    error: error.message
  });
  console.log('[MongoDB 연결 실패]', error);
});
console.log('[진단] mongoose.connect() 실행 이후');
console.log('[진단] server.listen() 실행 직전');
const PORT = ports.SERVER || 5000;
server.listen(PORT, () => {
  const duration = Date.now() - startTime;
  logger.info('서버 시작', {
    timestamp: new Date().toISOString(),
    port: PORT,
    duration: `${duration}ms`
  });
  console.log(`[진단] 서버가 ${PORT}번 포트에서 실행 중입니다`);
});
console.log('[진단] server.listen() 실행 이후');

// Socket.IO 초기화
initSocket(server);
logger.info('Socket.IO 초기화 완료', {
  timestamp: new Date().toISOString()
});

// WebSocket 연결 이벤트
io.on('connection', (socket) => {
  logger.info('WebSocket 클라이언트 연결', {
    timestamp: new Date().toISOString(),
    socketId: socket.id
  });

  socket.on('disconnect', () => {
    logger.info('WebSocket 클라이언트 연결 해제', {
      timestamp: new Date().toISOString(),
      socketId: socket.id
    });
  });
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
