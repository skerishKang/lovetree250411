import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createNode, updateNode } from '../features/tree/treeSlice';
import { TreeNode } from '../types/tree';

interface TreeNodeFormProps {
  userId: string;
  parentId?: string;
  node?: TreeNode;
  onClose: () => void;
}

const TreeNodeForm: React.FC<TreeNodeFormProps> = ({ userId, parentId, node, onClose }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    content: node?.content || '',
    type: node?.type || 'branch',
    stage: node?.stage || '썸',
    description: node?.description || '',
    mediaUrl: node?.mediaUrl || '',
    tags: node?.tags?.join(', ') || '',
    isPublic: node?.isPublic ?? true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nodeData = {
      ...formData,
      user: userId,
      parent: parentId,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    if (node) {
      await dispatch(updateNode({ id: node._id, nodeData }));
    } else {
      await dispatch(createNode(nodeData));
    }
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{node ? '노드 수정' : '새 노드 생성'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">내용</label>
            <input
              type="text"
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">타입</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="root">루트</option>
              <option value="branch">가지</option>
              <option value="leaf">잎</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">단계</label>
            <select
              name="stage"
              value={formData.stage}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="썸">썸</option>
              <option value="입덕">입덕</option>
              <option value="팬심">팬심</option>
              <option value="폴인럽">폴인럽</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">설명</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">미디어 URL</label>
            <input
              type="url"
              name="mediaUrl"
              value={formData.mediaUrl}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">태그 (쉼표로 구분)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">공개</label>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              {node ? '수정' : '생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TreeNodeForm; 