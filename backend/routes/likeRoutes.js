const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');
const auth = require('../middleware/auth');

// 좋아요 추가
router.post('/', auth, likeController.addLike);
// 좋아요 취소
router.delete('/', auth, likeController.removeLike);
// 특정 대상의 좋아요 수 조회
router.get('/count', likeController.getLikeCount);
// 특정 대상의 좋아요 목록 조회
router.get('/', likeController.getLikes);

module.exports = router; 