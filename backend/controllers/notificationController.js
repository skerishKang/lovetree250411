const Notification = require('../models/Notification');
const User = require('../models/User');
const Post = require('../models/Post');
const logger = require('../utils/logger');

// @desc    알림 목록 조회
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('알림 목록 조회 시작', {
      timestamp: new Date().toISOString(),
      userId: req.user.id,
      username: req.user.name,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'name profileImage')
      .populate('post')
      .sort({ createdAt: -1 });

    logger.info('알림 목록 조회 성공', {
      timestamp: new Date().toISOString(),
      userId: req.user.id,
      username: req.user.name,
      count: notifications.length,
      unreadCount: notifications.filter(n => !n.read).length,
      notificationTypes: [...new Set(notifications.map(n => n.type))],
      processTime: `${Date.now() - startTime}ms`
    });

    res.json(notifications);
  } catch (error) {
    logger.error('알림 목록 조회 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      userId: req.user.id,
      username: req.user.name,
      processTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ 
      error: '조회 실패',
      message: '알림을 불러오는데 실패했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    알림 읽음 처리
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('알림 읽음 처리 시도', {
      timestamp: new Date().toISOString(),
      notificationId: req.params.id,
      userId: req.user.id,
      username: req.user.name,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      logger.warn('알림을 찾을 수 없음', {
        timestamp: new Date().toISOString(),
        notificationId: req.params.id,
        queryTime: `${Date.now() - startTime}ms`
      });
      return res.status(404).json({ 
        error: '처리 실패',
        message: '알림을 찾을 수 없습니다.'
      });
    }

    if (notification.recipient.toString() !== req.user.id) {
      logger.warn('알림 읽음 처리 권한 없음', {
        timestamp: new Date().toISOString(),
        notificationId: notification._id,
        recipientId: notification.recipient,
        recipientName: notification.recipient.name,
        userId: req.user.id,
        username: req.user.name,
        queryTime: `${Date.now() - startTime}ms`
      });
      return res.status(403).json({ 
        error: '권한 없음',
        message: '권한이 없습니다.'
      });
    }

    const wasRead = notification.read;
    notification.read = true;
    await notification.save();

    logger.info('알림 읽음 처리 성공', {
      timestamp: new Date().toISOString(),
      notificationId: notification._id,
      type: notification.type,
      wasRead,
      processTime: `${Date.now() - startTime}ms`
    });

    res.json(notification);
  } catch (error) {
    logger.error('알림 읽음 처리 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      notificationId: req.params.id,
      userId: req.user.id,
      username: req.user.name,
      processTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ 
      error: '처리 실패',
      message: '알림을 업데이트하는데 실패했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    모든 알림 읽음 처리
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('모든 알림 읽음 처리 시도', {
      timestamp: new Date().toISOString(),
      userId: req.user.id,
      username: req.user.name,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    const previousCount = await Notification.countDocuments({
      recipient: req.user.id,
      read: false
    });

    const result = await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );

    logger.info('모든 알림 읽음 처리 성공', {
      timestamp: new Date().toISOString(),
      userId: req.user.id,
      username: req.user.name,
      previousUnreadCount: previousCount,
      modifiedCount: result.modifiedCount,
      processTime: `${Date.now() - startTime}ms`
    });

    res.json({ message: '모든 알림이 읽음 처리되었습니다.' });
  } catch (error) {
    logger.error('모든 알림 읽음 처리 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      userId: req.user.id,
      username: req.user.name,
      processTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ 
      error: '처리 실패',
      message: '알림을 업데이트하는데 실패했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    알림 삭제
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('알림 삭제 시도', {
      timestamp: new Date().toISOString(),
      notificationId: req.params.id,
      userId: req.user.id,
      username: req.user.name,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      logger.warn('알림을 찾을 수 없음', {
        timestamp: new Date().toISOString(),
        notificationId: req.params.id,
        queryTime: `${Date.now() - startTime}ms`
      });
      return res.status(404).json({ 
        error: '삭제 실패',
        message: '알림을 찾을 수 없습니다.'
      });
    }

    if (notification.recipient.toString() !== req.user.id) {
      logger.warn('알림 삭제 권한 없음', {
        timestamp: new Date().toISOString(),
        notificationId: notification._id,
        recipientId: notification.recipient,
        recipientName: notification.recipient.name,
        userId: req.user.id,
        username: req.user.name,
        queryTime: `${Date.now() - startTime}ms`
      });
      return res.status(403).json({ 
        error: '권한 없음',
        message: '권한이 없습니다.'
      });
    }

    await notification.remove();
    logger.info('알림 삭제 성공', {
      timestamp: new Date().toISOString(),
      notificationId: notification._id,
      type: notification.type,
      processTime: `${Date.now() - startTime}ms`
    });

    res.json({ message: '알림이 삭제되었습니다.' });
  } catch (error) {
    logger.error('알림 삭제 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      notificationId: req.params.id,
      userId: req.user.id,
      username: req.user.name,
      processTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ 
      error: '삭제 실패',
      message: '알림을 삭제하는데 실패했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 알림 생성
exports.createNotification = async (recipientId, senderId, type, postId = null, commentId = null) => {
  const startTime = Date.now();
  try {
    logger.info('알림 생성 시도', {
      timestamp: new Date().toISOString(),
      recipientId,
      senderId,
      type,
      postId,
      commentId
    });

    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type,
      post: postId,
      comment: commentId
    });

    await notification.save();
    logger.info('알림 생성 성공', {
      timestamp: new Date().toISOString(),
      notificationId: notification._id,
      createTime: `${Date.now() - startTime}ms`
    });

    return notification;
  } catch (error) {
    logger.error('알림 생성 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      recipientId,
      senderId,
      type,
      createTime: `${Date.now() - startTime}ms`
    });
    throw error;
  }
};

// 읽지 않은 알림 수 조회
exports.getUnreadCount = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('읽지 않은 알림 수 조회 시작', {
      timestamp: new Date().toISOString(),
      userId: req.user.id,
      username: req.user.name,
      ip: req.ip
    });

    const count = await Notification.countDocuments({
      recipient: req.user.id,
      read: false
    });

    logger.info('읽지 않은 알림 수 조회 성공', {
      timestamp: new Date().toISOString(),
      userId: req.user.id,
      count,
      queryTime: `${Date.now() - startTime}ms`
    });

    res.json({ count });
  } catch (error) {
    logger.error('읽지 않은 알림 수 조회 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      userId: req.user.id,
      queryTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ 
      error: '조회 실패',
      message: '읽지 않은 알림 수를 조회하는데 실패했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 