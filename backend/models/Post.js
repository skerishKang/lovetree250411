const mongoose = require('mongoose');
const logger = require('../utils/logger');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '제목은 필수 입력 항목입니다.'],
    trim: true,
    maxlength: [100, '제목은 100자 이내로 작성해주세요.']
  },
  content: {
    type: String,
    required: [true, '내용은 필수 입력 항목입니다.']
  },
  images: [{
    type: String
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    enum: ['일상', '여행', '음식', '취미', '스포츠', 'IT', '기타'],
    default: '일상'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 좋아요 수 가상 필드
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// 댓글 수 가상 필드
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// 게시물 생성/수정/삭제 시 로깅
postSchema.post('save', function(doc) {
  logger.info('게시물 저장/수정', {
    timestamp: new Date().toISOString(),
    postId: doc._id,
    title: doc.title,
    authorId: doc.author,
    category: doc.category,
    isPublic: doc.isPublic,
    isNew: doc.isNew
  });
});

postSchema.post('remove', function(doc) {
  logger.info('게시물 삭제', {
    timestamp: new Date().toISOString(),
    postId: doc._id,
    title: doc.title,
    authorId: doc.author,
    category: doc.category
  });
});

// 좋아요 추가/제거 메서드
postSchema.methods.toggleLike = async function(userId) {
  const startTime = Date.now();
  try {
    const index = this.likes.indexOf(userId);
    if (index === -1) {
      this.likes.push(userId);
      logger.info('게시물 좋아요 추가', {
        timestamp: new Date().toISOString(),
        postId: this._id,
        userId,
        previousLikeCount: this.likes.length - 1,
        currentLikeCount: this.likes.length,
        processTime: `${Date.now() - startTime}ms`
      });
    } else {
      this.likes.splice(index, 1);
      logger.info('게시물 좋아요 제거', {
        timestamp: new Date().toISOString(),
        postId: this._id,
        userId,
        previousLikeCount: this.likes.length + 1,
        currentLikeCount: this.likes.length,
        processTime: `${Date.now() - startTime}ms`
      });
    }
    await this.save();
  } catch (error) {
    logger.error('게시물 좋아요 처리 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      postId: this._id,
      userId
    });
    throw error;
  }
};

// 댓글 추가 메서드
postSchema.methods.addComment = async function(userId, content) {
  const startTime = Date.now();
  try {
    this.comments.push({
      user: userId,
      content
    });
    await this.save();
    logger.info('게시물 댓글 추가', {
      timestamp: new Date().toISOString(),
      postId: this._id,
      userId,
      contentLength: content.length,
      previousCommentCount: this.comments.length - 1,
      currentCommentCount: this.comments.length,
      processTime: `${Date.now() - startTime}ms`
    });
  } catch (error) {
    logger.error('게시물 댓글 추가 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      postId: this._id,
      userId
    });
    throw error;
  }
};

// 조회수 증가 메서드
postSchema.methods.incrementViewCount = async function() {
  const startTime = Date.now();
  try {
    const previousCount = this.viewCount;
    this.viewCount += 1;
    await this.save();
    logger.info('게시물 조회수 증가', {
      timestamp: new Date().toISOString(),
      postId: this._id,
      previousViewCount: previousCount,
      currentViewCount: this.viewCount,
      processTime: `${Date.now() - startTime}ms`
    });
  } catch (error) {
    logger.error('게시물 조회수 증가 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      postId: this._id
    });
    throw error;
  }
};

const Post = mongoose.model('Post', postSchema);

module.exports = Post; 