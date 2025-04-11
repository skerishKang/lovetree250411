import React from 'react';
import { render, screen } from '@testing-library/react';
import Loading from '../index';

describe('Loading Component', () => {
  it('should render loading spinner', () => {
    render(<Loading />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  it('should render loading text for screen readers', () => {
    render(<Loading />);
    
    const loadingText = screen.getByText('로딩 중...');
    expect(loadingText).toBeInTheDocument();
    expect(loadingText).toHaveClass('sr-only');
  });

  it('should have proper styling', () => {
    render(<Loading />);
    
    const container = screen.getByTestId('loading-container');
    expect(container).toHaveClass('min-h-[200px]');
    expect(container).toHaveClass('flex');
    expect(container).toHaveClass('items-center');
    expect(container).toHaveClass('justify-center');
  });

  it('should have proper spinner styling', () => {
    render(<Loading />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-12');
    expect(spinner).toHaveClass('h-12');
    expect(spinner).toHaveClass('border-4');
    expect(spinner).toHaveClass('border-gray-200');
    expect(spinner).toHaveClass('border-t-blue-500');
    expect(spinner).toHaveClass('rounded-full');
  });
}); 