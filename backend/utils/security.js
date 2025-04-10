const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const logger = require('./logger');

class Security {
  constructor() {
    this.saltRounds = 10;
    logger.info('Security 유틸리티 초기화', {
      timestamp: new Date().toISOString()
    });
  }

  // 비밀번호 해싱
  async hashPassword(password) {
    const startTime = Date.now();
    try {
      const hash = await bcrypt.hash(password, this.saltRounds);
      
      logger.info('비밀번호 해싱 성공', {
        timestamp: new Date().toISOString(),
        processingTime: `${Date.now() - startTime}ms`
      });

      return hash;
    } catch (error) {
      logger.error('비밀번호 해싱 실패', {
        timestamp: new Date().toISOString(),
        error: error.message,
        processingTime: `${Date.now() - startTime}ms`
      });
      throw error;
    }
  }

  // 비밀번호 검증
  async verifyPassword(password, hash) {
    const startTime = Date.now();
    try {
      const isValid = await bcrypt.compare(password, hash);
      
      logger.info('비밀번호 검증', {
        timestamp: new Date().toISOString(),
        isValid,
        processingTime: `${Date.now() - startTime}ms`
      });

      return isValid;
    } catch (error) {
      logger.error('비밀번호 검증 실패', {
        timestamp: new Date().toISOString(),
        error: error.message,
        processingTime: `${Date.now() - startTime}ms`
      });
      return false;
    }
  }

  // Helmet 미들웨어 설정
  getHelmetConfig() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'blob:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      },
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: true,
      crossOriginResourcePolicy: { policy: "same-site" },
      dnsPrefetchControl: { allow: false },
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      ieNoOpen: true,
      noSniff: true,
      originAgentCluster: true,
      permittedCrossDomainPolicies: { permittedPolicies: 'none' },
      referrerPolicy: { policy: 'no-referrer' },
      xssFilter: true
    });
  }

  // XSS 방지
  sanitizeInput(input) {
    const startTime = Date.now();
    try {
      if (typeof input === 'string') {
        const sanitized = input
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
        
        logger.info('입력값 XSS 방지 처리', {
          timestamp: new Date().toISOString(),
          originalLength: input.length,
          sanitizedLength: sanitized.length,
          processingTime: `${Date.now() - startTime}ms`
        });

        return sanitized;
      }
      return input;
    } catch (error) {
      logger.error('입력값 XSS 방지 처리 실패', {
        timestamp: new Date().toISOString(),
        error: error.message,
        processingTime: `${Date.now() - startTime}ms`
      });
      return input;
    }
  }

  // CSRF 토큰 생성
  generateCsrfToken() {
    const startTime = Date.now();
    try {
      const token = require('crypto').randomBytes(32).toString('hex');
      
      logger.info('CSRF 토큰 생성', {
        timestamp: new Date().toISOString(),
        tokenLength: token.length,
        processingTime: `${Date.now() - startTime}ms`
      });

      return token;
    } catch (error) {
      logger.error('CSRF 토큰 생성 실패', {
        timestamp: new Date().toISOString(),
        error: error.message,
        processingTime: `${Date.now() - startTime}ms`
      });
      throw error;
    }
  }

  // 보안 헤더 설정
  setSecurityHeaders(res) {
    const startTime = Date.now();
    try {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      res.setHeader('Content-Security-Policy', "default-src 'self'");
      
      logger.info('보안 헤더 설정', {
        timestamp: new Date().toISOString(),
        processingTime: `${Date.now() - startTime}ms`
      });
    } catch (error) {
      logger.error('보안 헤더 설정 실패', {
        timestamp: new Date().toISOString(),
        error: error.message,
        processingTime: `${Date.now() - startTime}ms`
      });
    }
  }
}

module.exports = new Security(); 