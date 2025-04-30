import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addNotification } from '@/features/notifications/notificationsSlice';
import api from '@/utils/axios';

const CreateTree = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [treeData, setTreeData] = useState({
    title: '',
    description: '',
    isPublic: true
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('[트리 생성 요청]', treeData);
      const response = await api.post('/trees', treeData);
      const data = response.data;
      console.log('[트리 생성 응답]', data);

      const treeId = data.id || data._id;
      if (!treeId) {
        throw new Error('생성된 트리의 ID를 찾을 수 없습니다.');
      }

      console.log('[트리 생성 성공] treeId:', treeId);

      dispatch(addNotification({
        _id: Date.now().toString(),
        type: 'custom',
        message: '트리가 성공적으로 생성되었습니다!',
        read: false,
        createdAt: new Date().toISOString(),
      }));

      navigate(`/trees/${treeId}/edit`);
    } catch (error: any) {
      console.error('트리 생성 오류:', error);
      dispatch(addNotification({
        _id: Date.now().toString(),
        type: 'custom',
        message: error.response?.data?.message || error.message || '트리 생성에 실패했습니다. 다시 시도해주세요.',
        read: false,
        createdAt: new Date().toISOString(),
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-tree-container min-h-screen w-full max-w-full p-2 sm:p-4 overflow-x-auto">
      <div className="bg-white rounded-lg shadow p-4 w-full max-w-2xl mx-auto flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-6">새 트리 만들기</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              트리 이름
            </label>
            <input
              type="text"
              id="title"
              value={treeData.title}
              onChange={(e) => setTreeData({ ...treeData, title: e.target.value })}
              className="w-full py-2 px-4 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="트리의 이름을 입력하세요"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              트리 설명
            </label>
            <textarea
              id="description"
              value={treeData.description}
              onChange={(e) => setTreeData({ ...treeData, description: e.target.value })}
              className="w-full py-2 px-4 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="트리에 대한 설명을 입력하세요"
              rows={4}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={treeData.isPublic}
              onChange={(e) => setTreeData({ ...treeData, isPublic: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
              공개 트리로 만들기
            </label>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto py-2 px-4 text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
              disabled={isLoading}
            >
              {isLoading ? '생성 중...' : '트리 만들기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTree; 