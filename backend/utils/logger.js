const winston = require('winston');
const path = require('path');
const fs = require('fs');

// 로그 디렉토리 생성
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 로그 포맷 설정
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 로그 필터 설정
const filterByLevel = (level) => winston.format((info) => {
  if (info.level === level) return info;
  return false;
})();

// 로거 생성
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'lovetree-api',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // 에러 로그 파일
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: process.env.LOG_MAX_SIZE || '10m',
      maxFiles: process.env.LOG_MAX_FILES || 5,
      format: filterByLevel('error'),
      tailable: true,
      zippedArchive: true
    }),
    // 경고 로그 파일
    new winston.transports.File({
      filename: path.join(logDir, 'warn.log'),
      level: 'warn',
      maxsize: process.env.LOG_MAX_SIZE || '10m',
      maxFiles: process.env.LOG_MAX_FILES || 5,
      format: filterByLevel('warn'),
      tailable: true,
      zippedArchive: true
    }),
    // 정보 로그 파일
    new winston.transports.File({
      filename: path.join(logDir, 'info.log'),
      level: 'info',
      maxsize: process.env.LOG_MAX_SIZE || '10m',
      maxFiles: process.env.LOG_MAX_FILES || 5,
      format: filterByLevel('info'),
      tailable: true,
      zippedArchive: true
    }),
    // 디버그 로그 파일
    new winston.transports.File({
      filename: path.join(logDir, 'debug.log'),
      level: 'debug',
      maxsize: process.env.LOG_MAX_SIZE || '10m',
      maxFiles: process.env.LOG_MAX_FILES || 5,
      format: filterByLevel('debug'),
      tailable: true,
      zippedArchive: true
    }),
    // 통합 로그 파일
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: process.env.LOG_MAX_SIZE || '10m',
      maxFiles: process.env.LOG_MAX_FILES || 5,
      tailable: true,
      zippedArchive: true
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
      maxsize: process.env.LOG_MAX_SIZE || '10m',
      maxFiles: process.env.LOG_MAX_FILES || 5,
      tailable: true,
      zippedArchive: true
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
      maxsize: process.env.LOG_MAX_SIZE || '10m',
      maxFiles: process.env.LOG_MAX_FILES || 5,
      tailable: true,
      zippedArchive: true
    })
  ]
});

// 개발 환경에서는 콘솔에도 출력
if (process.env.NODE_ENV !== 'production') {
  const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss.SSS'
    }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
    })
  );

  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: process.env.LOG_LEVEL || 'debug'
  }));
}

// 로그 순환 설정
const logRotate = () => {
  const files = fs.readdirSync(logDir);
  files.forEach(file => {
    if (file.endsWith('.log')) {
      const filePath = path.join(logDir, file);
      const stats = fs.statSync(filePath);
      const fileSize = stats.size / (1024 * 1024); // MB 단위

      if (fileSize > (process.env.LOG_MAX_SIZE || 10)) {
        const newFileName = `${file}.${new Date().toISOString().replace(/[:.]/g, '-')}`;
        fs.renameSync(filePath, path.join(logDir, newFileName));
      }
    }
  });
};

// 매일 자정에 로그 순환 실행
setInterval(logRotate, 24 * 60 * 60 * 1000);

module.exports = logger; 