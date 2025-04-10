const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
} = require('../controllers/followController');
const logger = require('../utils/logger');

// 라우트 요청 로깅 미들웨어
const logRequest = (req, res, next) => {
  const startTime = Date.now();
  logger.info('팔로우 라우트 요청', {
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
    logger.info('팔로우 라우트 응답', {
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

// 팔로우
router.post('/:userId/follow', auth, logRequest, followUser);

// 언팔로우
router.delete('/:userId/follow', auth, logRequest, unfollowUser);

// 팔로워 목록 조회
router.get('/:userId/followers', logRequest, getFollowers);

// 팔로잉 목록 조회
router.get('/:userId/following', logRequest, getFollowing);

module.exports = router; 