import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../features/store';
import { setActiveChat } from '../features/chat/chatSlice';
import axios from 'axios';

interface ChatUser {
  id: string;
  username: string;
  profileImage?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isOnline: boolean;
}

const ChatList: React.FC = () => {
  const dispatch = useDispatch();
  const { activeChat, onlineUsers } = useSelector((state: RootState) => state.chat);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('채팅 목록 컴포넌트 마운트');
    const fetchChatUsers = async () => {
      try {
        console.log('채팅 사용자 목록 가져오기 시도');
        const response = await axios.get('/api/chat/users');
        console.log('채팅 사용자 목록 가져오기 성공:', response.data);
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('채팅 목록을 불러오는데 실패했습니다:', error);
        setLoading(false);
      }
    };

    fetchChatUsers();

    return () => {
      console.log('채팅 목록 컴포넌트 언마운트');
    };
  }, []);

  const handleUserClick = (userId: string) => {
    console.log('사용자 선택:', userId);
    dispatch(setActiveChat(userId));
  };

  if (loading) {
    console.log('채팅 목록 로딩 중');
    return (
      <div className="w-80 bg-white h-full border-r">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  console.log('채팅 목록 렌더링:', { users, activeChat });

  return (
    <div className="w-80 bg-white h-full border-r">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">채팅</h2>
      </div>
      <div className="overflow-y-auto">
        {users.map((user) => (
          <div
            key={user.id}
            className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 ${
              activeChat === user.id ? 'bg-blue-50' : ''
            }`}
            onClick={() => handleUserClick(user.id)}
          >
            <div className="relative">
              <img
                src={user.profileImage || '/default-profile.png'}
                alt={user.username}
                className="w-12 h-12 rounded-full"
              />
              {user.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div className="ml-3 flex-1">
              <div className="flex justify-between items-center">
                <p className="font-semibold">{user.username}</p>
                {user.lastMessageTime && (
                  <p className="text-xs text-gray-500">
                    {new Date(user.lastMessageTime).toLocaleTimeString()}
                  </p>
                )}
              </div>
              {user.lastMessage && (
                <p className="text-sm text-gray-500 truncate">{user.lastMessage}</p>
              )}
            </div>
            {user.unreadCount && user.unreadCount > 0 && (
              <div className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {user.unreadCount}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList; 