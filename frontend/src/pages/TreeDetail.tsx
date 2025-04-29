import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchTreeById, updateTree } from '../features/trees/treeSlice';
import { selectUser } from '../features/auth/authSelectors';
import { addNotification } from '../features/notifications/notificationsSlice';

const TreeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentTree, loading, error } = useSelector((state: RootState) => state.trees);
  const user = useSelector(selectUser);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // 좋아요/팔로우 중복 방지
  const hasLiked = !!(user && currentTree?.likes?.includes(user._id));
  const hasFollowed = !!(user && currentTree?.followers?.includes(user._id));

  useEffect(() => {
    if (id) {
      console.log('트리 상세 정보 조회 시도:', id);
      dispatch(fetchTreeById(id) as any);
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentTree) {
      setEditedTitle(currentTree.title);
      setEditedDescription(currentTree.description);
      setShareUrl(`${window.location.origin}/trees/${id}`);
    }
  }, [currentTree, id]);

  const handleSave = async () => {
    if (!currentTree) return;
    
    try {
      await dispatch(updateTree({
        id: currentTree._id,
        title: editedTitle,
        description: editedDescription,
      }) as any);
      setIsEditing(false);
    } catch (error) {
      console.error('트리 정보 수정 실패:', error);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('URL이 클립보드에 복사되었습니다.');
  };

  const shareOnSocialMedia = (platform) => {
    let url;
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(currentTree.title);
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'kakao':
        // 카카오톡 공유하기 API 구현
        alert('카카오톡 공유 기능은 카카오 SDK 연동이 필요합니다.');
        return;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      default:
        return;
    }
    window.open(url, '_blank');
  };

  // 좋아요 버튼 클릭 핸들러 (API 연동은 추후 구현)
  const handleLike = () => {
    if (!user || !currentTree || hasLiked) return;
    // TODO: API 연동 필요. 임시로 프론트에서만 반영
    currentTree.likes = [...(currentTree.likes || []), user._id];
    // 알림 추가 (작성자 본인에게만)
    if (currentTree.author?.id && user._id !== currentTree.author.id) {
      dispatch(addNotification({
        _id: `${currentTree.id}-like-${user._id}-${Date.now()}`,
        type: 'like',
        sender: user,
        post: { _id: currentTree.id, content: currentTree.title },
        read: false,
        createdAt: new Date().toISOString()
      }));
    }
  };

  // 팔로우 버튼 클릭 핸들러 (API 연동은 추후 구현)
  const handleFollow = () => {
    if (!user || !currentTree || hasFollowed) return;
    // TODO: API 연동 필요. 임시로 프론트에서만 반영
    currentTree.followers = [...(currentTree.followers || []), user._id];
    // 알림 추가 (작성자 본인에게만)
    if (currentTree.author?.id && user._id !== currentTree.author.id) {
      dispatch(addNotification({
        _id: `${currentTree.id}-follow-${user._id}-${Date.now()}`,
        type: 'follow',
        sender: user,
        post: { _id: currentTree.id, content: currentTree.title },
        read: false,
        createdAt: new Date().toISOString()
      }));
    }
  };

  // 비공개 트리 접근 권한 체크
  if (currentTree && currentTree.isPublic === false) {
    // 비로그인 또는 작성자 본인이 아니면 접근 불가
    if (!user || user._id !== (currentTree.author?.id || currentTree.author?._id)) {
      return (
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">비공개 트리입니다</h2>
            <p className="mb-4">이 트리는 작성자 본인만 볼 수 있습니다.</p>
            <button 
              onClick={() => navigate('/trees')} 
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              트리 목록으로 이동
            </button>
          </div>
        </div>
      );
    }
  }

  // 로딩 상태 처리
  if (loading === 'pending') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="text-gray-600">
            <svg className="animate-spin h-8 w-8 text-gray-500 mr-2 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            트리 정보를 불러오는 중...
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">오류가 발생했습니다</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => navigate('/trees')} 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            트리 목록으로 이동
          </button>
        </div>
      </div>
    );
  }

  // 트리 데이터가 없는 경우 처리
  if (!currentTree) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">트리를 찾을 수 없습니다</h2>
          <p className="mb-4">요청하신 트리가 존재하지 않거나 삭제되었을 수 있습니다.</p>
          <button 
            onClick={() => navigate('/trees')} 
            className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
          >
            트리 목록으로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tree-detail-container h-full min-h-screen w-full max-w-full p-2 sm:p-4 overflow-x-auto">
      <div className="bg-white rounded-lg shadow p-4 w-full max-w-3xl mx-auto flex flex-col gap-4">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-grow">
            {isEditing ? (
              <div>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full text-2xl font-bold mb-2 p-2 border rounded"
                />
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="w-full h-32 p-2 border rounded text-gray-600"
                  placeholder="트리 설명을 입력하세요..."
                />
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold mb-2">{currentTree.title}</h1>
                <p className="text-gray-600">{currentTree.description}</p>
                {/* 태그 UI */}
                {currentTree.tags && currentTree.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {currentTree.tags.map((tag: string) => (
                      <button
                        key={tag}
                        onClick={() => navigate(`/trees?tag=${encodeURIComponent(tag)}`)}
                        className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors border border-blue-100"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="text-sm text-gray-500 ml-4">
            {new Date(currentTree.createdAt).toLocaleDateString()}
          </div>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/trees')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            목록으로 돌아가기
          </button>
          {isEditing ? (
            <>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                저장하기
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              트리 정보 수정하기
            </button>
          )}
          <button 
            onClick={() => navigate(`/trees/${id}/edit`)}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            트리 편집하기
          </button>
          <button 
            onClick={handleShare}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            공유
          </button>
          {/* 좋아요 버튼 */}
          <button
            onClick={handleLike}
            disabled={hasLiked || !user}
            className={`px-4 py-2 rounded transition-colors duration-200 ${hasLiked ? 'bg-pink-200 text-pink-600' : 'bg-pink-500 text-white hover:bg-pink-600'}`}
          >
            ❤️ 좋아요 {currentTree.likes?.length || 0}
          </button>
          {/* 팔로우 버튼 */}
          <button
            onClick={handleFollow}
            disabled={hasFollowed || !user}
            className={`px-4 py-2 rounded transition-colors duration-200 ${hasFollowed ? 'bg-green-200 text-green-600' : 'bg-green-500 text-white hover:bg-green-600'}`}
          >
            {hasFollowed ? '팔로잉' : '팔로우'} {currentTree.followers?.length || 0}
          </button>
        </div>

        {/* 공유 모달 */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">트리 공유하기</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  공유 URL
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-l-md"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
                  >
                    복사
                  </button>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => shareOnSocialMedia('twitter')}
                  className="p-2 bg-blue-400 text-white rounded-full hover:bg-blue-500"
                >
                  트위터
                </button>
                <button
                  onClick={() => shareOnSocialMedia('facebook')}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                >
                  페이스북
                </button>
                <button
                  onClick={() => shareOnSocialMedia('kakao')}
                  className="p-2 bg-yellow-400 text-white rounded-full hover:bg-yellow-500"
                >
                  카카오
                </button>
                <button
                  onClick={() => shareOnSocialMedia('telegram')}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                >
                  텔레그램
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TreeDetail; 