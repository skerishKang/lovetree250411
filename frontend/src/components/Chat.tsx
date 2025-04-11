import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { getChatUsers, getChatMessages, createMessage } from '../features/chat/chatSlice';
import { io, Socket } from 'socket.io-client';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

const Chat: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, messages, status } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('채팅 컴포넌트 마운트');
    dispatch(getChatUsers());
    
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });
    
    console.log('소켓 연결 시도');
    setSocket(newSocket);

    return () => {
      console.log('채팅 컴포넌트 언마운트, 소켓 연결 종료');
      newSocket.close();
    };
  }, [dispatch]);

  useEffect(() => {
    if (selectedUser) {
      console.log('선택된 사용자 변경:', selectedUser);
      dispatch(getChatMessages(selectedUser));
    }
  }, [dispatch, selectedUser]);

  useEffect(() => {
    if (socket) {
      console.log('소켓 이벤트 리스너 설정');
      socket.on('message', (message) => {
        console.log('새 메시지 수신:', message);
        if (message.sender === selectedUser || message.receiver === selectedUser) {
          dispatch(getChatMessages(selectedUser!));
        }
      });
    }
  }, [socket, selectedUser, dispatch]);

  useEffect(() => {
    console.log('메시지 목록 업데이트, 스크롤 이동');
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) {
      console.log('메시지 전송 실패: 빈 메시지 또는 선택된 사용자 없음');
      return;
    }

    console.log('메시지 전송 시도:', { receiver: selectedUser, content: newMessage });
    await dispatch(createMessage({
      receiver: selectedUser,
      content: newMessage
    }));

    setNewMessage('');
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* 채팅 목록 */}
      <div className="w-1/3 border-r">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">채팅</h2>
          {users.map((chatUser) => (
            <div
              key={chatUser._id}
              className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 ${
                selectedUser === chatUser._id ? 'bg-gray-100' : ''
              }`}
              onClick={() => setSelectedUser(chatUser._id)}
            >
              <img
                src={chatUser.profileImage || '/default-profile.png'}
                alt={chatUser.username}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div className="flex-1">
                <div className="font-semibold">{chatUser.username}</div>
                <div className="text-sm text-gray-500 truncate">
                  {chatUser.lastMessage?.content}
                </div>
              </div>
              {chatUser.unreadCount > 0 && (
                <div className="ml-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {chatUser.unreadCount}
                </div>
              )}
              {chatUser.isOnline && (
                <div className="ml-2 w-2 h-2 bg-green-500 rounded-full" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 채팅 내용 */}
      <div className="w-2/3 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 border-b flex items-center">
              <img
                src={users.find(u => u._id === selectedUser)?.profileImage || '/default-profile.png'}
                alt=""
                className="w-8 h-8 rounded-full mr-3"
              />
              <h3 className="font-semibold">
                {users.find(u => u._id === selectedUser)?.username}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`mb-4 ${
                    message.sender === user?._id ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg ${
                      message.sender === user?._id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    {message.content}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
                >
                  전송
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <ChatBubbleLeftIcon className="w-12 h-12 mx-auto mb-2" />
              <p>채팅을 선택해주세요</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat; 