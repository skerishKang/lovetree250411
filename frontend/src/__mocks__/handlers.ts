import { rest } from 'msw';

export const handlers = [
  // 로그인 API
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ 
        token: 'mock-token',
        user: { id: 1, name: 'Test User', email: 'test@example.com' }
      })
    );
  }),

  // 회원가입 API
  rest.post('/api/auth/register', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ message: 'User registered successfully' })
    );
  }),

  // 트리 노드 목록 조회 API
  rest.get('/trees', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, title: '첫 번째 노드', content: '내용', tags: ['태그1', '태그2'], likes: 5 },
        { id: 2, title: '두 번째 노드', content: '내용', tags: ['태그3'], likes: 10 }
      ])
    );
  }),

  // 트리 노드 좋아요 API
  rest.post('/api/tree/nodes/:nodeId/like', (req, res, ctx) => {
    const { nodeId } = req.params;
    const { isLiked } = req.body as { isLiked: boolean };

    return res(
      ctx.status(200),
      ctx.json({
        id: nodeId,
        likes: isLiked ? 6 : 4
      })
    );
  }),

  // 트리 노드 댓글 추가 API
  rest.post('/api/tree/nodes/:nodeId/comments', (req, res, ctx) => {
    const { nodeId } = req.params;
    const { content } = req.body as { content: string };

    return res(
      ctx.status(201),
      ctx.json({
        id: 'comment1',
        content,
        author: {
          id: 'user1',
          name: '사용자1',
          profileImage: 'https://example.com/profile1.jpg'
        },
        createdAt: new Date().toISOString()
      })
    );
  }),

  // 트리 노드 댓글 목록 조회 API
  rest.get('/api/comments/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        comments: [
          { id: 1, content: '좋은 글이네요!', author: '사용자1', createdAt: '2023-05-01', likes: 3 },
          { id: 2, content: '감사합니다', author: '사용자2', createdAt: '2023-05-02', likes: 1 }
        ]
      })
    );
  })
]; 