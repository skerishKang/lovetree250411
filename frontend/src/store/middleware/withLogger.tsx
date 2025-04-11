import React, { useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../index';
import { LogLevel, MiddlewareConfig } from './index';

// 로깅 레벨 정의
const LogLevels = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const;

// 컴포넌트 프로퍼티에 따른 로깅 레벨 결정
const getLogLevel = (componentName: string, props: any, config: MiddlewareConfig): LogLevel => {
  if (props.error) {
    return LogLevels.ERROR;
  }
  if (props.warning) {
    return LogLevels.WARN;
  }
  if (props.debug) {
    return LogLevels.DEBUG;
  }
  return config.logLevel;
};

// 로깅 포맷터
const formatLog = (componentName: string, props: any, prevProps: any, stateSnapshot: any, renderCount: number) => {
  return {
    component: {
      name: componentName,
      renderCount,
    },
    props: {
      current: props,
      previous: prevProps,
      changed: Object.keys(props).filter(key => props[key] !== prevProps?.[key]),
    },
    state: stateSnapshot,
  };
};

const createWithLogger = (config: MiddlewareConfig) => {
  return <P extends object>(
    WrappedComponent: React.ComponentType<P>,
    componentName: string
  ) => {
    // 제외된 컴포넌트는 로깅하지 않음
    if (config.componentLogging.excludedComponents.includes(componentName)) {
      return WrappedComponent;
    }

    const WithLogger: React.FC<P> = (props) => {
      const prevPropsRef = useRef<P>();
      const renderCountRef = useRef(0);

      const authState = useSelector((state: RootState) => state.auth);
      const treeState = useSelector((state: RootState) => state.tree);
      const uiState = useSelector((state: RootState) => state.ui);
      const postsState = useSelector((state: RootState) => state.posts);
      const commentsState = useSelector((state: RootState) => state.comments);
      const notificationsState = useSelector((state: RootState) => state.notifications);
      const chatState = useSelector((state: RootState) => state.chat);
      const followState = useSelector((state: RootState) => state.follow);
      const websocketState = useSelector((state: RootState) => state.websocket);

      const stateSnapshot = useMemo(() => ({
        auth: authState,
        tree: treeState,
        ui: uiState,
        posts: postsState,
        comments: commentsState,
        notifications: notificationsState,
        chat: chatState,
        follow: followState,
        websocket: websocketState,
      }), [authState, treeState, uiState, postsState, commentsState, notificationsState, chatState, followState, websocketState]);

      useEffect(() => {
        if (config.enabled && config.componentLogging.enabled) {
          renderCountRef.current += 1;
          const logLevel = getLogLevel(componentName, props, config);
          const logMethod = console[logLevel] || console.log;
          const formattedLog = formatLog(componentName, props, prevPropsRef.current, stateSnapshot, renderCountRef.current);

          console.group(`[${componentName}] 렌더링 #${renderCountRef.current}`);
          logMethod('로그 레벨:', logLevel);
          if (config.componentLogging.logProps) {
            logMethod('컴포넌트 정보:', formattedLog.component);
            logMethod('프로퍼티 변경:', formattedLog.props);
          }
          if (config.componentLogging.logState) {
            logMethod('상태 스냅샷:', formattedLog.state);
          }
          console.groupEnd();

          prevPropsRef.current = props;
        }
      }, [componentName, props, stateSnapshot, config]);

      return <WrappedComponent {...props} />;
    };

    WithLogger.displayName = `WithLogger(${componentName})`;

    return WithLogger;
  };
};

export default createWithLogger; 