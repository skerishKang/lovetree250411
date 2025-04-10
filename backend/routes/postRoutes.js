const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  addComment
} = require('../controllers/postController');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

// 라우트 요청 로깅 미들웨어
const logRequest = (req, res, next) => {
  const startTime = Date.now();
  logger.info('게시물 라우트 요청', {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    ip: req.ip,
    params: req.params,
    query: req.query,
    body: req.body,
    headers: {
      authorization: req.headers.authorization ? '존재함' : '없음'
    },
    user: req.user ? {
      id: req.user._id,
      username: req.user.name
    } : null
  });

  // 응답 로깅을 위한 미들웨어
  const originalSend = res.send;
  res.send = function(body) {
    logger.info('게시물 라우트 응답', {
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      statusCode: res.statusCode,
      responseTime: `${Date.now() - startTime}ms`,
      bodyLength: body ? body.length : 0
    });
    return originalSend.call(this, body);
  };

  next();
};

// 게시물 라우트
router.route('/')
  .get(logRequest, getPosts)
  .post(auth, logRequest, createPost);

router.route('/:id')
  .get(logRequest, getPost)
  .put(auth, logRequest, updatePost)
  .delete(auth, logRequest, deletePost);

router.route('/:id/like')
  .put(auth, logRequest, likePost);

router.route('/:id/comments')
  .post(auth, logRequest, addComment);

module.exports = router; 