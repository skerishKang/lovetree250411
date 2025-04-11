import { configureStore } from '@reduxjs/toolkit';
import profileSlice from '../../store/slices/profileSlice';
import { fetchProfile, updateProfile, changePassword, fetchUserNodes, fetchUserComments } from '../../store/thunks/profileThunks';

const mockStore = configureStore({
  reducer: {
    profile: profileSlice
  }
});

describe('Profile API Tests', () => {
  beforeEach(() => {
    mockStore.dispatch({ type: 'RESET' });
  });

  it('should fetch profile successfully', async () => {
    const mockProfile = {
      id: '1',
      username: '테스트사용자',
      email: 'test@example.com',
      profileImage: 'test-image.jpg',
      bio: '테스트 소개',
      createdAt: '2024-01-01T00:00:00.000Z'
    };

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProfile)
      })
    );

    await mockStore.dispatch(fetchProfile('1'));
    const state = mockStore.getState().profile;

    expect(state.profile).toEqual(mockProfile);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle profile fetch error', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: '사용자를 찾을 수 없습니다.' })
      })
    );

    await mockStore.dispatch(fetchProfile('1'));
    const state = mockStore.getState().profile;

    expect(state.profile).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBe('사용자를 찾을 수 없습니다.');
  });

  it('should update profile successfully', async () => {
    const updatedProfile = {
      username: '수정된사용자',
      bio: '수정된 소개',
      profileImage: 'new-image.jpg'
    };

    const mockResponse = {
      id: '1',
      ...updatedProfile,
      email: 'test@example.com',
      createdAt: '2024-01-01T00:00:00.000Z'
    };

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })
    );

    await mockStore.dispatch(updateProfile(updatedProfile));
    const state = mockStore.getState().profile;

    expect(state.profile).toEqual(mockResponse);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should change password successfully', async () => {
    const passwordData = {
      currentPassword: 'oldPassword123',
      newPassword: 'newPassword123'
    };

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: '비밀번호가 변경되었습니다.' })
      })
    );

    await mockStore.dispatch(changePassword(passwordData));
    const state = mockStore.getState().profile;

    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle incorrect current password', async () => {
    const passwordData = {
      currentPassword: 'wrongPassword',
      newPassword: 'newPassword123'
    };

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: '현재 비밀번호가 일치하지 않습니다.' })
      })
    );

    await mockStore.dispatch(changePassword(passwordData));
    const state = mockStore.getState().profile;

    expect(state.error).toBe('현재 비밀번호가 일치하지 않습니다.');
    expect(state.loading).toBe(false);
  });

  it('should fetch user nodes successfully', async () => {
    const mockNodes = [
      {
        id: '1',
        title: '테스트 노드',
        content: '테스트 내용',
        author: {
          id: '1',
          username: '테스트사용자'
        },
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    ];

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockNodes)
      })
    );

    await mockStore.dispatch(fetchUserNodes('1'));
    const state = mockStore.getState().profile;

    expect(state.userNodes).toEqual(mockNodes);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should fetch user comments successfully', async () => {
    const mockComments = [
      {
        id: '1',
        content: '테스트 댓글',
        nodeId: '1',
        author: {
          id: '1',
          username: '테스트사용자'
        },
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    ];

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockComments)
      })
    );

    await mockStore.dispatch(fetchUserComments('1'));
    const state = mockStore.getState().profile;

    expect(state.userComments).toEqual(mockComments);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle validation errors in profile update', async () => {
    const invalidProfile = {
      username: '', // 빈 사용자 이름
      bio: '테스트 소개'
    };

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: '사용자 이름은 필수입니다.' })
      })
    );

    await mockStore.dispatch(updateProfile(invalidProfile));
    const state = mockStore.getState().profile;

    expect(state.error).toBe('사용자 이름은 필수입니다.');
    expect(state.loading).toBe(false);
  });
}); 