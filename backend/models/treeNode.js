const mongoose = require('mongoose');
const logger = require('../utils/logger');

const treeNodeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['root', 'branch', 'leaf'],
      default: 'leaf',
    },
    stage: {
      type: String,
      enum: ['seed', 'sprout', 'tree'],
      default: 'seed',
    },
    media: [{
      type: String,
      trim: true
    }],
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    thumbUrl: {
      type: String,
      default: ''
    },
    recommendationScore: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TreeNode',
    },
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TreeNode',
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    tags: [
      {
        type: String,
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
    permissions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        accessLevel: {
          type: String,
          enum: ['read', 'write', 'admin'],
          default: 'read',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// 인덱스 생성
treeNodeSchema.index({ content: 'text', tags: 'text' });

// 가상 필드: 좋아요 수
treeNodeSchema.virtual('likeCount').get(function () {
  return this.likes.length;
});

// 가상 필드: 댓글 수
treeNodeSchema.virtual('commentCount').get(function () {
  return this.comments.length;
});

// 트리 노드 생성/수정/삭제 시 로깅
treeNodeSchema.post('save', function(doc) {
  logger.info('트리 노드 저장/수정', {
    timestamp: new Date().toISOString(),
    nodeId: doc._id,
    userId: doc.user,
    type: doc.type,
    stage: doc.stage,
    isPublic: doc.isPublic,
    isNew: doc.isNew
  });
});

treeNodeSchema.post('remove', function(doc) {
  logger.info('트리 노드 삭제', {
    timestamp: new Date().toISOString(),
    nodeId: doc._id,
    userId: doc.user,
    type: doc.type,
    stage: doc.stage
  });
});

// 좋아요 추가/제거 메서드
treeNodeSchema.methods.toggleLike = async function(userId) {
  const startTime = Date.now();
  try {
    const index = this.likes.indexOf(userId);
    if (index === -1) {
      this.likes.push(userId);
      logger.info('트리 노드 좋아요 추가', {
        timestamp: new Date().toISOString(),
        nodeId: this._id,
        userId,
        previousLikeCount: this.likes.length - 1,
        currentLikeCount: this.likes.length,
        processTime: `${Date.now() - startTime}ms`
      });
    } else {
      this.likes.splice(index, 1);
      logger.info('트리 노드 좋아요 제거', {
        timestamp: new Date().toISOString(),
        nodeId: this._id,
        userId,
        previousLikeCount: this.likes.length + 1,
        currentLikeCount: this.likes.length,
        processTime: `${Date.now() - startTime}ms`
      });
    }
    await this.save();
  } catch (error) {
    logger.error('트리 노드 좋아요 처리 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      nodeId: this._id,
      userId
    });
    throw error;
  }
};

// 권한 추가/수정 메서드
treeNodeSchema.methods.updatePermission = async function(userId, accessLevel) {
  const startTime = Date.now();
  try {
    const permissionIndex = this.permissions.findIndex(p => p.user.toString() === userId.toString());
    if (permissionIndex === -1) {
      this.permissions.push({ user: userId, accessLevel });
      logger.info('트리 노드 권한 추가', {
        timestamp: new Date().toISOString(),
        nodeId: this._id,
        userId,
        accessLevel,
        processTime: `${Date.now() - startTime}ms`
      });
    } else {
      this.permissions[permissionIndex].accessLevel = accessLevel;
      logger.info('트리 노드 권한 수정', {
        timestamp: new Date().toISOString(),
        nodeId: this._id,
        userId,
        accessLevel,
        processTime: `${Date.now() - startTime}ms`
      });
    }
    await this.save();
  } catch (error) {
    logger.error('트리 노드 권한 처리 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      nodeId: this._id,
      userId
    });
    throw error;
  }
};

module.exports = mongoose.model('TreeNode', treeNodeSchema); 