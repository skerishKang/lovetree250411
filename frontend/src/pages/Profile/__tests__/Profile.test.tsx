import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import Profile from '../index';
import authSlice from '../../../store/slices/authSlice';
import treeSlice from '../../../store/slices/treeSlice';

const mockUser = {
  id: '1',
  username: '테스트 사용자',
  email: 'test@example.com',
  profileImage: 'test-image.jpg',
  bio: '테스트 자기소개'
};

const mockNodes = [
  {
    id: '1',
    title: '테스트 노드 1',
    content: '테스트 내용 1',
    author: mockUser,
    tags: ['태그1'],
    likes: 5,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    title: '테스트 노드 2',
    content: '테스트 내용 2',
    author: mockUser,
    tags: ['태그2'],
    likes: 3,
    createdAt: '2024-01-02T00:00:00.000Z'
  }
];

const mockStore = configureStore({
  reducer: {
    auth: authSlice,
    tree: treeSlice
  },
  preloadedState: {
    auth: {
      user: mockUser,
      token: 'test-token',
      loading: false,
      error: null
    },
    tree: {
      nodes: mockNodes,
      selectedNode: null,
      loading: false,
      error: null
    }
  }
});

describe('Profile Page', () => {
  it('should render user profile information', () => {
    render(
      <Provider store={mockStore}>
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('테스트 사용자')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('테스트 자기소개')).toBeInTheDocument();
    expect(screen.getByAltText('프로필 이미지')).toHaveAttribute('src', 'test-image.jpg');
  });

  it('should display user nodes', () => {
    render(
      <Provider store={mockStore}>
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('테스트 노드 1')).toBeInTheDocument();
    expect(screen.getByText('테스트 노드 2')).toBeInTheDocument();
  });

  it('should handle profile image update', async () => {
    render(
      <Provider store={mockStore}>
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      </Provider>
    );

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText('프로필 이미지 변경');
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByAltText('프로필 이미지')).toHaveAttribute('src', expect.stringContaining('test.jpg'));
    });
  });

  it('should handle profile information update', async () => {
    render(
      <Provider store={mockStore}>
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      </Provider>
    );

    const editButton = screen.getByText('프로필 수정');
    fireEvent.click(editButton);

    const usernameInput = screen.getByLabelText('이름');
    const bioInput = screen.getByLabelText('자기소개');

    fireEvent.change(usernameInput, { target: { value: '수정된 이름' } });
    fireEvent.change(bioInput, { target: { value: '수정된 자기소개' } });

    const saveButton = screen.getByText('저장');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('수정된 이름')).toBeInTheDocument();
      expect(screen.getByText('수정된 자기소개')).toBeInTheDocument();
    });
  });

  it('should handle password change', async () => {
    render(
      <Provider store={mockStore}>
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      </Provider>
    );

    const changePasswordButton = screen.getByText('비밀번호 변경');
    fireEvent.click(changePasswordButton);

    const currentPasswordInput = screen.getByLabelText('현재 비밀번호');
    const newPasswordInput = screen.getByLabelText('새 비밀번호');
    const confirmPasswordInput = screen.getByLabelText('새 비밀번호 확인');

    fireEvent.change(currentPasswordInput, { target: { value: 'current123' } });
    fireEvent.change(newPasswordInput, { target: { value: 'new123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'new123' } });

    const submitButton = screen.getByText('변경하기');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('비밀번호가 변경되었습니다.')).toBeInTheDocument();
    });
  });

  it('should handle account deletion', async () => {
    render(
      <Provider store={mockStore}>
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      </Provider>
    );

    const deleteButton = screen.getByText('계정 삭제');
    fireEvent.click(deleteButton);

    const passwordInput = screen.getByLabelText('비밀번호');
    fireEvent.change(passwordInput, { target: { value: 'current123' } });

    const confirmButton = screen.getByText('삭제');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
  });

  it('should display loading state', () => {
    const loadingStore = configureStore({
      reducer: {
        auth: authSlice,
        tree: treeSlice
      },
      preloadedState: {
        auth: {
          user: null,
          token: null,
          loading: true,
          error: null
        },
        tree: {
          nodes: [],
          selectedNode: null,
          loading: true,
          error: null
        }
      }
    });

    render(
      <Provider store={loadingStore}>
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('should display error state', () => {
    const errorStore = configureStore({
      reducer: {
        auth: authSlice,
        tree: treeSlice
      },
      preloadedState: {
        auth: {
          user: null,
          token: null,
          loading: false,
          error: '인증 오류'
        },
        tree: {
          nodes: [],
          selectedNode: null,
          loading: false,
          error: '데이터 로딩 오류'
        }
      }
    });

    render(
      <Provider store={errorStore}>
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('인증 오류')).toBeInTheDocument();
    expect(screen.getByText('데이터 로딩 오류')).toBeInTheDocument();
  });
}); 