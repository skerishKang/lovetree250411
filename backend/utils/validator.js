const logger = require('./logger');

class Validator {
  constructor() {
    logger.info('Validator 초기화', {
      timestamp: new Date().toISOString()
    });
  }

  validateEmail(email) {
    const startTime = Date.now();
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(email);
      
      logger.info('이메일 유효성 검사', {
        timestamp: new Date().toISOString(),
        email,
        isValid,
        processingTime: `${Date.now() - startTime}ms`
      });

      return isValid;
    } catch (error) {
      logger.error('이메일 유효성 검사 실패', {
        timestamp: new Date().toISOString(),
        email,
        error: error.message,
        processingTime: `${Date.now() - startTime}ms`
      });
      return false;
    }
  }

  validatePassword(password) {
    const startTime = Date.now();
    try {
      // 최소 8자, 최소 하나의 문자, 하나의 숫자, 하나의 특수문자
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
      const isValid = passwordRegex.test(password);
      
      logger.info('비밀번호 유효성 검사', {
        timestamp: new Date().toISOString(),
        isValid,
        processingTime: `${Date.now() - startTime}ms`
      });

      return isValid;
    } catch (error) {
      logger.error('비밀번호 유효성 검사 실패', {
        timestamp: new Date().toISOString(),
        error: error.message,
        processingTime: `${Date.now() - startTime}ms`
      });
      return false;
    }
  }

  validateUsername(username) {
    const startTime = Date.now();
    try {
      // 3-20자, 영문자, 숫자, 언더스코어만 허용
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      const isValid = usernameRegex.test(username);
      
      logger.info('사용자명 유효성 검사', {
        timestamp: new Date().toISOString(),
        username,
        isValid,
        processingTime: `${Date.now() - startTime}ms`
      });

      return isValid;
    } catch (error) {
      logger.error('사용자명 유효성 검사 실패', {
        timestamp: new Date().toISOString(),
        username,
        error: error.message,
        processingTime: `${Date.now() - startTime}ms`
      });
      return false;
    }
  }

  validatePostContent(content) {
    const startTime = Date.now();
    try {
      const isValid = content && content.length >= 1 && content.length <= 10000;
      
      logger.info('게시물 내용 유효성 검사', {
        timestamp: new Date().toISOString(),
        contentLength: content.length,
        isValid,
        processingTime: `${Date.now() - startTime}ms`
      });

      return isValid;
    } catch (error) {
      logger.error('게시물 내용 유효성 검사 실패', {
        timestamp: new Date().toISOString(),
        error: error.message,
        processingTime: `${Date.now() - startTime}ms`
      });
      return false;
    }
  }

  validateCommentContent(content) {
    const startTime = Date.now();
    try {
      const isValid = content && content.length >= 1 && content.length <= 1000;
      
      logger.info('댓글 내용 유효성 검사', {
        timestamp: new Date().toISOString(),
        contentLength: content.length,
        isValid,
        processingTime: `${Date.now() - startTime}ms`
      });

      return isValid;
    } catch (error) {
      logger.error('댓글 내용 유효성 검사 실패', {
        timestamp: new Date().toISOString(),
        error: error.message,
        processingTime: `${Date.now() - startTime}ms`
      });
      return false;
    }
  }

  validateImageFile(file) {
    const startTime = Date.now();
    try {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      const isValid = file && 
        allowedTypes.includes(file.mimetype) && 
        file.size <= maxSize;
      
      logger.info('이미지 파일 유효성 검사', {
        timestamp: new Date().toISOString(),
        fileType: file.mimetype,
        fileSize: file.size,
        isValid,
        processingTime: `${Date.now() - startTime}ms`
      });

      return isValid;
    } catch (error) {
      logger.error('이미지 파일 유효성 검사 실패', {
        timestamp: new Date().toISOString(),
        error: error.message,
        processingTime: `${Date.now() - startTime}ms`
      });
      return false;
    }
  }
}

module.exports = new Validator(); 