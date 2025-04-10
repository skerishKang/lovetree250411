/**
 * 포트 설정 파일
 * 모든 포트 관련 설정을 중앙화하여 관리합니다.
 */

const ports = {
  // 서버 포트
  SERVER: process.env.PORT || 3001,
  
  // 프론트엔드 포트
  FRONTEND: process.env.FRONTEND_PORT || 3000,
  
  // URL 설정
  getUrls: () => {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const localhost = isDevelopment ? 'localhost' : process.env.DOMAIN || 'localhost';
    
    return {
      // API URL
      API: process.env.API_URL || `http://${localhost}:${ports.SERVER}`,
      
      // 웹소켓 URL
      WS: process.env.WS_URL || `ws://${localhost}:${ports.SERVER}`,
      
      // 프론트엔드 URL
      FRONTEND: process.env.FRONTEND_URL || `http://${localhost}:${ports.FRONTEND}`,
      
      // CORS 허용 URL
      CORS_ORIGINS: [
        `http://${localhost}:${ports.FRONTEND}`,
        `http://127.0.0.1:${ports.FRONTEND}`
      ]
    };
  }
};

module.exports = ports; 