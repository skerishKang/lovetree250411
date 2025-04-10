const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const logger = require('../utils/logger');

// 요청 로깅 미들웨어
router.use((req, res, next) => {
  const startTime = Date.now();
  
  logger.info('알림 라우트 요청', {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    params: req.params,
    query: req.query,
    body: req.body,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user ? req.user._id : null
  });

  // 응답 로깅
  res.on('finish', () => {
    logger.info('알림 라우트 응답', {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      processTime: `${Date.now() - startTime}ms`
    });
  });

  next();
});

// 알림 목록 조회
router.get('/', auth, getNotifications);

// 알림 읽음 처리
router.put('/:id/read', auth, markAsRead);

// 모든 알림 읽음 처리
router.put('/read-all', auth, markAllAsRead);

// 알림 삭제
router.delete('/:id', auth, deleteNotification);

module.exports = router; 