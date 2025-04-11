// @ts-nocheck
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../index';

describe('Footer', () => {
  it('should render footer sections', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByText('서비스')).toBeInTheDocument();
    expect(screen.getByText('지원')).toBeInTheDocument();
    expect(screen.getByText('법적 고지')).toBeInTheDocument();
  });

  it('should render service links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByText('탐색하기')).toBeInTheDocument();
    expect(screen.getByText('인기 트리')).toBeInTheDocument();
    expect(screen.getByText('최신 트리')).toBeInTheDocument();
  });

  it('should render support links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByText('도움말')).toBeInTheDocument();
    expect(screen.getByText('자주 묻는 질문')).toBeInTheDocument();
    expect(screen.getByText('문의하기')).toBeInTheDocument();
  });

  it('should render legal links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByText('개인정보처리방침')).toBeInTheDocument();
    expect(screen.getByText('이용약관')).toBeInTheDocument();
  });

  it('should render copyright information', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    // 연도가 동적으로 변경될 수 있으므로 정규식 사용
    expect(screen.getByText(/© \d{4} Love Tree. All rights reserved./)).toBeInTheDocument();
  });

  it('should have proper styling', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('bg-white');
    expect(footer).toHaveClass('border-t');
  });
}); 