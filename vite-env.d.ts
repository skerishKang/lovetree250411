/// <reference types="vite/client" />

// 추가 환경 변수 타입을 정의할 수 있습니다.
declare interface ImportMetaEnv {
    readonly MODE: string; // 예: 'development' 또는 'production'
    readonly VITE_API_URL: string; // 예: API 기본 URL 등 필요한 환경 변수를 여기에 추가하세요.
    // 필요한 추가 환경 변수들을 여기에 선언합니다.
  }
  
  declare interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  