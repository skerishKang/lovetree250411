const TreeNode = require('../models/treeNode');
const logger = require('../utils/logger');
const Tree = require('../models/Tree');

// 트리 노드 생성
exports.createNode = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('트리 노드 생성 시도', {
      timestamp: new Date().toISOString(),
      userId: req.user._id,
      requestBody: req.body
    });

    const node = new TreeNode({
      ...req.body,
      user: req.user._id,
    });
    await node.save();

    logger.info('트리 노드 생성 성공', {
      timestamp: new Date().toISOString(),
      nodeId: node._id,
      userId: req.user._id,
      processTime: `${Date.now() - startTime}ms`
    });

    res.status(201).json(node);
  } catch (error) {
    logger.error('트리 노드 생성 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      userId: req.user._id
    });
    res.status(400).json({ message: error.message });
  }
};

// 트리 노드 조회
exports.getNode = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('트리 노드 조회 시도', {
      timestamp: new Date().toISOString(),
      nodeId: req.params.id,
      userId: req.user._id
    });

    const node = await TreeNode.findById(req.params.id)
      .populate('user', 'name')
      .populate('children')
      .populate('comments');

    if (!node) {
      logger.warn('트리 노드 조회 실패 - 노드를 찾을 수 없음', {
        timestamp: new Date().toISOString(),
        nodeId: req.params.id
      });
      return res.status(404).json({ message: '노드를 찾을 수 없습니다.' });
    }

    logger.info('트리 노드 조회 성공', {
      timestamp: new Date().toISOString(),
      nodeId: node._id,
      processTime: `${Date.now() - startTime}ms`
    });

    res.json(node);
  } catch (error) {
    logger.error('트리 노드 조회 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      nodeId: req.params.id
    });
    res.status(500).json({ message: error.message });
  }
};

// 트리 노드 업데이트
exports.updateNode = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('트리 노드 업데이트 시도', {
      timestamp: new Date().toISOString(),
      nodeId: req.params.id,
      userId: req.user._id,
      requestBody: req.body
    });

    const node = await TreeNode.findById(req.params.id);
    if (!node) {
      logger.warn('트리 노드 업데이트 실패 - 노드를 찾을 수 없음', {
        timestamp: new Date().toISOString(),
        nodeId: req.params.id
      });
      return res.status(404).json({ message: '노드를 찾을 수 없습니다.' });
    }

    if (node.user.toString() !== req.user._id.toString()) {
      logger.warn('트리 노드 업데이트 실패 - 권한 없음', {
        timestamp: new Date().toISOString(),
        nodeId: node._id,
        userId: req.user._id
      });
      return res.status(403).json({ message: '권한이 없습니다.' });
    }

    Object.assign(node, req.body);
    await node.save();

    logger.info('트리 노드 업데이트 성공', {
      timestamp: new Date().toISOString(),
      nodeId: node._id,
      processTime: `${Date.now() - startTime}ms`
    });

    res.json(node);
  } catch (error) {
    logger.error('트리 노드 업데이트 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      nodeId: req.params.id
    });
    res.status(400).json({ message: error.message });
  }
};

// 트리 노드 삭제
exports.deleteNode = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('트리 노드 삭제 시도', {
      timestamp: new Date().toISOString(),
      nodeId: req.params.id,
      userId: req.user._id
    });

    const node = await TreeNode.findById(req.params.id);
    if (!node) {
      logger.warn('트리 노드 삭제 실패 - 노드를 찾을 수 없음', {
        timestamp: new Date().toISOString(),
        nodeId: req.params.id
      });
      return res.status(404).json({ message: '노드를 찾을 수 없습니다.' });
    }

    if (node.user.toString() !== req.user._id.toString()) {
      logger.warn('트리 노드 삭제 실패 - 권한 없음', {
        timestamp: new Date().toISOString(),
        nodeId: node._id,
        userId: req.user._id
      });
      return res.status(403).json({ message: '권한이 없습니다.' });
    }

    await node.remove();

    logger.info('트리 노드 삭제 성공', {
      timestamp: new Date().toISOString(),
      nodeId: node._id,
      processTime: `${Date.now() - startTime}ms`
    });

    res.json({ message: '노드가 삭제되었습니다.' });
  } catch (error) {
    logger.error('트리 노드 삭제 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      nodeId: req.params.id
    });
    res.status(500).json({ message: error.message });
  }
};

