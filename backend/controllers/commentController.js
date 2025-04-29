const Comment = require('../models/Comment');
const Post = require('../models/Post');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

// 댓글 생성
exports.createComment = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('댓글 생성 시도', {
      timestamp: new Date().toISOString(),
      userId: req.user._id,
      username: req.user.name,
      postId: req.body.postId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      contentLength: req.body.content?.length || 0
    });

    const { content, postId } = req.body;
    const author = req.user._id;

    const comment = new Comment({
      content,
      author,
      post: postId
    });

    await comment.save();
    logger.info('댓글 생성 성공', {
      timestamp: new Date().toISOString(),
      commentId: comment._id,
      contentLength: content.length,
      processTime: `${Date.now() - startTime}ms`
    });

    // 게시물의 댓글 수 증가
    const post = await Post.findByIdAndUpdate(
      postId, 
      { $inc: { commentCount: 1 } },
      { new: true }
    );
    logger.info('게시물 댓글 수 증가', {
      timestamp: new Date().toISOString(),
      postId,
      postTitle: post.title,
      commentId: comment._id,
      previousCount: post.commentCount - 1,
      currentCount: post.commentCount,
      processTime: `${Date.now() - startTime}ms`
    });

    // 작성자 정보와 함께 댓글 반환
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name profileImage');

    logger.info('댓글 작성자 정보 조회 완료', {
      timestamp: new Date().toISOString(),
      commentId: populatedComment._id,
      authorId: populatedComment.author._id,
      authorName: populatedComment.author.name,
      processTime: `${Date.now() - startTime}ms`
    });

    res.status(201).json(populatedComment);
  } catch (error) {
    logger.error('댓글 생성 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      userId: req.user._id,
      username: req.user.name,
      postId: req.body.postId,
      processTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ 
      error: '댓글 생성 실패',
      message: '댓글 작성에 실패했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 댓글 삭제
exports.deleteComment = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('댓글 삭제 시도', {
      timestamp: new Date().toISOString(),
      commentId: req.params.id,
      userId: req.user._id,
      username: req.user.name,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      logger.warn('댓글을 찾을 수 없음', {
        timestamp: new Date().toISOString(),
        commentId: req.params.id,
        queryTime: `${Date.now() - startTime}ms`
      });
      return res.status(404).json({ 
        error: '삭제 실패',
        message: '댓글을 찾을 수 없습니다.'
      });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      logger.warn('댓글 삭제 권한 없음', {
        timestamp: new Date().toISOString(),
        commentId: comment._id,
        authorId: comment.author,
        authorName: comment.author.name,
        userId: req.user._id,
        username: req.user.name,
        queryTime: `${Date.now() - startTime}ms`
      });
      return res.status(403).json({ 
        error: '권한 없음',
        message: '댓글을 삭제할 권한이 없습니다.'
      });
    }

    await comment.remove();
    logger.info('댓글 삭제 성공', {
      timestamp: new Date().toISOString(),
      commentId: comment._id,
      contentLength: comment.content.length,
      processTime: `${Date.now() - startTime}ms`
    });

    // 게시물의 댓글 수 감소
    const post = await Post.findByIdAndUpdate(
      comment.post, 
      { $inc: { commentCount: -1 } },
      { new: true }
    );
    logger.info('게시물 댓글 수 감소', {
      timestamp: new Date().toISOString(),
      postId: comment.post,
      postTitle: post.title,
      commentId: comment._id,
      previousCount: post.commentCount + 1,
      currentCount: post.commentCount,
      processTime: `${Date.now() - startTime}ms`
    });

    res.json({ message: '댓글이 삭제되었습니다.' });
  } catch (error) {
    logger.error('댓글 삭제 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      commentId: req.params.id,
      userId: req.user._id,
      username: req.user.name,
      processTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ 
      error: '삭제 실패',
      message: '댓글 삭제에 실패했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 게시물의 댓글 목록 가져오기
exports.getComments = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('댓글 목록 조회 시작', {
      timestamp: new Date().toISOString(),
      postId: req.params.postId,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'name profileImage')
      .sort({ createdAt: -1 });

    logger.info('댓글 목록 조회 성공', {
      timestamp: new Date().toISOString(),
      postId: req.params.postId,
      count: comments.length,
      authorIds: comments.map(c => c.author._id),
      processTime: `${Date.now() - startTime}ms`
    });

    res.json(comments);
  } catch (error) {
    logger.error('댓글 목록 조회 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      postId: req.params.postId,
      processTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ 
      error: '조회 실패',
      message: '댓글 목록을 불러오는데 실패했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 댓글 추가
exports.addComment = async (req, res) => {
  try {
    const { content, targetType, targetId } = req.body;
    const author = req.user._id;
    const comment = await Comment.create({ content, author, targetType, targetId });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: '댓글 추가 실패', error: err.message });
  }
};

// 댓글 삭제
exports.removeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findByIdAndDelete(commentId);
    if (!comment) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }
    res.json({ message: '댓글 삭제 성공' });
  } catch (err) {
    res.status(500).json({ message: '댓글 삭제 실패', error: err.message });
  }
};

// 특정 대상의 댓글 목록 조회
exports.getComments = async (req, res) => {
  try {
    const { targetType, targetId } = req.query;
    const comments = await Comment.find({ targetType, targetId }).populate('author', 'name profileImage');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: '댓글 목록 조회 실패', error: err.message });
  }
}; 