import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from '../index';

describe('NotFound Page', () => {
  it('should render 404 message', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('페이지를 찾을 수 없습니다')).toBeInTheDocument();
  });

  it('should render home link', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    const homeLink = screen.getByRole('link', { name: /홈으로 돌아가기/ });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should have proper styling', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    const container = screen.getByTestId('not-found-container');
    expect(container).toHaveClass('min-h-screen');
    expect(container).toHaveClass('flex');
    expect(container).toHaveClass('flex-col');
    expect(container).toHaveClass('items-center');
    expect(container).toHaveClass('justify-center');
  });

  it('should have proper heading hierarchy', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    const headings = screen.getAllByRole('heading');
    expect(headings).toHaveLength(2);
    expect(headings[0]).toHaveTextContent('404');
    expect(headings[1]).toHaveTextContent('페이지를 찾을 수 없습니다');
  });

  it('should have proper button styling', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    const homeButton = screen.getByRole('link', { name: /홈으로 돌아가기/ });
    expect(homeButton).toHaveClass('mt-4');
    expect(homeButton).toHaveClass('px-4');
    expect(homeButton).toHaveClass('py-2');
    expect(homeButton).toHaveClass('bg-blue-500');
    expect(homeButton).toHaveClass('text-white');
    expect(homeButton).toHaveClass('rounded');
  });
}); 