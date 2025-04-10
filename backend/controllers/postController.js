const Post = require('../models/Post');
const { createNotification } = require('./notificationController');
const logger = require('../utils/logger');

// @desc    게시물 생성
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('게시물 생성 시도', {
      timestamp: new Date().toISOString(),
      userId: req.user._id,
      username: req.user.name,
      ip: req.ip,
      requestBody: {
        title: req.body.title,
        contentLength: req.body.content?.length || 0,
        imageCount: req.body.images?.length || 0,
        tagCount: req.body.tags?.length || 0,
        isPublic: req.body.isPublic
      }
    });

    const { title, content, images, tags, isPublic } = req.body;
    const post = await Post.create({
      title,
      content,
      images,
      tags,
      isPublic,
      author: req.user._id
    });

    logger.info('게시물 생성 성공', {
      timestamp: new Date().toISOString(),
      postId: post._id,
      title: post.title,
      isPublic: post.isPublic,
      tags: post.tags,
      imageCount: post.images?.length || 0,
      contentLength: post.content?.length || 0,
      processTime: `${Date.now() - startTime}ms`
    });

    res.status(201).json(post);
  } catch (error) {
    logger.error('게시물 생성 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      userId: req.user._id,
      username: req.user.name,
      processTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ 
      error: '게시물 생성 실패',
      message: '게시물 생성에 실패했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    게시물 목록 조회
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('게시물 목록 조회 시작', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      query: {
        page: req.query.page,
        sortBy: req.query.sortBy,
        category: req.query.category
      }
    });

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const query = { isPublic: true };
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }

    let sortOption = { createdAt: -1 };
    if (req.query.sortBy === 'popular') {
      sortOption = { likes: -1, createdAt: -1 };
    }

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'name profileImage')
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Post.countDocuments(query)
    ]);

    logger.info('게시물 목록 조회 성공', {
      timestamp: new Date().toISOString(),
      totalPosts: total,
      currentPage: page,
      postsPerPage: limit,
      processTime: `${Date.now() - startTime}ms`
    });

    res.json({
      posts,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('게시물 목록 조회 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      processTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({
      error: '게시물 목록 조회 실패',
      message: '게시물 목록을 불러오는데 실패했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    게시물 상세 조회
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('게시물 상세 조회 시도', {
      timestamp: new Date().toISOString(),
      postId: req.params.id,
      ip: req.ip,
      userId: req.user?._id
    });

    const post = await Post.findById(req.params.id)
      .populate('author', 'name profileImage')
      .populate('comments.user', 'name profileImage');

    if (!post) {
      logger.warn('게시물을 찾을 수 없음', {
        timestamp: new Date().toISOString(),
        postId: req.params.id,
        queryTime: `${Date.now() - startTime}ms`
      });
      return res.status(404).json({ 
        error: '조회 실패',
        message: '게시물을 찾을 수 없습니다.'
      });
    }

    // 조회수 증가
    const previousViews = post.views;
    await post.incrementViewCount();
    logger.info('게시물 조회수 증가', {
      timestamp: new Date().toISOString(),
      postId: post._id,
      previousViews,
      currentViews: post.views,
      queryTime: `${Date.now() - startTime}ms`
    });

    logger.info('게시물 상세 조회 성공', {
      timestamp: new Date().toISOString(),
      postId: post._id,
      title: post.title,
      authorId: post.author._id,
      commentCount: post.comments.length,
      viewCount: post.views,
      queryTime: `${Date.now() - startTime}ms`
    });

    res.json(post);
  } catch (error) {
    logger.error('게시물 상세 조회 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      postId: req.params.id,
      queryTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ 
      error: '조회 실패',
      message: '게시물 조회에 실패했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    게시물 수정
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('게시물 수정 시도', {
      timestamp: new Date().toISOString(),
      postId: req.params.id,
      userId: req.user._id,
      username: req.user.name,
      ip: req.ip,
      updateData: {
        title: req.body.title,
        contentLength: req.body.content?.length || 0,
        imageCount: req.body.images?.length || 0,
        tagCount: req.body.tags?.length || 0,
        isPublic: req.body.isPublic
      }
    });

    const post = await Post.findById(req.params.id);

    if (!post) {
      logger.warn('게시물을 찾을 수 없음', {
        timestamp: new Date().toISOString(),
        postId: req.params.id,
        queryTime: `${Date.now() - startTime}ms`
      });
      return res.status(404).json({ 
        error: '수정 실패',
        message: '게시물을 찾을 수 없습니다.'
      });
    }

    // 작성자 확인
    if (post.author.toString() !== req.user._id.toString()) {
      logger.warn('게시물 수정 권한 없음', {
        timestamp: new Date().toISOString(),
        postId: post._id,
        authorId: post.author,
        userId: req.user._id,
        queryTime: `${Date.now() - startTime}ms`
      });
      return res.status(403).json({ 
        error: '권한 없음',
        message: '수정 권한이 없습니다.'
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    logger.info('게시물 수정 성공', {
      timestamp: new Date().toISOString(),
      postId: updatedPost._id,
      title: updatedPost.title,
      isPublic: updatedPost.isPublic,
      processTime: `${Date.now() - startTime}ms`
    });

    res.json(updatedPost);
  } catch (error) {
    logger.error('게시물 수정 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      postId: req.params.id,
      userId: req.user._id,
      processTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ 
      error: '수정 실패',
      message: '게시물 수정에 실패했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    게시물 삭제
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('게시물 삭제 시도', {
      timestamp: new Date().toISOString(),
      postId: req.params.id,
      userId: req.user._id,
      username: req.user.name,
      ip: req.ip
    });

    const post = await Post.findById(req.params.id);

    if (!post) {
      logger.warn('게시물을 찾을 수 없음', {
        timestamp: new Date().toISOString(),
        postId: req.params.id,
        queryTime: `${Date.now() - startTime}ms`
      });
      return res.status(404).json({ 
        error: '삭제 실패',
        message: '게시물을 찾을 수 없습니다.'
      });
    }

    // 작성자 확인
    if (post.author.toString() !== req.user._id.toString()) {
      logger.warn('게시물 삭제 권한 없음', {
        timestamp: new Date().toISOString(),
        postId: post._id,
        authorId: post.author,
        userId: req.user._id,
        queryTime: `${Date.now() - startTime}ms`
      });
      return res.status(403).json({ 
        error: '권한 없음',
        message: '삭제 권한이 없습니다.'
      });
    }

    await post.remove();
    logger.info('게시물 삭제 성공', {
      timestamp: new Date().toISOString(),
      postId: post._id,
      deleteTime: `${Date.now() - startTime}ms`
    });

    res.json({ message: '게시물이 삭제되었습니다.' });
  } catch (error) {
    logger.error('게시물 삭제 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      postId: req.params.id,
      userId: req.user._id,
      deleteTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ 
      error: '삭제 실패',
      message: '게시물 삭제에 실패했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    게시물 좋아요
// @route   PUT /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('게시물 좋아요 시도', {
      timestamp: new Date().toISOString(),
      postId: req.params.id,
      userId: req.user._id,
      username: req.user.name,
      ip: req.ip
    });

    const post = await Post.findById(req.params.id);

    if (!post) {
      logger.warn('게시물을 찾을 수 없음', {
        timestamp: new Date().toISOString(),
        postId: req.params.id,
        queryTime: `${Date.now() - startTime}ms`
      });
      return res.status(404).json({ 
        error: '좋아요 실패',
        message: '게시물을 찾을 수 없습니다.'
      });
    }

    // 이미 좋아요를 눌렀는지 확인
    const isLiked = post.likes.includes(req.user._id);
    const previousLikes = post.likes.length;

    if (isLiked) {
      // 좋아요 취소
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
      logger.info('게시물 좋아요 취소', {
        timestamp: new Date().toISOString(),
        postId: post._id,
        userId: req.user._id,
        previousLikes,
        currentLikes: post.likes.length,
        processTime: `${Date.now() - startTime}ms`
      });
    } else {
      // 좋아요 추가
      post.likes.push(req.user._id);
      logger.info('게시물 좋아요 추가', {
        timestamp: new Date().toISOString(),
        postId: post._id,
        userId: req.user._id,
        previousLikes,
        currentLikes: post.likes.length,
        processTime: `${Date.now() - startTime}ms`
      });

      // 알림 생성
      if (post.author.toString() !== req.user._id.toString()) {
        await createNotification({
          recipient: post.author,
          sender: req.user._id,
          type: 'like',
          post: post._id,
          link: `/posts/${post._id}`
        });
        logger.info('좋아요 알림 생성', {
          timestamp: new Date().toISOString(),
          recipient: post.author,
          sender: req.user._id,
          postId: post._id,
          notificationType: 'like'
        });
      }
    }

    await post.save();
    res.json(post);
  } catch (error) {
    logger.error('게시물 좋아요 처리 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      postId: req.params.id,
      userId: req.user._id,
      processTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ 
      error: '처리 실패',
      message: '좋아요 처리에 실패했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    댓글 추가
// @route   POST /api/posts/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('댓글 추가 시도', {
      timestamp: new Date().toISOString(),
      postId: req.params.id,
      userId: req.user._id,
      username: req.user.name,
      ip: req.ip
    });

    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      logger.warn('게시물을 찾을 수 없음', {
        timestamp: new Date().toISOString(),
        postId: req.params.id,
        queryTime: `${Date.now() - startTime}ms`
      });
      return res.status(404).json({ 
        error: '댓글 추가 실패',
        message: '게시물을 찾을 수 없습니다.'
      });
    }

    const previousComments = post.comments.length;
    post.comments.push({
      user: req.user._id,
      content
    });

    await post.save();
    logger.info('댓글 추가 성공', {
      timestamp: new Date().toISOString(),
      postId: post._id,
      commentId: post.comments[post.comments.length - 1]._id,
      previousComments,
      currentComments: post.comments.length,
      processTime: `${Date.now() - startTime}ms`
    });

    // 알림 생성
    if (post.author.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: post.author,
        sender: req.user._id,
        type: 'comment',
        post: post._id,
        link: `/posts/${post._id}`
      });
      logger.info('댓글 알림 생성', {
        timestamp: new Date().toISOString(),
        recipient: post.author,
        sender: req.user._id,
        postId: post._id,
        notificationType: 'comment'
      });
    }

    res.status(201).json(post);
  } catch (error) {
    logger.error('댓글 추가 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      postId: req.params.id,
      userId: req.user._id,
      processTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ 
      error: '댓글 추가 실패',
      message: '댓글 추가에 실패했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 좋아요 토글
exports.toggleLike = async (req, res) => {
  try {
    logger.info('게시물 좋아요 토글 시도:', { postId: req.params.id, userId: req.user._id });
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      logger.warn('게시물을 찾을 수 없음:', { postId: req.params.id });
      return res.status(404).json({ message: '게시물을 찾을 수 없습니다.' });
    }

    const userId = req.user._id;
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex === -1) {
      // 좋아요 추가
      post.likes.push(userId);
    } else {
      // 좋아요 제거
      post.likes.splice(likeIndex, 1);
    }

    await post.save();

    res.json({
      likes: post.likes,
      likeCount: post.likes.length
    });
  } catch (error) {
    console.error('좋아요 처리 오류:', error);
    res.status(500).json({ message: '좋아요 처리에 실패했습니다.' });
  }
}; 