// jest 전역 객체는 자동으로 제공됨
require('@testing-library/jest-dom');

// localStorage 모의 구현
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: jest.fn(() => 'mock-token'),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  },
  writable: true
});

// ResizeObserver 모의 구현
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}; 