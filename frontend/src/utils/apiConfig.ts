import axios from 'axios';

interface ApiConfig {
  apiUrl: string;
  wsUrl: string;
  version?: string;
  env?: string;
}

// 기본 API 설정값
let apiConfig: ApiConfig = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8080',
};

// 설정이 초기화되었는지 확인하는 플래그
let isConfigInitialized = false;

// API 설정을 로컬 스토리지에 저장
const saveApiConfig = (config: ApiConfig) => {
  localStorage.setItem('api_config', JSON.stringify(config));
  console.log('💾 API 설정 저장됨:', config);
};

// API 설정을 로컬 스토리지에서 로드
const loadApiConfig = (): ApiConfig | null => {
  const saved = localStorage.getItem('api_config');
  if (saved) {
    try {
      const parsedConfig = JSON.parse(saved);
      console.log('📂 로컬 스토리지에서 API 설정 로드됨:', parsedConfig);
      return parsedConfig;
    } catch (e) {
      console.error('❌ 저장된 API 설정 파싱 오류:', e);
      return null;
    }
  }
  return null;
};

// API 설정 초기화 (애플리케이션 시작 시 호출)
export const initApiConfig = async (): Promise<ApiConfig> => {
  // 이미 초기화되었으면 현재 설정 반환
  if (isConfigInitialized) {
    return apiConfig;
  }

  try {
    // 먼저 로컬 스토리지에서 설정 로드
    const savedConfig = loadApiConfig();
    if (savedConfig) {
      apiConfig = savedConfig;
      console.log('🔄 저장된 API 설정 로드됨:', apiConfig);
    }

    // 백엔드 서버에서 최신 설정 가져오기
    console.log('🔍 백엔드 서버에서 API 설정 가져오는 중...');
    
    // 여러 기본 URL을 시도
    const urlsToTry = [
      apiConfig.apiUrl,
      'http://localhost:8080'
    ];
    
    let configLoaded = false;
    
    for (const url of urlsToTry) {
      if (configLoaded) break;
      
      try {
        console.log(`🔍 API 설정 요청 시도: ${url}/api/config`);
        const response = await axios.get<ApiConfig>(`${url}/api/config`, {
          timeout: 3000,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data?.apiUrl) {
          apiConfig = response.data;
          console.log('✅ 새 API 설정 로드됨:', apiConfig);
          
          // 로컬 스토리지에 저장
          saveApiConfig(apiConfig);
          configLoaded = true;
          isConfigInitialized = true;
        }
      } catch (error) {
        console.warn(`⚠️ ${url}에서 API 설정 가져오기 실패:`, error);
      }
    }
    
    if (!configLoaded) {
      console.warn('⚠️ 모든 URL 시도 실패, 기본 API 설정을 사용합니다:', apiConfig);
      // 기본 설정이라도 초기화는 완료된 것으로 표시
      isConfigInitialized = true;
    }
  } catch (error) {
    console.error('❌ API 설정 초기화 중 오류 발생:', error);
    isConfigInitialized = true; // 에러가 발생해도 초기화 시도는 완료됨
  }
  
  return apiConfig;
};

// 현재 API URL 가져오기 (초기화 확인)
export const getApiUrl = (): string => {
  if (!isConfigInitialized) {
    console.warn('⚠️ API 설정이 초기화되지 않았습니다. 기본값 사용.');
  }
  return apiConfig.apiUrl;
};

// 현재 WebSocket URL 가져오기 (초기화 확인)
export const getWsUrl = (): string => {
  if (!isConfigInitialized) {
    console.warn('⚠️ API 설정이 초기화되지 않았습니다. 기본값 사용.');
  }
  return apiConfig.wsUrl;
};

// 설정 값 직접 업데이트 (테스트용)
export const updateApiConfig = (newConfig: Partial<ApiConfig>) => {
  apiConfig = { ...apiConfig, ...newConfig };
  saveApiConfig(apiConfig);
  isConfigInitialized = true;
  console.log('🔄 API 설정 수동 업데이트:', apiConfig);
  return apiConfig;
};

export default {
  initApiConfig,
  getApiUrl,
  getWsUrl,
  updateApiConfig
}; 