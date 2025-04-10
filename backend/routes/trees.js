const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Tree = require('../models/Tree');
const mongoose = require('mongoose');

/**
 * @route   POST /api/trees
 * @desc    트리 생성
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  try {
    // MongoDB 연결 상태 확인
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB 연결 상태:', mongoose.connection.readyState);
      return res.status(500).json({ message: '데이터베이스 연결이 끊어졌습니다.' });
    }

    console.log('트리 생성 요청 수신:', req.body);
    console.log('요청 사용자:', req.user);
    
    const { title, description } = req.body;

    if (!req.user || !req.user.id) {
      console.error('사용자 정보 없음:', req.user);
      return res.status(401).json({ message: '사용자 인증이 필요합니다.' });
    }

    // 유효성 검사
    if (!title) {
      return res.status(400).json({ message: '트리 제목은 필수입니다.' });
    }

    try {
      // ObjectId 변환 시도
      const authorId = new mongoose.Types.ObjectId(req.user.id);

      // 새 트리 생성
      const newTree = new Tree({
        title,
        description: description || '',
        author: authorId
      });

      console.log('생성 중인 트리 객체:', newTree);

      const savedTree = await newTree.save();
      console.log('생성된 트리:', savedTree);

      res.status(201).json(savedTree);
    } catch (castError) {
      console.error('ObjectId 변환 오류:', castError);
      return res.status(400).json({
        message: '잘못된 사용자 ID 형식입니다.',
        details: castError.message
      });
    }
  } catch (error) {
    console.error('트리 생성 오류 상세:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: '입력 데이터가 유효하지 않습니다.', 
        details: error.message 
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: '잘못된 ID 형식입니다.',
        details: error.message
      });
    }

    if (error.name === 'MongoError' || error.name === 'MongooseError') {
      return res.status(500).json({
        message: '데이터베이스 오류가 발생했습니다.',
        details: error.message
      });
    }
    
    res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/trees
 * @desc    사용자의 트리 목록 조회
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    // MongoDB 연결 상태 확인
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: '데이터베이스 연결이 끊어졌습니다.' });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: '사용자 인증이 필요합니다.' });
    }

    console.log('트리 목록 조회 - 사용자 ID:', req.user.id);

    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ message: '유효하지 않은 사용자 ID입니다.' });
    }

    const trees = await Tree.find({ author: req.user.id })
      .sort({ createdAt: -1 });
    
    console.log(`${trees.length}개의 트리를 찾았습니다.`);
    
    res.json(trees);
  } catch (error) {
    console.error('트리 목록 조회 오류:', error);
    res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/trees/:id
 * @desc    특정 트리의 상세 정보 조회
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    // MongoDB 연결 상태 확인
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: '데이터베이스 연결이 끊어졌습니다.' });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: '사용자 인증이 필요합니다.' });
    }

    const { id } = req.params;
    console.log('트리 상세 조회 - 트리 ID:', id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '유효하지 않은 트리 ID입니다.' });
    }

    const tree = await Tree.findById(id);
    
    if (!tree) {
      return res.status(404).json({ message: '트리를 찾을 수 없습니다.' });
    }

    // 트리 작성자와 요청자가 같은지 확인
    if (tree.author.toString() !== req.user.id) {
      return res.status(403).json({ message: '이 트리에 접근할 권한이 없습니다.' });
    }
    
    console.log('트리를 찾았습니다:', tree);
    res.json(tree);
  } catch (error) {
    console.error('트리 상세 조회 오류:', error);
    res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// PUT 메서드로 노드 업데이트 처리
router.put('/:id/nodes', async (req, res) => {
  try {
    const { id } = req.params;
    const { nodes, edges } = req.body;
    
    const tree = await Tree.findById(id);
    if (!tree) {
      return res.status(404).json({ message: '트리를 찾을 수 없습니다.' });
    }
    
    tree.nodes = nodes;
    tree.edges = edges;
    await tree.save();
    
    res.json(tree);
  } catch (error) {
    console.error('노드 업데이트 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 라우터 테스트 엔드포인트
router.get('/test', (req, res) => {
  res.json({ message: 'Trees API 라우터가 정상 작동 중입니다.' });
});

module.exports = router; 