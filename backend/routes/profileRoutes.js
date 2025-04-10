const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getProfile, updateProfile, changePassword } = require('../controllers/profileController');
const upload = require('../config/multer');
const logger = require('../utils/logger');

// 라우트 요청 로깅 미들웨어
const logRequest = (req, res, next) => {
  const startTime = Date.now();
  logger.info('프로필 라우트 요청', {
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
    logger.info('프로필 라우트 응답', {
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

// 프로필 라우트
router.route('/')
  .get(protect, logRequest, getProfile)
  .put(protect, upload.single('profileImage'), logRequest, updateProfile);

router.route('/password')
  .put(protect, logRequest, changePassword);

module.exports = router; 