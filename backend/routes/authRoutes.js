const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

// 라우트 요청 로깅 미들웨어
const logRequest = (req, res, next) => {
  const startTime = Date.now();
  logger.info('인증 라우트 요청', {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    ip: req.ip,
    body: req.body
  });

  // 응답 로깅을 위한 미들웨어
  const originalSend = res.send;
  res.send = function(body) {
    logger.info('인증 라우트 응답', {
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      statusCode: res.statusCode,
      responseTime: `${Date.now() - startTime}ms`
    });
    return originalSend.call(this, body);
  };

  next();
};

// 인증 라우트
router.post('/register', logRequest, register);
router.post('/login', logRequest, login);
router.get('/me', protect, logRequest, getMe);

module.exports = router; 