const mongoose = require('mongoose');
const logger = require('../utils/logger');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'comment', 'follow'],
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 알림 생성/수정/삭제 시 로깅
notificationSchema.post('save', function(doc) {
  logger.info('알림 저장/수정', {
    timestamp: new Date().toISOString(),
    notificationId: doc._id,
    recipientId: doc.recipient,
    senderId: doc.sender,
    type: doc.type,
    postId: doc.post,
    commentId: doc.comment,
    isRead: doc.read,
    isNew: doc.isNew
  });
});

notificationSchema.post('remove', function(doc) {
  logger.info('알림 삭제', {
    timestamp: new Date().toISOString(),
    notificationId: doc._id,
    recipientId: doc.recipient,
    senderId: doc.sender,
    type: doc.type
  });
});

// 알림 읽음 처리 시 로깅
notificationSchema.pre('save', function(next) {
  if (this.isModified('read') && this.read) {
    logger.info('알림 읽음 처리', {
      timestamp: new Date().toISOString(),
      notificationId: this._id,
      recipientId: this.recipient,
      senderId: this.sender,
      type: this.type,
      readTime: new Date().toISOString()
    });
  }
  next();
});

// 알림 생성 시 자동으로 정렬
notificationSchema.pre('save', function(next) {
  this.createdAt = new Date();
  next();
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification; 