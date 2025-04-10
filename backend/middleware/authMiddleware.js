const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

exports.protect = async (req, res, next) => {
  let token;

  // 디버깅 로그 추가
  logger.info('인증 미들웨어 실행', {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    headers: {
      authorization: req.headers.authorization ? 'Bearer [토큰 숨김]' : '없음'
    }
  });

  // JWT_SECRET 확인 로그 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    logger.info('JWT_SECRET 확인', {
      timestamp: new Date().toISOString(),
      secretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
      secretPrefix: process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 5) + '...' : '없음'
    });
  }

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 토큰 추출
      token = req.headers.authorization.split(' ')[1];
      
      logger.info('토큰 추출 성공', {
        timestamp: new Date().toISOString(),
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 10) + '...'
      });

      // 토큰 검증
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      logger.info('토큰 검증 성공', {
        timestamp: new Date().toISOString(),
        userId: decoded.id,
        decoded: decoded
      });

      // 사용자 정보를 요청 객체에 추가 (비밀번호 제외)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        logger.error('사용자를 찾을 수 없음', {
          timestamp: new Date().toISOString(),
          userId: decoded.id
        });
        return res.status(401).json({ message: '사용자를 찾을 수 없습니다.' });
      }
      
      logger.info('사용자 정보 로드 성공', {
        timestamp: new Date().toISOString(),
        userId: req.user._id,
        username: req.user.name
      });
      
      next();
    } catch (error) {
      logger.error('토큰 검증 실패', {
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      });
      res.status(401).json({ message: '인증에 실패했습니다.' });
    }
  } else {
    logger.warn('인증 헤더 없음', {
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    });
    res.status(401).json({ message: '인증 토큰이 없습니다.' });
  }
};

// 관리자 권한 확인 미들웨어
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: '관리자 권한이 필요합니다.' });
  }
}; 