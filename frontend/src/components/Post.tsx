import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../features/store';
import { likePost, updatePost, deletePost } from '../features/posts/postsSlice';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import CommentsSection from './CommentsSection';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

interface PostProps {
  post: {
    id: string;
    content: string;
    image?: string;
    author: {
      id: string;
      username: string;
      profileImage?: string;
    };
    createdAt: string;
    likes: number;
    isLiked: boolean;
  };
}

const Post: React.FC<PostProps> = ({ post }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showComments, setShowComments] = useState(false);

  console.log('Post 컴포넌트 렌더링:', { 
    postId: post.id, 
    isAuthor: user?.id === post.author.id,
    hasImage: !!post.image,
    likes: post.likes,
    isLiked: post.isLiked
  });

  const handleLike = () => {
    console.log('좋아요 클릭:', { 
      postId: post.id, 
      currentLikes: post.likes,
      willLike: !post.isLiked 
    });
    dispatch(likePost(post.id));
  };

  const handleUpdate = async () => {
    if (editContent === post.content) {
      console.log('게시물 내용 변경 없음 - 수정 취소');
      setIsEditing(false);
      return;
    }

    try {
      console.log('게시물 수정 시도:', { 
        postId: post.id, 
        oldContent: post.content,
        newContent: editContent 
      });
      await dispatch(updatePost({ id: post.id, content: editContent })).unwrap();
      console.log('게시물 수정 성공');
      setIsEditing(false);
    } catch (error) {
      console.error('게시물 수정 실패:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('정말로 이 게시물을 삭제하시겠습니까?')) {
      try {
        console.log('게시물 삭제 시도:', { 
          postId: post.id,
          authorId: post.author.id,
          currentUserId: user?.id 
        });
        await dispatch(deletePost(post.id)).unwrap();
        console.log('게시물 삭제 성공');
      } catch (error) {
        console.error('게시물 삭제 실패:', error);
      }
    } else {
      console.log('게시물 삭제 취소');
    }
  };

  const toggleComments = () => {
    console.log('댓글 토글:', { 
      postId: post.id,
      willShow: !showComments 
    });
    setShowComments(!showComments);
  };

  const isAuthor = user?.id === post.author.id;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.author.profileImage || 'https://via.placeholder.com/40'}
            alt={post.author.username}
            className="w-10 h-10 rounded-full"
            onError={(e) => {
              console.log('프로필 이미지 로드 실패:', post.author.username);
              e.currentTarget.src = 'https://via.placeholder.com/40';
            }}
          />
          <div>
            <p className="font-semibold">{post.author.username}</p>
            <p className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        {isAuthor && (
          <Menu as="div" className="relative">
            <Menu.Button className="p-2 hover:bg-gray-100 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
              <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => {
                          console.log('수정 버튼 클릭:', { postId: post.id });
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
              console.log('게시물 수정 내용 변경:', { 
                postId: post.id,
                length: e.target.value.length 
              });
              setEditContent(e.target.value);
            }}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                console.log('수정 취소:', { postId: post.id });
                setIsEditing(false);
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              취소
            </button>
            <button
              onClick={handleUpdate}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              저장
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-800 mb-4">{post.content}</p>
      )}

      {post.image && (
        <img
          src={post.image}
          alt="Post"
          className="w-full rounded-lg mb-4"
          onError={(e) => {
            console.log('게시물 이미지 로드 실패:', post.id);
            e.currentTarget.style.display = 'none';
          }}
        />
      )}

      <div className="flex items-center space-x-4 mt-4">
        <button
          onClick={handleLike}
          className="flex items-center text-gray-500 hover:text-red-500"
        >
          {post.isLiked ? (
            <HeartIconSolid className="w-5 h-5 text-red-500" />
          ) : (
            <HeartIcon className="w-5 h-5" />
          )}
          <span className="ml-1">{post.likes}</span>
        </button>
        <button
          onClick={toggleComments}
          className="flex items-center text-gray-500 hover:text-blue-500"
        >
          <ChatBubbleLeftIcon className="w-5 h-5" />
          <span className="ml-1">댓글</span>
        </button>
      </div>

      {showComments && <CommentsSection postId={post.id} />}
    </div>
  );
};

export default Post; 