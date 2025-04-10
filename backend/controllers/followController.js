const User = require('../models/User');
const { createNotification } = require('./notificationController');
const logger = require('../utils/logger');

// 팔로우
exports.followUser = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('팔로우 시작', {
      timestamp: new Date().toISOString(),
      currentUserId: req.user.id,
      targetUserId: req.params.userId,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    const userToFollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      logger.warn('팔로우 실패 - 대상 사용자 없음', {
        timestamp: new Date().toISOString(),
        currentUserId: req.user.id,
        targetUserId: req.params.userId,
        queryTime: `${Date.now() - startTime}ms`
      });
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 자기 자신을 팔로우할 수 없음
    if (userToFollow._id.toString() === currentUser._id.toString()) {
      logger.warn('팔로우 실패 - 자기 자신 팔로우 시도', {
        timestamp: new Date().toISOString(),
        userId: req.user.id,
        queryTime: `${Date.now() - startTime}ms`
      });
      return res.status(400).json({ message: '자기 자신을 팔로우할 수 없습니다.' });
    }

    // 이미 팔로우 중인지 확인
    if (currentUser.following.includes(userToFollow._id)) {
      logger.warn('팔로우 실패 - 이미 팔로우 중', {
        timestamp: new Date().toISOString(),
        currentUserId: req.user.id,
        targetUserId: req.params.userId,
        queryTime: `${Date.now() - startTime}ms`
      });
      return res.status(400).json({ message: '이미 팔로우 중입니다.' });
    }

    // 팔로우 추가
    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);

    await currentUser.save();
    await userToFollow.save();

    // 알림 생성
    await createNotification(
      userToFollow._id,
      currentUser._id,
      'follow'
    );

    logger.info('팔로우 성공', {
      timestamp: new Date().toISOString(),
      currentUserId: req.user.id,
      targetUserId: req.params.userId,
      processTime: `${Date.now() - startTime}ms`
    });

    res.json({ message: '팔로우가 완료되었습니다.' });
  } catch (error) {
    logger.error('팔로우 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      currentUserId: req.user.id,
      targetUserId: req.params.userId,
      processTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ 
      message: '팔로우 처리 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// 언팔로우
exports.unfollowUser = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('언팔로우 시작', {
      timestamp: new Date().toISOString(),
      currentUserId: req.user.id,
      targetUserId: req.params.userId,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    const userToUnfollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow) {
      logger.warn('언팔로우 실패 - 대상 사용자 없음', {
        timestamp: new Date().toISOString(),
        currentUserId: req.user.id,
        targetUserId: req.params.userId,
        queryTime: `${Date.now() - startTime}ms`
      });
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 팔로우 중이 아닌 경우
    if (!currentUser.following.includes(userToUnfollow._id)) {
      logger.warn('언팔로우 실패 - 팔로우 중이 아님', {
        timestamp: new Date().toISOString(),
        currentUserId: req.user.id,
        targetUserId: req.params.userId,
        queryTime: `${Date.now() - startTime}ms`
      });
      return res.status(400).json({ message: '팔로우 중이 아닙니다.' });
    }

    // 팔로우 제거
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userToUnfollow._id.toString()
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== currentUser._id.toString()
    );

    await currentUser.save();
    await userToUnfollow.save();

    logger.info('언팔로우 성공', {
      timestamp: new Date().toISOString(),
      currentUserId: req.user.id,
      targetUserId: req.params.userId,
      processTime: `${Date.now() - startTime}ms`
    });

    res.json({ message: '언팔로우가 완료되었습니다.' });
  } catch (error) {
    logger.error('언팔로우 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      currentUserId: req.user.id,
      targetUserId: req.params.userId,
      processTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ 
      message: '언팔로우 처리 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
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

    const user = await User.findById(req.params.userId)
      .populate('followers', 'username profileImage bio');

    if (!user) {
      logger.warn('팔로워 목록 조회 실패 - 사용자 없음', {
        timestamp: new Date().toISOString(),
        userId: req.params.userId,
        queryTime: `${Date.now() - startTime}ms`
      });
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    logger.info('팔로워 목록 조회 성공', {
      timestamp: new Date().toISOString(),
      userId: req.params.userId,
      followerCount: user.followers.length,
      processTime: `${Date.now() - startTime}ms`
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
      processTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ 
      message: '팔로워 목록을 불러오는데 실패했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
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

    const user = await User.findById(req.params.userId)
      .populate('following', 'username profileImage bio');

    if (!user) {
      logger.warn('팔로잉 목록 조회 실패 - 사용자 없음', {
        timestamp: new Date().toISOString(),
        userId: req.params.userId,
        queryTime: `${Date.now() - startTime}ms`
      });
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    logger.info('팔로잉 목록 조회 성공', {
      timestamp: new Date().toISOString(),
      userId: req.params.userId,
      followingCount: user.following.length,
      processTime: `${Date.now() - startTime}ms`
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
      processTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ 
      message: '팔로잉 목록을 불러오는데 실패했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}; 