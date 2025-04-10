const express = require('express');
const router = express.Router();
const { searchAll, searchUsers, searchPosts } = require('../controllers/searchController');

// 통합 검색
router.get('/', searchAll);

// 사용자 검색
router.get('/users', searchUsers);

// 게시물 검색
router.get('/posts', searchPosts);

module.exports = router; 