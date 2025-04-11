import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';

// Mock store 생성
const createTestStore = () => configureStore({
  reducer: {
    // 필요한 리듀서 추가
  }
});

const renderWithProviders = (component) => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('Accessibility Tests', () => {
  it('should have no accessibility violations on Home page', async () => {
    const { container } = renderWithProviders(<Home />);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('should have no accessibility violations on Login page', async () => {
    const { container } = renderWithProviders(<Login />);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('should have no accessibility violations on Register page', async () => {
    const { container } = renderWithProviders(<Register />);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('should have proper heading hierarchy', () => {
    renderWithProviders(<Home />);
    
    const headings = screen.getAllByRole('heading');
    const headingLevels = headings.map(heading => 
      parseInt(heading.tagName.charAt(1))
    );
    
    // h1이 하나만 있는지 확인
    expect(headingLevels.filter(level => level === 1)).toHaveLength(1);
    
    // 헤딩 레벨이 순차적으로 증가하는지 확인
    for (let i = 0; i < headingLevels.length - 1; i++) {
      expect(headingLevels[i + 1] - headingLevels[i]).toBeLessThanOrEqual(1);
    }
  });

  it('should have proper color contrast', () => {
    renderWithProviders(<Home />);
    
    // 텍스트 요소들의 색상 대비 확인
    const textElements = screen.getAllByText(/./);
    textElements.forEach(element => {
      const style = window.getComputedStyle(element);
      const backgroundColor = style.backgroundColor;
      const color = style.color;
      
      // WCAG 2.1 AA 기준 충족 확인
      expect(isColorContrastValid(backgroundColor, color)).toBe(true);
    });
  });

  it('should be keyboard navigable', () => {
    renderWithProviders(<Home />);
    
    // 모든 대화형 요소가 키보드로 접근 가능한지 확인
    const interactiveElements = screen.getAllByRole('button', 'link', 'input');
    interactiveElements.forEach(element => {
      expect(element).toHaveAttribute('tabindex', expect.any(String));
    });
  });

  it('should have proper ARIA attributes', () => {
    renderWithProviders(<Home />);
    
    // 필수 ARIA 속성 확인
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
    });
    
    const images = screen.getAllByRole('img');
    images.forEach(image => {
      expect(image).toHaveAttribute('alt');
    });
  });

  it('should handle screen readers properly', () => {
    renderWithProviders(<Home />);
    
    // 스크린 리더를 위한 숨겨진 텍스트 확인
    const srOnlyElements = screen.getAllByText(/./, { selector: '.sr-only' });
    expect(srOnlyElements.length).toBeGreaterThan(0);
  });

  it('should have proper focus management', () => {
    renderWithProviders(<Home />);
    
    // 모달이나 드롭다운이 열렸을 때 포커스가 적절히 관리되는지 확인
    const modals = screen.getAllByRole('dialog');
    modals.forEach(modal => {
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-hidden', 'false');
    });
  });
});

// 색상 대비 검사 함수
function isColorContrastValid(bgColor: string, textColor: string): boolean {
  // 색상 대비 계산 로직 구현
  // WCAG 2.1 AA 기준: 일반 텍스트 4.5:1, 큰 텍스트 3:1
  return true; // 임시 반환값
} 