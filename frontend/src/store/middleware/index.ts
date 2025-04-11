import createLogger from './logger';
import createWithLogger from './withLogger';

// 로깅 레벨 타입
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// 컴포넌트 로깅 설정 타입
export interface ComponentLoggingConfig {
  enabled: boolean;
  excludedComponents: string[];
  logProps: boolean;
  logState: boolean;
  logRenderCount: boolean;
  logPerformance: boolean;
}

// 미들웨어 설정 타입 정의
export interface MiddlewareConfig {
  enabled: boolean;
  logLevel: LogLevel;
  excludedActions: string[];
  componentLogging: ComponentLoggingConfig;
  performanceThreshold: number;
}

// 기본 컴포넌트 로깅 설정
const defaultComponentLogging: ComponentLoggingConfig = {
  enabled: true,
  excludedComponents: [],
  logProps: true,
  logState: true,
  logRenderCount: true,
  logPerformance: true,
};

// 기본 미들웨어 설정
export const defaultConfig: MiddlewareConfig = {
  enabled: process.env.NODE_ENV === 'development',
  logLevel: 'info',
  excludedActions: [
    'websocket/updateConnectionStatus',
    'websocket/setConnected',
    'websocket/messageReceived',
  ],
  componentLogging: defaultComponentLogging,
  performanceThreshold: 16, // 16ms (약 60fps)
};

// 미들웨어 타입 정의
export interface LoggerMiddleware {
  logger: ReturnType<typeof createLogger>;
  withLogger: ReturnType<typeof createWithLogger>;
}

// 미들웨어 설정 유효성 검사
const validateConfig = (config: MiddlewareConfig): boolean => {
  if (typeof config.enabled !== 'boolean') return false;
  if (!['debug', 'info', 'warn', 'error'].includes(config.logLevel)) return false;
  if (!Array.isArray(config.excludedActions)) return false;
  if (typeof config.componentLogging?.enabled !== 'boolean') return false;
  if (!Array.isArray(config.componentLogging?.excludedComponents)) return false;
  if (typeof config.performanceThreshold !== 'number') return false;
  return true;
};

// 미들웨어 객체 생성
const createMiddleware = (config: MiddlewareConfig = defaultConfig): LoggerMiddleware => {
  if (!validateConfig(config)) {
    console.warn('잘못된 미들웨어 설정입니다. 기본 설정을 사용합니다.');
    return createMiddleware(defaultConfig);
  }

  if (!config.enabled) {
    return {
      logger: () => (next) => (action) => next(action),
      withLogger: (WrappedComponent, componentName) => WrappedComponent,
    };
  }

  return {
    logger: createLogger(config),
    withLogger: createWithLogger(config),
  };
};

// 미들웨어 객체 내보내기
const middleware = createMiddleware();

export default middleware;
export { createLogger, createWithLogger }; 