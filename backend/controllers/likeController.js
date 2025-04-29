const Like = require('../models/Like');
const mongoose = require('mongoose');

// 좋아요 추가
exports.addLike = async (req, res) => {
  try {
    const { targetType, targetId } = req.body;
    const user = req.user._id;
    const like = await Like.create({ user, targetType, targetId });
    res.status(201).json(like);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: '이미 좋아요를 눌렀습니다.' });
    }
    res.status(500).json({ message: '좋아요 추가 실패', error: err.message });
  }
};

// 좋아요 취소
exports.removeLike = async (req, res) => {
  try {
    const { targetType, targetId } = req.body;
    const user = req.user._id;
    const like = await Like.findOneAndDelete({ user, targetType, targetId });
    if (!like) {
      return res.status(404).json({ message: '좋아요 기록이 없습니다.' });
    }
    res.json({ message: '좋아요 취소 성공' });
  } catch (err) {
    res.status(500).json({ message: '좋아요 취소 실패', error: err.message });
  }
};

// 특정 대상의 좋아요 수 조회
exports.getLikeCount = async (req, res) => {
  try {
    const { targetType, targetId } = req.query;
    const count = await Like.countDocuments({ targetType, targetId });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: '좋아요 수 조회 실패', error: err.message });
  }
};

// 특정 대상의 좋아요 목록 조회
exports.getLikes = async (req, res) => {
  try {
    const { targetType, targetId } = req.query;
    const likes = await Like.find({ targetType, targetId }).populate('user', 'name profileImage');
    res.json(likes);
  } catch (err) {
    res.status(500).json({ message: '좋아요 목록 조회 실패', error: err.message });
  }
}; 