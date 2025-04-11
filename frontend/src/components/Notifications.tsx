import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification
} from '../features/notifications/notificationsSlice';
import { RootState } from '../store';

const Notifications: React.FC = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, status } = useSelector((state: RootState) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkAsRead = (notificationId: string) => {
    dispatch(markNotificationAsRead(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleDelete = (notificationId: string) => {
    dispatch(deleteNotification(notificationId));
  };

  const getNotificationMessage = (notification: any) => {
    switch (notification.type) {
      case 'like':
        return `${notification.sender.username}님이 회원님의 게시물을 좋아합니다.`;
      case 'comment':
        return `${notification.sender.username}님이 회원님의 게시물에 댓글을 남겼습니다.`;
      case 'follow':
        return `${notification.sender.username}님이 회원님을 팔로우하기 시작했습니다.`;
      default:
        return '';
    }
  };

  if (status === 'loading') {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">알림</h2>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            모두 읽음으로 표시
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center py-4">알림이 없습니다.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notification) => (
            <li
              key={notification._id}
              className={`p-3 rounded-lg ${
                !notification.read ? 'bg-blue-50' : 'bg-white'
              }`}
            >
              <div className="flex items-start space-x-3">
                <img
                  src={notification.sender.profileImage || '/default-avatar.png'}
                  alt={notification.sender.username}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm">{getNotificationMessage(notification)}</p>
                    <div className="flex space-x-2">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="text-xs text-blue-500 hover:text-blue-700"
                        >
                          읽음
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification._id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                  {notification.post && (
                    <Link
                      to={`/posts/${notification.post._id}`}
                      className="text-sm text-gray-600 hover:text-gray-800 block mt-1"
                    >
                      {notification.post.content}
                    </Link>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                      locale: ko
                    })}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications; 