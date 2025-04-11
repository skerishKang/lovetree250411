import api from '@/lib/axios';
import { TreeNode, TreeResponse } from '@/types/tree';

interface FetchNodesParams {
  page?: number;
  limit?: number;
  search?: string;
  tag?: string;
}

export const treeService = {
  // 노드 목록 조회
  fetchNodes: async (params: FetchNodesParams = {}): Promise<TreeResponse> => {
    const response = await api.get('/tree', { params });
    return response.data;
  },

  // 단일 노드 조회
  fetchNodeById: async (id: string): Promise<TreeNode> => {
    const response = await api.get(`/tree/${id}`);
    return response.data;
  },

  // 노드 생성
  createNode: async (nodeData: Partial<TreeNode>): Promise<TreeNode> => {
    const response = await api.post('/tree', nodeData);
    return response.data;
  },

  // 노드 업데이트
  updateNode: async (id: string, nodeData: Partial<TreeNode>): Promise<TreeNode> => {
    const response = await api.put(`/tree/${id}`, nodeData);
    return response.data;
  },

  // 노드 삭제
  deleteNode: async (id: string): Promise<void> => {
    await api.delete(`/tree/${id}`);
  },

  // 좋아요 토글
  toggleLike: async (id: string): Promise<TreeNode> => {
    const response = await api.post(`/tree/${id}/like`);
    return response.data;
  },

  // 댓글 추가
  addComment: async (id: string, content: string): Promise<TreeNode> => {
    const response = await api.post(`/tree/${id}/comment`, { content });
    return response.data;
  },

  // 댓글 삭제
  deleteComment: async (nodeId: string, commentId: string): Promise<TreeNode> => {
    const response = await api.delete(`/tree/${nodeId}/comment/${commentId}`);
    return response.data;
  },

  // 태그로 노드 검색
  searchByTags: async (tags: string[]): Promise<TreeResponse> => {
    const response = await api.get('/tree/search', { params: { tags: tags.join(',') } });
    return response.data;
  },

  // 사용자의 트리 노드 조회
  getUserNodes: async (userId: string): Promise<TreeResponse> => {
    const response = await api.get(`/tree/user/${userId}`);
    return response.data;
  },

  // 노드 공유 설정 업데이트
  updateNodeSharing: async (id: string, isPublic: boolean): Promise<TreeNode> => {
    const response = await api.put(`/tree/${id}/sharing`, { isPublic });
    return response.data;
  },
}; 