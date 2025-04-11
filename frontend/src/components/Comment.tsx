import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../features/store';
import { deleteComment, updateComment } from '../features/comments/commentsSlice';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface CommentProps {
  comment: {
    id: string;
    content: string;
    author: {
      id: string;
      username: string;
      profileImage: string;
    };
    createdAt: string;
    postId: string;
  };
}

const Comment = ({ comment }: CommentProps) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  console.log('Comment 컴포넌트 렌더링:', { 
    commentId: comment.id, 
    isAuthor: user?.id === comment.author.id,
    postId: comment.postId,
    authorId: comment.author.id,
    currentUserId: user?.id
  });

  const handleDelete = async () => {
    if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      try {
        console.log('댓글 삭제 시도:', { 
          commentId: comment.id, 
          postId: comment.postId,
          authorId: comment.author.id,
          currentUserId: user?.id
        });
        await dispatch(deleteComment({ postId: comment.postId, commentId: comment.id })).unwrap();
        console.log('댓글 삭제 성공');
      } catch (error) {
        console.error('댓글 삭제 실패:', error);
      }
    } else {
      console.log('댓글 삭제 취소');
    }
  };

  const handleUpdate = async () => {
    if (editContent === comment.content) {
      console.log('댓글 내용 변경 없음 - 수정 취소');
      setIsEditing(false);
      return;
    }

    try {
      console.log('댓글 수정 시도:', { 
        commentId: comment.id,
        postId: comment.postId,
        oldContent: comment.content,
        newContent: editContent
      });
      await dispatch(updateComment({ 
        postId: comment.postId, 
        commentId: comment.id, 
        content: editContent 
      })).unwrap();
      console.log('댓글 수정 성공');
      setIsEditing(false);
    } catch (error) {
      console.error('댓글 수정 실패:', error);
    }
  };

  const isAuthor = user?.id === comment.author.id;

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <img
            src={comment.author.profileImage || 'https://via.placeholder.com/32'}
            alt={comment.author.username}
            className="w-8 h-8 rounded-full"
            onError={(e) => {
              console.log('댓글 작성자 프로필 이미지 로드 실패:', comment.author.username);
              e.currentTarget.src = 'https://via.placeholder.com/32';
            }}
          />
          <div>
            <p className="font-semibold text-sm">{comment.author.username}</p>
            <p className="text-xs text-gray-500">
              {new Date(comment.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        {isAuthor && (
          <Menu as="div" className="relative">
            <Menu.Button className="p-1 hover:bg-gray-200 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => {
                          console.log('댓글 수정 모드 활성화:', { commentId: comment.id });
                          setIsEditing(true);
                        }}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                      >
                        수정
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleDelete}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } block w-full text-left px-4 py-2 text-sm text-red-600`}
                      >
                        삭제
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        )}
      </div>
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => {
              console.log('댓글 수정 내용 변경:', { 
                commentId: comment.id,
                length: e.target.value.length 
              });
              setEditContent(e.target.value);
            }}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            rows={2}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                console.log('댓글 수정 취소:', { commentId: comment.id });
                setIsEditing(false);
              }}
              className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              취소
            </button>
            <button
              onClick={handleUpdate}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              저장
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-800 text-sm">{comment.content}</p>
      )}
    </div>
  );
};

export default Comment; 