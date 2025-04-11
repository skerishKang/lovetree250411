import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import Modal from '..';

describe('Modal', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders with title and content', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Title">
        <div>Test Content</div>
      </Modal>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Title">
        <div>Test Content</div>
      </Modal>
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '닫기' }));
      jest.advanceTimersByTime(300);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking outside modal', async () => {
    const onClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Title">
        <div>Test Content</div>
      </Modal>
    );

    await act(async () => {
      const overlay = screen.getByTestId('modal-overlay');
      fireEvent.click(overlay);
      jest.advanceTimersByTime(300);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    const onConfirm = jest.fn();
    render(
      <Modal isOpen={true} onClose={() => {}} onConfirm={onConfirm} title="Test Title">
        <div>Test Content</div>
      </Modal>
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '확인' }));
      jest.advanceTimersByTime(300);
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Title">
        <div>Test Content</div>
      </Modal>
    );

    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('renders custom buttons', () => {
    const buttons = [
      { text: '커스텀 버튼 1', onClick: () => {} },
      { text: '커스텀 버튼 2', onClick: () => {} }
    ];

    render(
      <Modal
        isOpen={true}
        onClose={() => {}}
        title="Test Title"
        buttons={buttons}
      >
        <div>Test Content</div>
      </Modal>
    );

    expect(screen.getByText('커스텀 버튼 1')).toBeInTheDocument();
    expect(screen.getByText('커스텀 버튼 2')).toBeInTheDocument();
  });
}); 