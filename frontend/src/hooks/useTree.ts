import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  fetchNodes,
  createNode,
  updateNode,
  deleteNode,
  likeNode,
  unlikeNode,
  addComment,
  deleteComment,
} from '@/features/tree/treeSlice';

interface NodeData {
  title: string;
  content: string;
  tags?: string[];
  media?: {
    type: 'image' | 'video';
    url: string;
  };
}

interface CommentData {
  content: string;
}

export const useTree = () => {
  const dispatch = useDispatch();
  const { nodes, loading, error } = useSelector((state: RootState) => state.tree);
  const [treeError, setTreeError] = useState<string | null>(null);

  const getNodes = useCallback(
    async (params?: { search?: string; tags?: string[] }) => {
      try {
        setTreeError(null);
        await dispatch(fetchNodes(params)).unwrap();
      } catch (error) {
        setTreeError('트리 노드를 불러오는데 실패했습니다.');
      }
    },
    [dispatch]
  );

  const createTreeNode = useCallback(
    async (data: NodeData) => {
      try {
        setTreeError(null);
        await dispatch(createNode(data)).unwrap();
        return true;
      } catch (error) {
        setTreeError('트리 노드 생성에 실패했습니다.');
        return false;
      }
    },
    [dispatch]
  );

  const updateTreeNode = useCallback(
    async (nodeId: string, data: Partial<NodeData>) => {
      try {
        setTreeError(null);
        await dispatch(updateNode({ nodeId, data })).unwrap();
        return true;
      } catch (error) {
        setTreeError('트리 노드 수정에 실패했습니다.');
        return false;
      }
    },
    [dispatch]
  );

  const deleteTreeNode = useCallback(
    async (nodeId: string) => {
      try {
        setTreeError(null);
        await dispatch(deleteNode(nodeId)).unwrap();
        return true;
      } catch (error) {
        setTreeError('트리 노드 삭제에 실패했습니다.');
        return false;
      }
    },
    [dispatch]
  );

  const toggleLike = useCallback(
    async (nodeId: string, isLiked: boolean) => {
      try {
        setTreeError(null);
        if (isLiked) {
          await dispatch(unlikeNode(nodeId)).unwrap();
        } else {
          await dispatch(likeNode(nodeId)).unwrap();
        }
        return true;
      } catch (error) {
        setTreeError('좋아요 처리에 실패했습니다.');
        return false;
      }
    },
    [dispatch]
  );

  const addNodeComment = useCallback(
    async (nodeId: string, data: CommentData) => {
      try {
        setTreeError(null);
        await dispatch(addComment({ nodeId, content: data.content })).unwrap();
        return true;
      } catch (error) {
        setTreeError('댓글 작성에 실패했습니다.');
        return false;
      }
    },
    [dispatch]
  );

  const deleteNodeComment = useCallback(
    async (nodeId: string, commentId: string) => {
      try {
        setTreeError(null);
        await dispatch(deleteComment({ nodeId, commentId })).unwrap();
        return true;
      } catch (error) {
        setTreeError('댓글 삭제에 실패했습니다.');
        return false;
      }
    },
    [dispatch]
  );

  return {
    nodes,
    loading,
    error: error || treeError,
    getNodes,
    createTreeNode,
    updateTreeNode,
    deleteTreeNode,
    toggleLike,
    addNodeComment,
    deleteNodeComment,
  };
}; 