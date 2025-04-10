const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const startTime = Date.now();
  try {
    logger.error('에러 발생', {
      timestamp: new Date().toISOString(),
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack
      },
      request: {
        path: req.path,
        method: req.method,
        ip: req.ip,
        user: req.user ? {
          id: req.user._id,
          username: req.user.name
        } : null
      }
    });

    // 에러 상태 코드 설정
    let statusCode = err.statusCode || 500;
    let errorMessage = err.message || '서버 오류가 발생했습니다.';

    // 몽고DB 유효성 검사 에러 처리
    if (err.name === 'ValidationError') {
      statusCode = 400;
      errorMessage = Object.values(err.errors)
        .map(error => error.message)
        .join(', ');
    }

    // 몽고DB 중복 키 에러 처리
    if (err.code === 11000) {
      statusCode = 400;
      errorMessage = '이미 존재하는 데이터입니다.';
    }

    // JWT 에러 처리
    if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      errorMessage = '유효하지 않은 토큰입니다.';
    }

    if (err.name === 'TokenExpiredError') {
      statusCode = 401;
      errorMessage = '토큰이 만료되었습니다.';
    }

    // 에러 응답
    res.status(statusCode).json({
      error: {
        name: err.name,
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      }
    });

    logger.info('에러 응답 완료', {
      timestamp: new Date().toISOString(),
      statusCode,
      errorMessage,
      processTime: `${Date.now() - startTime}ms`
    });
  } catch (error) {
    // 에러 처리 중 발생한 에러 로깅
    logger.error('에러 처리 중 추가 에러 발생', {
      timestamp: new Date().toISOString(),
      originalError: {
        name: err.name,
        message: err.message,
        stack: err.stack
      },
      handlingError: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });

    // 기본 에러 응답
    res.status(500).json({
      error: {
        name: 'InternalServerError',
        message: '서버 오류가 발생했습니다.'
      }
    });
  }
};

module.exports = errorHandler; 