const Redis = require('redis');
const logger = require('./logger');

class Cache {
  constructor() {
    this.client = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.client.on('connect', () => {
      logger.info('Redis 연결 성공', {
        timestamp: new Date().toISOString(),
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
    });

    this.client.on('error', (error) => {
      logger.error('Redis 연결 오류', {
        timestamp: new Date().toISOString(),
        error: error.message
      });
    });

    this.client.connect();
  }

  async set(key, value, ttl = 3600) {
    const startTime = Date.now();
    try {
      const serializedValue = JSON.stringify(value);
      await this.client.set(key, serializedValue, { EX: ttl });
      
      logger.info('캐시 저장 성공', {
        timestamp: new Date().toISOString(),
        key,
        valueLength: serializedValue.length,
        ttl,
        processingTime: `${Date.now() - startTime}ms`
      });

      return true;
    } catch (error) {
      logger.error('캐시 저장 실패', {
        timestamp: new Date().toISOString(),
        key,
        error: error.message,
        processingTime: `${Date.now() - startTime}ms`
      });
      return false;
    }
  }

  async get(key) {
    const startTime = Date.now();
    try {
      const value = await this.client.get(key);
      
      if (value) {
        const parsedValue = JSON.parse(value);
        logger.info('캐시 조회 성공', {
          timestamp: new Date().toISOString(),
          key,
          valueLength: value.length,
          processingTime: `${Date.now() - startTime}ms`
        });
        return parsedValue;
      }

      logger.info('캐시 미존재', {
        timestamp: new Date().toISOString(),
        key,
        processingTime: `${Date.now() - startTime}ms`
      });
      return null;
    } catch (error) {
      logger.error('캐시 조회 실패', {
        timestamp: new Date().toISOString(),
        key,
        error: error.message,
        processingTime: `${Date.now() - startTime}ms`
      });
      return null;
    }
  }

  async del(key) {
    const startTime = Date.now();
    try {
      await this.client.del(key);
      
      logger.info('캐시 삭제 성공', {
        timestamp: new Date().toISOString(),
        key,
        processingTime: `${Date.now() - startTime}ms`
      });

      return true;
    } catch (error) {
      logger.error('캐시 삭제 실패', {
        timestamp: new Date().toISOString(),
        key,
        error: error.message,
        processingTime: `${Date.now() - startTime}ms`
      });
      return false;
    }
  }

  async exists(key) {
    const startTime = Date.now();
    try {
      const exists = await this.client.exists(key);
      
      logger.info('캐시 존재 여부 확인', {
        timestamp: new Date().toISOString(),
        key,
        exists,
        processingTime: `${Date.now() - startTime}ms`
      });

      return exists === 1;
    } catch (error) {
      logger.error('캐시 존재 여부 확인 실패', {
        timestamp: new Date().toISOString(),
        key,
        error: error.message,
        processingTime: `${Date.now() - startTime}ms`
      });
      return false;
    }
  }

  async ttl(key) {
    const startTime = Date.now();
    try {
      const remainingTime = await this.client.ttl(key);
      
      logger.info('캐시 TTL 조회', {
        timestamp: new Date().toISOString(),
        key,
        remainingTime,
        processingTime: `${Date.now() - startTime}ms`
      });

      return remainingTime;
    } catch (error) {
      logger.error('캐시 TTL 조회 실패', {
        timestamp: new Date().toISOString(),
        key,
        error: error.message,
        processingTime: `${Date.now() - startTime}ms`
      });
      return -2; // 키가 존재하지 않는 경우
    }
  }

  async flushAll() {
    const startTime = Date.now();
    try {
      await this.client.flushAll();
      
      logger.info('캐시 전체 삭제 성공', {
        timestamp: new Date().toISOString(),
        processingTime: `${Date.now() - startTime}ms`
      });

      return true;
    } catch (error) {
      logger.error('캐시 전체 삭제 실패', {
        timestamp: new Date().toISOString(),
        error: error.message,
        processingTime: `${Date.now() - startTime}ms`
      });
      return false;
    }
  }
}

module.exports = new Cache(); 