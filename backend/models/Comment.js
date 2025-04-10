const mongoose = require('mongoose');
const logger = require('../utils/logger');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 댓글 생성/수정/삭제 시 로깅
commentSchema.post('save', function(doc) {
  logger.info('댓글 저장/수정', {
    timestamp: new Date().toISOString(),
    commentId: doc._id,
    postId: doc.post,
    authorId: doc.author,
    contentLength: doc.content.length,
    isNew: doc.isNew
  });
});

commentSchema.post('remove', function(doc) {
  logger.info('댓글 삭제', {
    timestamp: new Date().toISOString(),
    commentId: doc._id,
    postId: doc.post,
    authorId: doc.author
  });
});

// 댓글 내용 변경 시 로깅
commentSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    logger.info('댓글 내용 변경', {
      timestamp: new Date().toISOString(),
      commentId: this._id,
      postId: this.post,
      authorId: this.author,
      previousContentLength: this._previousContent ? this._previousContent.length : 0,
      currentContentLength: this.content.length
    });
  }
  next();
});

module.exports = mongoose.model('Comment', commentSchema); 