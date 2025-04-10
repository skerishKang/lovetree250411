const Notification = require('../models/Notification');
const logger = require('./logger');
const { io } = require('../config/socket');

class NotificationService {
  constructor() {
    logger.info('NotificationService 초기화', {
      timestamp: new Date().toISOString()
    });
  }

  // 알림 생성 및 전송
  async createNotification(userId, type, content, relatedId = null) {
    const startTime = Date.now();
    try {
      const notification = new Notification({
        user: userId,
        type,
        content,
        relatedId,
        isRead: false
      });

      await notification.save();

      // 실시간 알림 전송
      io.to(`user:${userId}`).emit('notification', {
        type: 'new',
        notification: {
          _id: notification._id,
          type,
          content,
          relatedId,
          createdAt: notification.createdAt
        }
      });

      logger.info('알림 생성 및 전송 성공', {
        timestamp: new Date().toISOString(),
        userId,
        type,
        content,
        relatedId,
        processingTime: `${Date.now() - startTime}ms`
      });

      return notification;
    } catch (error) {
      logger.error('알림 생성 및 전송 실패', {
        timestamp: new Date().toISOString(),
        userId,
        type,
        content,
        relatedId,
        error: error.message,
        processingTime: `${Date.now() - startTime}ms`
      });
      throw error;
    }
  }

  // 알림 목록 조회
  async getNotifications(userId, page = 1, limit = 10) {
    const startTime = Date.now();
    try {
      const skip = (page - 1) * limit;
      const notifications = await Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Notification.countDocuments({ user: userId });

      logger.info('알림 목록 조회 성공', {
        timestamp: new Date().toISOString(),
        userId,
        page,
        limit,
        total,
        count: notifications.length,
        processingTime: `${Date.now() - startTime}ms`
      });

      return {
        notifications,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('알림 목록 조회 실패', {
        timestamp: new Date().toISOString(),
        userId,
        page,
        limit,
        error: error.message,
        processingTime: `${Date.now() - startTime}ms`
      });
      throw error;
    }
  }

  // 알림 읽음 표시
  async markAsRead(notificationId, userId) {
    const startTime = Date.now();
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        throw new Error('알림을 찾을 수 없습니다.');
      }

      logger.info('알림 읽음 표시 성공', {
        timestamp: new Date().toISOString(),
        notificationId,
        userId,
        processingTime: `${Date.now() - startTime}ms`
      });

      return notification;
    } catch (error) {
      logger.error('알림 읽음 표시 실패', {
        timestamp: new Date().toISOString(),
        notificationId,
        userId,
        error: error.message,
        processingTime: `${Date.now() - startTime}ms`
      });
      throw error;
    }
  }

  // 모든 알림 읽음 표시
  async markAllAsRead(userId) {
    const startTime = Date.now();
    try {
      const result = await Notification.updateMany(
        { user: userId, isRead: false },
        { isRead: true }
      );

      logger.info('모든 알림 읽음 표시 성공', {
        timestamp: new Date().toISOString(),
        userId,
        modifiedCount: result.modifiedCount,
        processingTime: `${Date.now() - startTime}ms`
      });

      return result;
    } catch (error) {
      logger.error('모든 알림 읽음 표시 실패', {
        timestamp: new Date().toISOString(),
        userId,
        error: error.message,
        processingTime: `${Date.now() - startTime}ms`
      });
      throw error;
    }
  }

  // 알림 삭제
  async deleteNotification(notificationId, userId) {
    const startTime = Date.now();
    try {
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        user: userId
      });

      if (!notification) {
        throw new Error('알림을 찾을 수 없습니다.');
      }

      logger.info('알림 삭제 성공', {
        timestamp: new Date().toISOString(),
        notificationId,
        userId,
        processingTime: `${Date.now() - startTime}ms`
      });

      return notification;
    } catch (error) {
      logger.error('알림 삭제 실패', {
        timestamp: new Date().toISOString(),
        notificationId,
        userId,
        error: error.message,
        processingTime: `${Date.now() - startTime}ms`
      });
      throw error;
    }
  }

  // 읽지 않은 알림 수 조회
  async getUnreadCount(userId) {
    const startTime = Date.now();
    try {
      const count = await Notification.countDocuments({
        user: userId,
        isRead: false
      });

      logger.info('읽지 않은 알림 수 조회 성공', {
        timestamp: new Date().toISOString(),
        userId,
        count,
        processingTime: `${Date.now() - startTime}ms`
      });

      return count;
    } catch (error) {
      logger.error('읽지 않은 알림 수 조회 실패', {
        timestamp: new Date().toISOString(),
        userId,
        error: error.message,
        processingTime: `${Date.now() - startTime}ms`
      });
      throw error;
    }
  }
}

module.exports = new NotificationService(); 