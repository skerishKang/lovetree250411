import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import ChatList from './ChatList';
import Chat from './Chat';
import axios from 'axios';

const ChatPage: React.FC = () => {
  const { activeChat } = useSelector((state: RootState) => state.chat);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    username: string;
    profileImage?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('채팅 페이지 컴포넌트 마운트');
    return () => {
      console.log('채팅 페이지 컴포넌트 언마운트');
    };
  }, []);

  useEffect(() => {
    if (activeChat) {
      console.log('활성 채팅 변경:', activeChat);
      const fetchUserInfo = async () => {
        setLoading(true);
        try {
          console.log('사용자 정보 가져오기 시도:', activeChat);
          const response = await axios.get(`/api/users/${activeChat}`);
          console.log('사용자 정보 가져오기 성공:', response.data);
          setSelectedUser(response.data);
        } catch (error) {
          console.error('사용자 정보를 불러오는데 실패했습니다:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserInfo();
    } else {
      console.log('활성 채팅 없음');
      setSelectedUser(null);
    }
  }, [activeChat]);

  console.log('채팅 페이지 렌더링:', { activeChat, selectedUser, loading });

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <ChatList />
      <div className="flex-1 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : selectedUser ? (
          <Chat
            userId={selectedUser.id}
            username={selectedUser.username}
            profileImage={selectedUser.profileImage}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">채팅할 사용자를 선택해주세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage; 