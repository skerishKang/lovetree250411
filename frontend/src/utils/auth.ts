const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * 로컬스토리지에서 토큰을 가져옵니다.
 * @returns {string | null} 토큰이 있으면 토큰 문자열, 없으면 null
 */
export const getToken = (): string | null => {
  try {
    if (import.meta.env.MODE === 'development') {
      console.log('🔍 localStorage 전체 내용:', { ...localStorage });
    }
    
    const token = localStorage.getItem(TOKEN_KEY);
    if (import.meta.env.MODE === 'development') {
      console.log('🔑 토큰 조회:', token ? '토큰 있음' : '토큰 없음');
      console.log('🔑 실제 토큰 값:', token);
    }
    return token;
  } catch (error) {
    console.error('❌ 토큰 조회 실패:', error);
    return null;
  }
};

/**
 * 로컬스토리지에 토큰을 저장합니다.
 * @param {string} token 저장할 토큰
 */
export const setToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    if (import.meta.env.MODE === 'development') {
      console.log('💾 토큰 저장 완료');
    }
  } catch (error) {
    console.error('❌ 토큰 저장 실패:', error);
    throw new Error('토큰을 저장할 수 없습니다.');
  }
};

/**
 * 로컬스토리지에서 토큰을 제거합니다.
 */
export const removeToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    if (import.meta.env.MODE === 'development') {
      console.log('🗑️ 토큰 삭제 완료');
    }
  } catch (error) {
    console.error('❌ 토큰 삭제 실패:', error);
  }
};

/**
 * 로컬스토리지에서 리프레시 토큰을 가져옵니다.
 * @returns {string | null} 리프레시 토큰이 있으면 토큰 문자열, 없으면 null
 */
export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('❌ 리프레시 토큰 조회 실패:', error);
    return null;
  }
};

/**
 * 로컬스토리지에 리프레시 토큰을 저장합니다.
 * @param {string} token 저장할 리프레시 토큰
 */
export const setRefreshToken = (token: string): void => {
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error('❌ 리프레시 토큰 저장 실패:', error);
    throw new Error('리프레시 토큰을 저장할 수 없습니다.');
  }
};

/**
 * 로컬스토리지에서 리프레시 토큰을 제거합니다.
 */
export const removeRefreshToken = (): void => {
  try {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('❌ 리프레시 토큰 삭제 실패:', error);
  }
};

/**
 * 모든 인증 관련 데이터를 제거합니다.
 */
export const clearAuthData = (): void => {
  try {
    removeToken();
    removeRefreshToken();
    if (import.meta.env.MODE === 'development') {
      console.log('🧹 인증 데이터 삭제 완료');
    }
  } catch (error) {
    console.error('❌ 인증 데이터 삭제 실패:', error);
  }
}; 