// 트리 노드 목록 조회
exports.getNodes = async (req, res) => {
  const startTime = Date.now();
  try {
    const { page = 1, limit = 10, search, tag } = req.query;
    const query = {};

    logger.info('트리 노드 목록 조회 시도', {
      timestamp: new Date().toISOString(),
      page,
      limit,
      search,
      tag
    });

    if (search) {
      query.$text = { $search: search };
    }

    if (tag) {
      query.tags = tag;
    }

    const nodes = await TreeNode.find(query)
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await TreeNode.countDocuments(query);

    logger.info('트리 노드 목록 조회 성공', {
      timestamp: new Date().toISOString(),
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      processTime: `${Date.now() - startTime}ms`
    });

    res.json({
      nodes,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    logger.error('트리 노드 목록 조회 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });
    res.status(500).json({ message: error.message });
  }
};

// 좋아요 토글
exports.toggleLike = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('트리 노드 좋아요 토글 시도', {
      timestamp: new Date().toISOString(),
      nodeId: req.params.id,
      userId: req.user._id
    });

    const node = await TreeNode.findById(req.params.id);
    if (!node) {
      logger.warn('트리 노드 좋아요 토글 실패 - 노드를 찾을 수 없음', {
        timestamp: new Date().toISOString(),
        nodeId: req.params.id
      });
      return res.status(404).json({ message: '노드를 찾을 수 없습니다.' });
    }

    const index = node.likes.indexOf(req.user._id);
    if (index === -1) {
      node.likes.push(req.user._id);
    } else {
      node.likes.splice(index, 1);
    }

    await node.save();

    logger.info('트리 노드 좋아요 토글 성공', {
      timestamp: new Date().toISOString(),
      nodeId: node._id,
      userId: req.user._id,
      isLiked: index === -1,
      processTime: `${Date.now() - startTime}ms`
    });

    res.json(node);
  } catch (error) {
    logger.error('트리 노드 좋아요 토글 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      nodeId: req.params.id
    });
    res.status(400).json({ message: error.message });
  }
};

// 댓글 추가
exports.addComment = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('트리 노드 댓글 추가 시도', {
      timestamp: new Date().toISOString(),
      nodeId: req.params.id,
      userId: req.user._id,
      content: req.body.content
    });

    const node = await TreeNode.findById(req.params.id);
    if (!node) {
      logger.warn('트리 노드 댓글 추가 실패 - 노드를 찾을 수 없음', {
        timestamp: new Date().toISOString(),
        nodeId: req.params.id
      });
      return res.status(404).json({ message: '노드를 찾을 수 없습니다.' });
    }

    const comment = {
      user: req.user._id,
      content: req.body.content,
    };

    node.comments.push(comment);
    await node.save();

    logger.info('트리 노드 댓글 추가 성공', {
      timestamp: new Date().toISOString(),
      nodeId: node._id,
      userId: req.user._id,
      processTime: `${Date.now() - startTime}ms`
    });

    res.status(201).json(node);
  } catch (error) {
    logger.error('트리 노드 댓글 추가 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      nodeId: req.params.id
    });
    res.status(400).json({ message: error.message });
  }
};

// 최신 트리 목록 가져오기
exports.getLatestTrees = async (req, res) => {
  const limit = parseInt(req.query.limit) || 20; // 한 번에 가져올 개수 (기본 20)
  const page = parseInt(req.query.page) || 1; // 페이지 번호 (기본 1)
  const skip = (page - 1) * limit;

  try {
    // 공개된 트리만 가져오기 (isPublic: true)
    const latestTrees = await Tree.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      // .populate('author', 'name profileImage') // 필요시 주석 해제
      .select('title description thumbUrl author createdAt nodes edges');

    const totalTrees = await Tree.countDocuments({ isPublic: true });

    res.status(200).json({
      trees: latestTrees,
      currentPage: page,
      totalPages: Math.ceil(totalTrees / limit),
      totalTrees: totalTrees
    });
  } catch (error) {
    console.error('[Error] 최신 트리 목록 조회 실패:', error);
    res.status(500).json({ message: '서버 오류로 최신 트리 목록을 가져오는데 실패했습니다.', error: error.message });
  }
}; 