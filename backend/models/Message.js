const mongoose = require('mongoose');
const logger = require('../utils/logger');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
});

// 메시지 생성/수정/삭제 시 로깅
messageSchema.post('save', function(doc) {
  logger.info('메시지 저장/수정', {
    timestamp: new Date().toISOString(),
    messageId: doc._id,
    senderId: doc.sender,
    receiverId: doc.receiver,
    contentLength: doc.content.length,
    isRead: doc.read,
    isNew: doc.isNew
  });
});

messageSchema.post('remove', function(doc) {
  logger.info('메시지 삭제', {
    timestamp: new Date().toISOString(),
    messageId: doc._id,
    senderId: doc.sender,
    receiverId: doc.receiver
  });
});

// 메시지 읽음 처리 시 로깅
messageSchema.pre('save', function(next) {
  if (this.isModified('read') && this.read) {
    logger.info('메시지 읽음 처리', {
      timestamp: new Date().toISOString(),
      messageId: this._id,
      senderId: this.sender,
      receiverId: this.receiver,
      readTime: new Date().toISOString()
    });
  }
  next();
});

module.exports = mongoose.model('Message', messageSchema); 