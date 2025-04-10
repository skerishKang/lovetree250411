const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const auth = async (req, res, next) => {
  const startTime = Date.now();
  try {
    logger.info('인증 요청 수신', {
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      ip: req.ip,
      headers: req.headers
    });

    const authHeader = req.header('Authorization');
    if (!authHeader) {
      logger.warn('인증 헤더 없음', {
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method
      });
      return res.status(401).json({ message: 'Authorization 헤더가 없습니다.' });
    }

    const token = authHeader.replace('Bearer ', '');
    logger.info('토큰 검증 시도', {
      timestamp: new Date().toISOString(),
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 10) + '...',
      secret: process.env.JWT_SECRET ? '설정됨' : '미설정'
    });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    logger.info('토큰 검증 성공', {
      timestamp: new Date().toISOString(),
      userId: decoded.id,
      tokenExp: new Date(decoded.exp * 1000).toISOString()
    });

    try {
      const user = await User.findById(decoded.id);
      logger.info('인증 성공', {
        timestamp: new Date().toISOString(),
        userId: user ? user.id : decoded.id,
        username: user ? user.username : '없음',
        authTime: `${Date.now() - startTime}ms`
      });

      if (user) {
        req.user = user;
      } else {
        logger.info('사용자를 찾을 수 없지만 계속 진행합니다.');
        req.user = { id: decoded.id };
      }
    } catch (dbError) {
      logger.error('사용자 조회 중 오류:', {
        timestamp: new Date().toISOString(),
        error: {
          name: dbError.name,
          message: dbError.message,
          stack: dbError.stack
        },
        userId: decoded.id
      });
      req.user = { id: decoded.id };
    }

    req.token = token;
    next();
  } catch (error) {
    logger.error('인증 실패', {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      path: req.path,
      method: req.method,
      authTime: `${Date.now() - startTime}ms`
    });

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '토큰이 만료되었습니다.' });
    }

    res.status(401).json({ message: '인증에 실패했습니다.' });
  }
};

module.exports = auth; 