const User = require('../models/User');
const Message = require('../models/Message');
const { getOnlineUsers } = require('../utils/websocket');
const logger = require('../utils/logger');

// 채팅 목록 가져오기
exports.getChatUsers = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('채팅 목록 가져오기 요청', {
      timestamp: new Date().toISOString(),
      currentUserId: req.user._id,
      currentUsername: req.user.name,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    const currentUser = req.user._id;
    
    // 현재 사용자와 대화한 모든 사용자 목록 가져오기
    logger.info('대화 내역 조회 시작', {
      timestamp: new Date().toISOString(),
      currentUserId,
      queryTime: `${Date.now() - startTime}ms`
    });

    const messages = await Message.find({
      $or: [{ sender: currentUser }, { receiver: currentUser }]
    }).sort({ createdAt: -1 });

    // 대화 상대 목록 추출
    const chatPartners = new Set();
    messages.forEach(message => {
      if (message.sender.toString() === currentUser.toString()) {
        chatPartners.add(message.receiver.toString());
      } else {
        chatPartners.add(message.sender.toString());
      }
    });

    logger.info('대화 상대 목록 추출 완료', {
      timestamp: new Date().toISOString(),
      partnerCount: chatPartners.size,
      partners: Array.from(chatPartners),
      processTime: `${Date.now() - startTime}ms`
    });

    // 사용자 정보와 마지막 메시지 가져오기
    const users = await Promise.all(
      Array.from(chatPartners).map(async (partnerId) => {
        logger.info('사용자 정보 조회 시작', {
          timestamp: new Date().toISOString(),
          partnerId,
          queryTime: `${Date.now() - startTime}ms`
        });

        const user = await User.findById(partnerId).select('name profileImage');
        const lastMessage = await Message.findOne({
          $or: [
            { sender: currentUser, receiver: partnerId },
            { sender: partnerId, receiver: currentUser }
          ]
        }).sort({ createdAt: -1 });

        const unreadCount = await Message.countDocuments({
          sender: partnerId,
          receiver: currentUser,
          read: false
        });

        logger.info('사용자 정보 조회 완료', {
          timestamp: new Date().toISOString(),
          userId: user._id,
          username: user.name,
          unreadCount,
          hasLastMessage: !!lastMessage,
          lastMessageTime: lastMessage?.createdAt,
          processTime: `${Date.now() - startTime}ms`
        });

        return {
          _id: user._id,
          username: user.name,
          profileImage: user.profileImage,
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt
          } : null,
          unreadCount,
          isOnline: false
        };
      })
    );

    logger.info('채팅 목록 반환', {
      timestamp: new Date().toISOString(),
      userCount: users.length,
      totalProcessTime: `${Date.now() - startTime}ms`
    });

    res.json(users);
  } catch (error) {
    logger.error('채팅 목록 가져오기 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      currentUserId: req.user._id,
      currentUsername: req.user.name,
      processTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ 
      error: '조회 실패',
      message: '채팅 목록을 불러오는데 실패했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 특정 사용자와의 메시지 가져오기
exports.getChatMessages = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('채팅 메시지 조회 시작', {
      timestamp: new Date().toISOString(),
      currentUserId: req.user._id,
      currentUsername: req.user.name,
      otherUserId: req.params.userId,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    const currentUser = req.user._id;
    const otherUser = req.params.userId;

    // 메시지 가져오기
    const messages = await Message.find({
      $or: [
        { sender: currentUser, receiver: otherUser },
        { sender: otherUser, receiver: currentUser }
      ]
    }).sort({ createdAt: 1 });

    logger.info('채팅 메시지 조회 성공', {
      timestamp: new Date().toISOString(),
      messageCount: messages.length,
      currentUserId,
      currentUsername: req.user.name,
      otherUserId: otherUser,
      queryTime: `${Date.now() - startTime}ms`
    });

    // 읽지 않은 메시지를 읽음으로 표시
    const updateResult = await Message.updateMany(
      { sender: otherUser, receiver: currentUser, read: false },
      { read: true }
    );

    logger.info('읽지 않은 메시지 읽음 처리 완료', {
      timestamp: new Date().toISOString(),
      modifiedCount: updateResult.modifiedCount,
      currentUserId,
      currentUsername: req.user.name,
      otherUserId: otherUser,
      processTime: `${Date.now() - startTime}ms`
    });

    res.json(messages);
  } catch (error) {
    logger.error('채팅 메시지 조회 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      currentUserId: req.user._id,
      currentUsername: req.user.name,
      otherUserId: req.params.userId,
      processTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ 
      error: '조회 실패',
      message: '메시지를 불러오는데 실패했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 새 메시지 생성
exports.createMessage = async (req, res) => {
  const startTime = Date.now();
  try {
    logger.info('새 메시지 생성 시도', {
      timestamp: new Date().toISOString(),
      senderId: req.user._id,
      senderUsername: req.user.name,
      receiverId: req.body.receiver,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      messageLength: req.body.content?.length || 0
    });

    const { receiver, content } = req.body;
    const sender = req.user._id;

    const message = new Message({
      sender,
      receiver,
      content
    });

    await message.save();

    logger.info('새 메시지 생성 성공', {
      timestamp: new Date().toISOString(),
      messageId: message._id,
      senderId: message.sender,
      receiverId: message.receiver,
      contentLength: message.content.length,
      processTime: `${Date.now() - startTime}ms`
    });

    res.status(201).json(message);
  } catch (error) {
    logger.error('새 메시지 생성 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      senderId: req.user._id,
      senderUsername: req.user.name,
      receiverId: req.body.receiver,
      processTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ 
      error: '생성 실패',
      message: '메시지 생성에 실패했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 