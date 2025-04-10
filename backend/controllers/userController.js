const User = require('../models/User');
const { createNotification } = require('./notificationController');
const logger = require('../utils/logger');

// 팔로우/언팔로우
exports.toggleFollow = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('팔로우/언팔로우 시도', {
      timestamp: new Date().toISOString(),
      currentUserId: req.user._id,
      currentUsername: req.user.name,
      targetUserId: req.params.userId,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    const { userId } = req.params;
    const currentUser = req.user;

    if (userId === currentUser._id.toString()) {
      logger.warn('자기 자신 팔로우 시도', {
        timestamp: new Date().toISOString(),
        userId,
        username: currentUser.name,
        processTime: `${Date.now() - startTime}ms`
      });
      return res.status(400).json({ 
        error: '잘못된 요청',
        message: '자기 자신을 팔로우할 수 없습니다.'
      });
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      logger.warn('팔로우 대상 사용자를 찾을 수 없음', {
        timestamp: new Date().toISOString(),
        userId,
        queryTime: `${Date.now() - startTime}ms`
      });
      return res.status(404).json({ 
        error: '조회 실패',
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    const isFollowing = currentUser.following.includes(userId);
    const previousFollowingCount = currentUser.following.length;
    const previousFollowersCount = userToFollow.followers.length;

    if (isFollowing) {
      // 언팔로우
      await User.findByIdAndUpdate(currentUser._id, {
        $pull: { following: userId }
      });
      await User.findByIdAndUpdate(userId, {
        $pull: { followers: currentUser._id }
      });
      logger.info('언팔로우 성공', {
        timestamp: new Date().toISOString(),
        currentUserId: currentUser._id,
        currentUsername: currentUser.name,
        targetUserId: userId,
        targetUsername: userToFollow.name,
        previousFollowingCount,
        currentFollowingCount: previousFollowingCount - 1,
        previousFollowersCount,
        currentFollowersCount: previousFollowersCount - 1,
        processTime: `${Date.now() - startTime}ms`
      });
    } else {
      // 팔로우
      await User.findByIdAndUpdate(currentUser._id, {
        $push: { following: userId }
      });
      await User.findByIdAndUpdate(userId, {
        $push: { followers: currentUser._id }
      });
      logger.info('팔로우 성공', {
        timestamp: new Date().toISOString(),
        currentUserId: currentUser._id,
        currentUsername: currentUser.name,
        targetUserId: userId,
        targetUsername: userToFollow.name,
        previousFollowingCount,
        currentFollowingCount: previousFollowingCount + 1,
        previousFollowersCount,
        currentFollowersCount: previousFollowersCount + 1,
        processTime: `${Date.now() - startTime}ms`
      });

      // 팔로우 알림 생성
      await createNotification(
        userId,
        currentUser._id,
        'follow'
      );
      logger.info('팔로우 알림 생성', {
        timestamp: new Date().toISOString(),
        recipient: {
          id: userId,
          username: userToFollow.name
        },
        sender: {
          id: currentUser._id,
          username: currentUser.name
        },
        notificationType: 'follow'
      });
    }

    res.json({ message: isFollowing ? '언팔로우되었습니다.' : '팔로우되었습니다.' });
  } catch (error) {
    logger.error('팔로우/언팔로우 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      currentUserId: req.user._id,
      currentUsername: req.user.name,
      targetUserId: req.params.userId,
      processTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ 
      error: '처리 실패',
      message: '팔로우/언팔로우 처리에 실패했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 팔로워 목록 조회
exports.getFollowers = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('팔로워 목록 조회 시작', {
      timestamp: new Date().toISOString(),
      userId: req.params.userId,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    const { userId } = req.params;
    const user = await User.findById(userId).populate('followers', 'name profileImage');
    
    if (!user) {
      logger.warn('팔로워 목록 조회 실패 - 사용자를 찾을 수 없음', {
        timestamp: new Date().toISOString(),
        userId,
        queryTime: `${Date.now() - startTime}ms`
      });
      return res.status(404).json({ 
        error: '조회 실패',
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    logger.info('팔로워 목록 조회 성공', {
      timestamp: new Date().toISOString(),
      userId,
      username: user.name,
      followerCount: user.followers.length,
      followerIds: user.followers.map(f => f._id),
      queryTime: `${Date.now() - startTime}ms`
    });

    res.json(user.followers);
  } catch (error) {
    logger.error('팔로워 목록 조회 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      userId: req.params.userId,
      queryTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ 
      error: '조회 실패',
      message: '팔로워 목록을 불러오는데 실패했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 팔로잉 목록 조회
exports.getFollowing = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('팔로잉 목록 조회 시작', {
      timestamp: new Date().toISOString(),
      userId: req.params.userId,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    const { userId } = req.params;
    const user = await User.findById(userId).populate('following', 'name profileImage');
    
    if (!user) {
      logger.warn('팔로잉 목록 조회 실패 - 사용자를 찾을 수 없음', {
        timestamp: new Date().toISOString(),
        userId,
        queryTime: `${Date.now() - startTime}ms`
      });
      return res.status(404).json({ 
        error: '조회 실패',
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    logger.info('팔로잉 목록 조회 성공', {
      timestamp: new Date().toISOString(),
      userId,
      username: user.name,
      followingCount: user.following.length,
      followingIds: user.following.map(f => f._id),
      queryTime: `${Date.now() - startTime}ms`
    });

    res.json(user.following);
  } catch (error) {
    logger.error('팔로잉 목록 조회 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      userId: req.params.userId,
      queryTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ 
      error: '조회 실패',
      message: '팔로잉 목록을 불러오는데 실패했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 