const rateLimit = require('express-rate-limit');
const Redis = require('redis');
const logger = require('./logger');

class RateLimiter {
  constructor() {
    this.redisClient = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.redisClient.on('connect', () => {
      logger.info('Rate Limiter Redis 연결 성공', {
        timestamp: new Date().toISOString(),
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
    });

    this.redisClient.on('error', (error) => {
      logger.error('Rate Limiter Redis 연결 오류', {
        timestamp: new Date().toISOString(),
        error: error.message
      });
    });

    this.redisClient.connect();
  }

  createLimiter(options = {}) {
    const defaultOptions = {
      windowMs: 15 * 60 * 1000, // 15분
      max: 100, // IP당 최대 요청 수
      standardHeaders: true,
      legacyHeaders: false,
      message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
      handler: (req, res) => {
        logger.warn('요청 제한 초과', {
          timestamp: new Date().toISOString(),
          ip: req.ip,
          path: req.path,
          method: req.method
        });
        res.status(429).json({
          error: '요청 제한 초과',
          message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
        });
      },
      skip: (req) => {
        // 관리자 IP는 제한에서 제외
        const adminIps = process.env.ADMIN_IPS ? process.env.ADMIN_IPS.split(',') : [];
        return adminIps.includes(req.ip);
      },
      keyGenerator: (req) => {
        // IP와 사용자 ID를 조합하여 키 생성
        return `${req.ip}:${req.user ? req.user.id : 'anonymous'}`;
      }
    };

    const limiter = rateLimit({
      ...defaultOptions,
      ...options,
      store: new RedisStore({
        client: this.redisClient,
        prefix: 'ratelimit:'
      })
    });

    return limiter;
  }

  // API 엔드포인트별 요청 제한 설정
  getApiLimiters() {
    return {
      // 일반 API 요청 제한
      api: this.createLimiter({
        windowMs: 15 * 60 * 1000, // 15분
        max: 100
      }),

      // 로그인 시도 제한
      auth: this.createLimiter({
        windowMs: 60 * 60 * 1000, // 1시간
        max: 5,
        message: '로그인 시도가 너무 많습니다. 1시간 후에 다시 시도해주세요.'
      }),

      // 파일 업로드 제한
      upload: this.createLimiter({
        windowMs: 60 * 60 * 1000, // 1시간
        max: 10,
        message: '파일 업로드가 너무 많습니다. 1시간 후에 다시 시도해주세요.'
      }),

      // 댓글 작성 제한
      comment: this.createLimiter({
        windowMs: 60 * 60 * 1000, // 1시간
        max: 50,
        message: '댓글 작성이 너무 많습니다. 1시간 후에 다시 시도해주세요.'
      })
    };
  }
}

// Redis 저장소 구현
class RedisStore {
  constructor(options) {
    this.client = options.client;
    this.prefix = options.prefix || 'ratelimit:';
  }

  async increment(key) {
    const startTime = Date.now();
    try {
      const result = await this.client.incr(this.prefix + key);
      
      if (result === 1) {
        await this.client.expire(this.prefix + key, 900); // 15분
      }

      logger.info('Rate Limiter 카운터 증가', {
        timestamp: new Date().toISOString(),
        key,
        count: result,
        processingTime: `${Date.now() - startTime}ms`
      });

      return {
        totalHits: result,
        resetTime: new Date(Date.now() + 900000) // 15분 후
      };
    } catch (error) {
      logger.error('Rate Limiter 카운터 증가 실패', {
        timestamp: new Date().toISOString(),
        key,
        error: error.message,
        processingTime: `${Date.now() - startTime}ms`
      });
      throw error;
    }
  }

  async decrement(key) {
    const startTime = Date.now();
    try {
      await this.client.decr(this.prefix + key);
      
      logger.info('Rate Limiter 카운터 감소', {
        timestamp: new Date().toISOString(),
        key,
        processingTime: `${Date.now() - startTime}ms`
      });
    } catch (error) {
      logger.error('Rate Limiter 카운터 감소 실패', {
        timestamp: new Date().toISOString(),
        key,
        error: error.message,
        processingTime: `${Date.now() - startTime}ms`
      });
      throw error;
    }
  }

  async resetKey(key) {
    const startTime = Date.now();
    try {
      await this.client.del(this.prefix + key);
      
      logger.info('Rate Limiter 카운터 초기화', {
        timestamp: new Date().toISOString(),
        key,
        processingTime: `${Date.now() - startTime}ms`
      });
    } catch (error) {
      logger.error('Rate Limiter 카운터 초기화 실패', {
        timestamp: new Date().toISOString(),
        key,
        error: error.message,
        processingTime: `${Date.now() - startTime}ms`
      });
      throw error;
    }
  }
}

module.exports = new RateLimiter(); 