const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('./logger');

class WebSocketManager {
  constructor() {
    logger.info('WebSocketManager 초기화', {
      timestamp: new Date().toISOString(),
      instanceId: Math.random().toString(36).substring(7)
    });
    this.clients = new Map();
    this.onlineUsers = new Set();
  }

  initialize(server) {
    logger.info('WebSocket 서버 초기화 시작', {
      timestamp: new Date().toISOString(),
      corsOrigin: 'http://localhost:3000'
    });
    const io = require('socket.io')(server, {
      cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    io.use(async (socket, next) => {
      const startTime = Date.now();
      try {
        const token = socket.handshake.query.token;
        if (!token) {
          logger.warn('인증 토큰 없음', {
            timestamp: new Date().toISOString(),
            socketId: socket.id
          });
          return next(new Error('인증 토큰이 필요합니다.'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
          logger.warn('사용자를 찾을 수 없음', {
            timestamp: new Date().toISOString(),
            userId: decoded.id,
            socketId: socket.id
          });
          return next(new Error('사용자를 찾을 수 없습니다.'));
        }

        socket.user = user;
        logger.info('소켓 인증 성공', {
          timestamp: new Date().toISOString(),
          userId: user._id,
          username: user.username,
          socketId: socket.id,
          authTime: `${Date.now() - startTime}ms`
        });
        next();
      } catch (error) {
        logger.error('소켓 인증 실패', {
          timestamp: new Date().toISOString(),
          error: error.message,
          socketId: socket.id,
          authTime: `${Date.now() - startTime}ms`
        });
        next(new Error('인증에 실패했습니다.'));
      }
    });

    io.on('connection', (socket) => {
      const connectionTime = new Date().toISOString();
      logger.info('새로운 클라이언트 연결됨', {
        timestamp: connectionTime,
        userId: socket.user._id,
        username: socket.user.username,
        socketId: socket.id
      });

      // 클라이언트 저장
      this.clients.set(socket.user.id, socket);
      this.onlineUsers.add(socket.user.id);
      logger.info('클라이언트 등록 완료', {
        timestamp: new Date().toISOString(),
        userId: socket.user.id,
        onlineUsersCount: this.onlineUsers.size,
        totalClients: this.clients.size
      });

      // 온라인 사용자 목록 전송
      this.broadcastOnlineUsers(io);

      // 메시지 수신
      socket.on('message', (data) => {
        const messageTime = new Date().toISOString();
        logger.info('메시지 수신', {
          timestamp: messageTime,
          senderId: socket.user.id,
          receiverId: data.receiver,
          contentLength: data.content.length,
          socketId: socket.id
        });
        const { receiver, content } = data;
        const receiverSocket = this.clients.get(receiver);

        if (receiverSocket) {
          receiverSocket.emit('message', {
            type: 'message',
            message: {
              sender: socket.user,
              receiver,
              content,
              createdAt: new Date(),
            },
          });
          logger.info('메시지 전송 성공', {
            timestamp: new Date().toISOString(),
            senderId: socket.user.id,
            receiverId: receiver,
            deliveryTime: `${Date.now() - new Date(messageTime).getTime()}ms`
          });
        } else {
          logger.warn('메시지 수신자가 오프라인', {
            timestamp: new Date().toISOString(),
            receiverId: receiver,
            senderId: socket.user.id
          });
        }
      });

      // 연결 해제
      socket.on('disconnect', () => {
        const disconnectTime = new Date().toISOString();
        const connectionDuration = new Date(disconnectTime).getTime() - new Date(connectionTime).getTime();
        logger.info('클라이언트 연결 해제', {
          timestamp: disconnectTime,
          userId: socket.user.id,
          username: socket.user.username,
          socketId: socket.id,
          connectionDuration: `${connectionDuration}ms`
        });
        this.clients.delete(socket.user.id);
        this.onlineUsers.delete(socket.user.id);
        logger.info('클라이언트 제거 완료', {
          timestamp: new Date().toISOString(),
          onlineUsersCount: this.onlineUsers.size,
          totalClients: this.clients.size
        });
        this.broadcastOnlineUsers(io);
      });
    });

    logger.info('WebSocket 서버 초기화 완료', {
      timestamp: new Date().toISOString()
    });
    return io;
  }

  addClient(clientId, ws) {
    logger.info('새 클라이언트 연결', {
      timestamp: new Date().toISOString(),
      clientId,
      onlineUsersCount: this.onlineUsers.size + 1,
      totalClients: this.clients.size + 1
    });
    this.clients.set(clientId, ws);
    this.onlineUsers.add(clientId);
  }

  removeClient(clientId) {
    logger.info('클라이언트 연결 해제', {
      timestamp: new Date().toISOString(),
      clientId,
      onlineUsersCount: this.onlineUsers.size - 1,
      totalClients: this.clients.size - 1
    });
    this.clients.delete(clientId);
    this.onlineUsers.delete(clientId);
  }

  getClient(clientId) {
    const client = this.clients.get(clientId);
    logger.info('클라이언트 조회', {
      timestamp: new Date().toISOString(),
      clientId,
      exists: !!client,
      onlineStatus: this.onlineUsers.has(clientId)
    });
    return client;
  }

  broadcast(message) {
    logger.info('브로드캐스트 메시지 전송', {
      timestamp: new Date().toISOString(),
      messageType: message.type,
      recipientCount: this.clients.size,
      onlineUsersCount: this.onlineUsers.size
    });
    this.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(message));
      }
    });
  }

  sendToUser(userId, message) {
    const startTime = Date.now();
    logger.info('특정 사용자에게 메시지 전송', {
      timestamp: new Date().toISOString(),
      userId,
      messageType: message.type
    });
    const client = this.getClient(userId);
    if (client && client.readyState === 1) {
      client.send(JSON.stringify(message));
      logger.info('메시지 전송 성공', {
        timestamp: new Date().toISOString(),
        userId,
        deliveryTime: `${Date.now() - startTime}ms`
      });
    } else {
      logger.warn('메시지 전송 실패 - 사용자가 오프라인', {
        timestamp: new Date().toISOString(),
        userId,
        clientExists: !!client,
        clientReadyState: client?.readyState
      });
    }
  }

  broadcastOnlineUsers(io) {
    const onlineUsersList = Array.from(this.onlineUsers);
    logger.info('온라인 사용자 목록 브로드캐스트', {
      timestamp: new Date().toISOString(),
      onlineUsersCount: onlineUsersList.length,
      totalClients: this.clients.size
    });
    io.emit('onlineUsers', {
      type: 'onlineUsers',
      users: onlineUsersList,
    });
  }

  getOnlineUsers() {
    const onlineUsersList = Array.from(this.onlineUsers);
    logger.info('온라인 사용자 목록 조회', {
      timestamp: new Date().toISOString(),
      onlineUsersCount: onlineUsersList.length,
      totalClients: this.clients.size
    });
    return onlineUsersList;
  }

  isUserOnline(userId) {
    const isOnline = this.onlineUsers.has(userId);
    logger.info('사용자 온라인 상태 확인', {
      timestamp: new Date().toISOString(),
      userId,
      isOnline,
      totalClients: this.clients.size
    });
    return isOnline;
  }
}

module.exports = new WebSocketManager(); 