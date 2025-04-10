const mongoose = require('mongoose');
const logger = require('../utils/logger');

const followshipSchema = new mongoose.Schema({
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  following: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 팔로우 관계 생성/삭제 시 로깅
followshipSchema.post('save', function(doc) {
  logger.info('팔로우 관계 생성', {
    timestamp: new Date().toISOString(),
    followshipId: doc._id,
    followerId: doc.follower,
    followingId: doc.following,
    isNew: doc.isNew
  });
});

followshipSchema.post('remove', function(doc) {
  logger.info('팔로우 관계 삭제', {
    timestamp: new Date().toISOString(),
    followshipId: doc._id,
    followerId: doc.follower,
    followingId: doc.following
  });
});

// 팔로우 관계 중복 방지
followshipSchema.index({ follower: 1, following: 1 }, { unique: true });

module.exports = mongoose.model('Followship', followshipSchema); 