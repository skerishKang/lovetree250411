import { formatDate } from '../date';

describe('formatDate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return "방금 전" for dates less than a minute ago', () => {
    const date = new Date('2024-01-01T11:59:30Z').toISOString();
    expect(formatDate(date)).toBe('방금 전');
  });

  it('should return "X분 전" for dates less than an hour ago', () => {
    const date = new Date('2024-01-01T11:30:00Z').toISOString();
    expect(formatDate(date)).toBe('30분 전');
  });

  it('should return "X시간 전" for dates less than a day ago', () => {
    const date = new Date('2024-01-01T09:00:00Z').toISOString();
    expect(formatDate(date)).toBe('3시간 전');
  });

  it('should return "X일 전" for dates less than a week ago', () => {
    const date = new Date('2023-12-30T12:00:00Z').toISOString();
    expect(formatDate(date)).toBe('2일 전');
  });

  it('should return formatted date for dates more than a week ago', () => {
    const date = new Date('2023-12-20T12:00:00Z').toISOString();
    expect(formatDate(date)).toBe('2023년 12월 20일');
  });

  it('should handle invalid date strings', () => {
    expect(formatDate('invalid-date')).toBe('날짜 정보 없음');
  });
}); 