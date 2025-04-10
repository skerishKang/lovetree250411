const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const commentController = require('../controllers/commentController');
const logger = require('../utils/logger');

// 라우트 요청 로깅 미들웨어
const logRequest = (req, res, next) => {
  const startTime = Date.now();
  logger.info('댓글 라우트 요청', {
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
    logger.info('댓글 라우트 응답', {
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

// 댓글 생성
router.post('/', auth, logRequest, commentController.createComment);

// 댓글 삭제
router.delete('/:id', auth, logRequest, commentController.deleteComment);

// 게시물의 댓글 목록 가져오기
router.get('/post/:postId', logRequest, commentController.getComments);

module.exports = router; 