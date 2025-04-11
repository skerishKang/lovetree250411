import { configureStore } from '@reduxjs/toolkit';
import statsSlice from '../../store/slices/statsSlice';
import { fetchStats, fetchTrendingTags, fetchUserStats } from '../../store/thunks/statsThunks';

const mockStore = configureStore({
  reducer: {
    stats: statsSlice
  }
});

describe('Stats API Tests', () => {
  beforeEach(() => {
    mockStore.dispatch({ type: 'RESET' });
  });

  it('should fetch overall stats successfully', async () => {
    const mockStats = {
      totalNodes: 100,
      totalUsers: 50,
      totalComments: 200,
      totalLikes: 500,
      averageNodesPerUser: 2,
      averageCommentsPerNode: 2,
      averageLikesPerNode: 5
    };

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStats)
      })
    );

    await mockStore.dispatch(fetchStats());
    const state = mockStore.getState().stats;

    expect(state.overallStats).toEqual(mockStats);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle stats fetch error', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: '서버 오류' })
      })
    );

    await mockStore.dispatch(fetchStats());
    const state = mockStore.getState().stats;

    expect(state.overallStats).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBe('서버 오류');
  });

  it('should fetch trending tags successfully', async () => {
    const mockTrendingTags = [
      {
        tag: '태그1',
        count: 10,
        growth: 5
      },
      {
        tag: '태그2',
        count: 8,
        growth: 3
      }
    ];

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTrendingTags)
      })
    );

    await mockStore.dispatch(fetchTrendingTags());
    const state = mockStore.getState().stats;

    expect(state.trendingTags).toEqual(mockTrendingTags);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle trending tags fetch error', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: '서버 오류' })
      })
    );

    await mockStore.dispatch(fetchTrendingTags());
    const state = mockStore.getState().stats;

    expect(state.trendingTags).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('서버 오류');
  });

  it('should fetch user stats successfully', async () => {
    const mockUserStats = {
      userId: '1',
      totalNodes: 10,
      totalComments: 20,
      totalLikes: 50,
      averageLikesPerNode: 5,
      mostUsedTags: ['태그1', '태그2'],
      activityTrend: {
        nodes: [5, 3, 2],
        comments: [10, 5, 5],
        likes: [20, 15, 15]
      }
    };

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserStats)
      })
    );

    await mockStore.dispatch(fetchUserStats('1'));
    const state = mockStore.getState().stats;

    expect(state.userStats).toEqual(mockUserStats);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle user stats fetch error', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: '사용자를 찾을 수 없습니다.' })
      })
    );

    await mockStore.dispatch(fetchUserStats('1'));
    const state = mockStore.getState().stats;

    expect(state.userStats).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBe('사용자를 찾을 수 없습니다.');
  });

  it('should handle empty trending tags', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    );

    await mockStore.dispatch(fetchTrendingTags());
    const state = mockStore.getState().stats;

    expect(state.trendingTags).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle user stats with no activity', async () => {
    const mockUserStats = {
      userId: '1',
      totalNodes: 0,
      totalComments: 0,
      totalLikes: 0,
      averageLikesPerNode: 0,
      mostUsedTags: [],
      activityTrend: {
        nodes: [0, 0, 0],
        comments: [0, 0, 0],
        likes: [0, 0, 0]
      }
    };

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserStats)
      })
    );

    await mockStore.dispatch(fetchUserStats('1'));
    const state = mockStore.getState().stats;

    expect(state.userStats).toEqual(mockUserStats);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });
}); 