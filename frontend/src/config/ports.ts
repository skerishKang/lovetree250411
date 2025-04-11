/**
 * 포트 설정 파일
 * 모든 포트 관련 설정을 중앙화하여 관리합니다.
 */

const ports = {
  // 프론트엔드 포트
  FRONTEND: 3000,
  
  // 백엔드 포트
  BACKEND: 3001,
  
  // URL 설정
  getUrls: () => {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const localhost = isDevelopment ? 'localhost' : process.env.DOMAIN || 'localhost';
    
    return {
      // API URL
      API: '/api',
      
      // 웹소켓 URL
      WS: window.location.origin,
      
      // 프론트엔드 URL
      FRONTEND: `http://${localhost}:${ports.FRONTEND}`
    };
  }
};

export default ports; 