const express = require('express');
const router = express.Router();
const treeController = require('../controllers/treeController');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

// 요청 로깅 미들웨어
router.use((req, res, next) => {
  const startTime = Date.now();
  
  logger.info('트리 라우트 요청', {
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
    logger.info('트리 라우트 응답', {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      processTime: `${Date.now() - startTime}ms`
    });
  });

  next();
});

// 트리 목록 조회
router.get('/', treeController.getNodes);

// 트리 생성
router.post('/', auth, treeController.createNode);

// 트리 상세 조회
router.get('/:id', treeController.getNode);

// 트리 업데이트
router.put('/:id', auth, treeController.updateNode);

// 트리 삭제
router.delete('/:id', auth, treeController.deleteNode);

// 좋아요 토글
router.post('/:id/like', auth, treeController.toggleLike);

// 댓글 추가
router.post('/:id/comment', auth, treeController.addComment);

module.exports = router; 