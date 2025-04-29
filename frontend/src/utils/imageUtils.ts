import defaultProfile from '../assets/images/30_man.jpeg';
import defaultTree from '../assets/images/default-tree.svg';
import placeholder from '../assets/images/placeholder.svg';
import logoImage from '../assets/images/lovetree.jpeg';

// 기본 프로필 이미지
export const getProfileImage = (url?: string) => {
  if (!url) return defaultProfile;
  
  // 이미지 로드 실패 시 기본 이미지로 대체
  const handleImageError = (e: Event) => {
    const target = e.target as HTMLImageElement;
    target.src = defaultProfile;
    target.onerror = null; // 무한 루프 방지
  };
  
  // 이미지 요소에 onerror 이벤트를 추가
  setTimeout(() => {
    const imgs = document.querySelectorAll('img[data-type="profile"]');
    imgs.forEach(img => {
      img.onerror = handleImageError;
    });
  }, 0);
  
  return url;
};

// 기본 트리 이미지
export const getTreeImage = (url?: string) => {
  if (!url) return defaultTree;
  
  // 이미지 로드 실패 시 기본 이미지로 대체
  const handleImageError = (e: Event) => {
    const target = e.target as HTMLImageElement;
    target.src = defaultTree;
    target.onerror = null; // 무한 루프 방지
  };
  
  // 이미지 요소에 onerror 이벤트를 추가
  setTimeout(() => {
    const imgs = document.querySelectorAll('img[data-type="tree"]');
    imgs.forEach(img => {
      img.onerror = handleImageError;
    });
  }, 0);
  
  return url;
};

// 로고 이미지
export const getLogoImage = () => {
  return logoImage;
};

// 기본 플레이스홀더 이미지
export const getPlaceholderImage = () => {
  return placeholder;
};

// YouTube 썸네일 이미지 가져오기
export const getYoutubeThumbnail = (videoId: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'medium') => {
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    standard: 'sddefault',
    maxres: 'maxresdefault'
  };
  
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
};

// YouTube 비디오 ID 추출
export const getYoutubeID = (url: string): string | null => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}; 