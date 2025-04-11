import { Middleware } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { LogLevel, MiddlewareConfig } from './index';

// 로깅 레벨 정의
const LogLevels = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const;

// 성능 메트릭 타입
interface PerformanceMetrics {
  duration: number;
  timestamp: number;
  actionType: string;
}

// 성능 메트릭 저장소
const performanceMetrics: PerformanceMetrics[] = [];

// 액션 타입에 따른 로깅 레벨 결정
const getLogLevel = (actionType: string, config: MiddlewareConfig): LogLevel => {
  if (actionType.includes('error') || actionType.includes('failure')) {
    return LogLevels.ERROR;
  }
  if (actionType.includes('warning')) {
    return LogLevels.WARN;
  }
  if (actionType.includes('debug')) {
    return LogLevels.DEBUG;
  }
  return config.logLevel;
};

// 성능 메트릭 분석
const analyzePerformance = (metrics: PerformanceMetrics[], threshold: number) => {
  const slowActions = metrics.filter(m => m.duration > threshold);
  if (slowActions.length > 0) {
    console.warn('성능 경고: 다음 액션이 임계값을 초과했습니다:', slowActions);
  }
};

// 로깅 포맷터
const formatLog = (action: any, prevState: RootState, nextState: RootState, duration: number) => {
  return {
    action: {
      type: action.type,
      payload: action.payload,
    },
    state: {
      prev: prevState,
      next: nextState,
    },
    performance: {
      duration: `${duration.toFixed(2)}ms`,
      timestamp: new Date().toISOString(),
    },
  };
};

const createLogger = (config: MiddlewareConfig): Middleware<{}, RootState> => {
  return (store) => (next) => (action) => {
    // 개발 환경에서만 로깅
    if (!config.enabled) {
      return next(action);
    }

    // 제외된 액션은 로깅하지 않음
    if (config.excludedActions.includes(action.type)) {
      return next(action);
    }

    const startTime = performance.now();
    const prevState = store.getState();
    const result = next(action);
    const nextState = store.getState();
    const endTime = performance.now();
    const duration = endTime - startTime;

    // 성능 메트릭 저장
    performanceMetrics.push({
      duration,
      timestamp: Date.now(),
      actionType: action.type,
    });

    // 성능 분석
    if (performanceMetrics.length >= 10) {
      analyzePerformance(performanceMetrics, config.performanceThreshold);
      performanceMetrics.length = 0; // 메트릭 초기화
    }

    const logLevel = getLogLevel(action.type, config);
    const logMethod = console[logLevel] || console.log;
    const formattedLog = formatLog(action, prevState, nextState, duration);

    console.group(`[Redux Action] ${action.type}`);
    logMethod('로그 레벨:', logLevel);
    logMethod('액션 정보:', formattedLog.action);
    logMethod('상태 변경:', formattedLog.state);
    logMethod('성능 정보:', formattedLog.performance);
    console.groupEnd();

    return result;
  };
};

export default createLogger; 