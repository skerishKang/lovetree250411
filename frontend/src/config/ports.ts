/**
 * 포트 설정 파일
 * 모든 포트 관련 설정을 중앙화하여 관리합니다.
 */
import { getApiUrl, getWsUrl } from '@/utils/apiConfig';

const ports = {
  // 프론트엔드 포트
  FRONTEND: 3000,
  
  // 백엔드 포트 (동적으로 변경될 수 있음)
  BACKEND: 8080,
  
  // URL 설정
  getUrls: () => {
    // 환경변수 기반으로만 URL 사용
    const apiUrl = getApiUrl();
    const wsUrl = getWsUrl();
    
    return {
      // API URL (apiConfig에서 가져온 값 사용)
      API: apiUrl,
      
      // 웹소켓 URL (apiConfig에서 가져온 값 사용)
      WS: wsUrl,
      
      // 프론트엔드 URL
      FRONTEND: window.location.origin
    };
  }
};

export default ports; 