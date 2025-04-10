const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const logger = require('../utils/logger');

// 라우트 요청 로깅 미들웨어
const logRequest = (req, res, next) => {
  const startTime = Date.now();
  logger.info('사용자 라우트 요청', {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    ip: req.ip,
    params: req.params,
    query: req.query,
    body: req.body,
    user: req.user ? {
      id: req.user._id,
      username: req.user.name
    } : null
  });

  // 응답 로깅을 위한 미들웨어
  const originalSend = res.send;
  res.send = function(body) {
    logger.info('사용자 라우트 응답', {
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

// 사용자 프로필 조회
router.get('/profile', protect, logRequest, userController.getProfile);

// 사용자 프로필 수정
router.put('/profile', protect, logRequest, userController.updateProfile);

// 사용자 비밀번호 변경
router.put('/password', protect, logRequest, userController.updatePassword);

// 사용자 팔로우/언팔로우
router.post('/:userId/follow', protect, logRequest, userController.toggleFollow);

// 팔로워 목록 조회
router.get('/:userId/followers', logRequest, userController.getFollowers);

// 팔로잉 목록 조회
router.get('/:userId/following', logRequest, userController.getFollowing);

module.exports = router; 