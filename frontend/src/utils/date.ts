export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  // 유효하지 않은 날짜 처리
  if (isNaN(date.getTime())) {
    return '날짜 정보 없음';
  }
  
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return '방금 전';
  }
  if (minutes < 60) {
    return `${minutes}분 전`;
  }
  if (hours < 24) {
    return `${hours}시간 전`;
  }
  if (days < 7) {
    return `${days}일 전`;
  }

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}; 