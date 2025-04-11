import { configureStore } from '@reduxjs/toolkit';
import notificationSlice from '../../store/slices/notificationSlice';
import { fetchNotifications, markAsRead, deleteNotification } from '../../store/thunks/notificationThunks';

const mockStore = configureStore({
  reducer: {
    notification: notificationSlice
  }
});

describe('Notification API Tests', () => {
  beforeEach(() => {
    mockStore.dispatch({ type: 'RESET' });
  });

  it('should fetch notifications successfully', async () => {
    const mockNotifications = [
      {
        id: '1',
        type: 'LIKE',
        message: '사용자가 당신의 노드를 좋아합니다.',
        read: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        data: {
          nodeId: '1',
          userId: '2'
        }
      },
      {
        id: '2',
        type: 'COMMENT',
        message: '사용자가 당신의 노드에 댓글을 남겼습니다.',
        read: true,
        createdAt: '2024-01-02T00:00:00.000Z',
        data: {
          nodeId: '1',
          commentId: '1',
          userId: '2'
        }
      }
    ];

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockNotifications)
      })
    );

    await mockStore.dispatch(fetchNotifications());
    const state = mockStore.getState().notification;

    expect(state.notifications).toEqual(mockNotifications);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle notification fetch error', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: '서버 오류' })
      })
    );

    await mockStore.dispatch(fetchNotifications());
    const state = mockStore.getState().notification;

    expect(state.notifications).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('서버 오류');
  });

  it('should mark notification as read successfully', async () => {
    const mockNotification = {
      id: '1',
      type: 'LIKE',
      message: '사용자가 당신의 노드를 좋아합니다.',
      read: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      data: {
        nodeId: '1',
        userId: '2'
      }
    };

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockNotification)
      })
    );

    await mockStore.dispatch(markAsRead('1'));
    const state = mockStore.getState().notification;

    expect(state.notifications.find(n => n.id === '1')?.read).toBe(true);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle mark as read error', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: '알림을 찾을 수 없습니다.' })
      })
    );

    await mockStore.dispatch(markAsRead('1'));
    const state = mockStore.getState().notification;

    expect(state.error).toBe('알림을 찾을 수 없습니다.');
    expect(state.loading).toBe(false);
  });

  it('should delete notification successfully', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      })
    );

    await mockStore.dispatch(deleteNotification('1'));
    const state = mockStore.getState().notification;

    expect(state.notifications.find(n => n.id === '1')).toBeUndefined();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle delete notification error', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: '알림을 찾을 수 없습니다.' })
      })
    );

    await mockStore.dispatch(deleteNotification('1'));
    const state = mockStore.getState().notification;

    expect(state.error).toBe('알림을 찾을 수 없습니다.');
    expect(state.loading).toBe(false);
  });

  it('should handle mark all as read successfully', async () => {
    const mockNotifications = [
      {
        id: '1',
        type: 'LIKE',
        message: '사용자가 당신의 노드를 좋아합니다.',
        read: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        data: {
          nodeId: '1',
          userId: '2'
        }
      },
      {
        id: '2',
        type: 'COMMENT',
        message: '사용자가 당신의 노드에 댓글을 남겼습니다.',
        read: true,
        createdAt: '2024-01-02T00:00:00.000Z',
        data: {
          nodeId: '1',
          commentId: '1',
          userId: '2'
        }
      }
    ];

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockNotifications)
      })
    );

    await mockStore.dispatch(markAsRead('all'));
    const state = mockStore.getState().notification;

    expect(state.notifications.every(n => n.read)).toBe(true);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });
}); 