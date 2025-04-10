const mongoose = require('mongoose');
require('dotenv').config();
const logger = require('../utils/logger');

const connectDB = async () => {
  const startTime = Date.now();
  logger.info('MongoDB 연결 시도', {
    timestamp: new Date().toISOString(),
    uri: process.env.MONGO_URI ? '***' : 'not set'
  });

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info('MongoDB 연결 성공', {
      timestamp: new Date().toISOString(),
      host: conn.connection.host,
      database: conn.connection.name,
      connectionTime: `${Date.now() - startTime}ms`
    });

    // 연결 이벤트 로깅
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB 연결됨', {
        timestamp: new Date().toISOString(),
        host: conn.connection.host,
        database: conn.connection.name
      });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB 연결 해제됨', {
        timestamp: new Date().toISOString(),
        host: conn.connection.host,
        database: conn.connection.name
      });
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB 재연결됨', {
        timestamp: new Date().toISOString(),
        host: conn.connection.host,
        database: conn.connection.name
      });
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB 연결 에러', {
        timestamp: new Date().toISOString(),
        error: {
          message: err.message,
          name: err.name,
          stack: err.stack
        }
      });
    });

    // 프로세스 종료 시 연결 종료
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('MongoDB 연결 종료됨', {
          timestamp: new Date().toISOString(),
          reason: 'SIGINT'
        });
        process.exit(0);
      } catch (err) {
        logger.error('MongoDB 연결 종료 실패', {
          timestamp: new Date().toISOString(),
          error: {
            message: err.message,
            name: err.name,
            stack: err.stack
          }
        });
        process.exit(1);
      }
    });

  } catch (error) {
    logger.error('MongoDB 연결 실패', {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack
      }
    });
    process.exit(1);
  }
};

module.exports = connectDB; 