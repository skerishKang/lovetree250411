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
import { X } from 'lucide-react';

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
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl p-4 transition-all duration-300 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">알림</h2>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-blue-500 hover:text-blue-700 transition-colors duration-200"
          >
            모두 읽음으로 표시
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center py-4">알림이 없습니다.</p>
      ) : (
        <ul className="space-y-4 divide-y divide-gray-200" role="list">
          {notifications.map((notification) => (
            <li
              key={notification._id}
              className={`p-3 rounded-lg group transition-all duration-200 cursor-pointer hover:bg-blue-50 border border-transparent hover:border-blue-200 shadow-sm`}
              role="listitem"
            >
              <div className="flex items-start space-x-3">
                <img
                  src={notification.sender.profileImage || '/default-avatar.png'}
                  alt={notification.sender.username}
                  className="w-10 h-10 rounded-full border border-gray-200 shadow-sm group-hover:scale-105 transition-transform duration-200"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700 transition-colors duration-200">{getNotificationMessage(notification)}</p>
                    <div className="flex space-x-2">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="text-xs text-blue-500 hover:text-blue-700 transition-colors duration-200 px-2 py-1 rounded hover:bg-blue-100"
                        >
                          읽음
                        </button>
                      )}
                      <button
                        className="ml-2 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="알림 삭제"
                        tabIndex={0}
                        role="button"
                        onClick={() => handleDelete(notification._id)}
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                  {notification.post && (
                    <Link
                      to={`/posts/${notification.post._id}`}
                      className="text-sm text-gray-600 hover:text-gray-800 block mt-1 truncate"
                    >
                      {notification.post.content}
                    </Link>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
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