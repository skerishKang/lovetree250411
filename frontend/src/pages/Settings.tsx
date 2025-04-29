import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    notifications: {
      email: true,
      push: true,
      messages: true
    }
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('사용자 정보를 가져오는데 실패했습니다.');
        }

        const data = await response.json();
        setUserData(prev => ({
          ...prev,
          username: data.username,
          email: data.email,
          notifications: data.notifications || prev.notifications
        }));
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error);
        alert('사용자 정보를 가져오는데 실패했습니다.');
      }
    };

    fetchUserData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          username: userData.username,
          notifications: userData.notifications
        })
      });

      if (!response.ok) {
        throw new Error('설정 저장에 실패했습니다.');
      }

      alert('설정이 저장되었습니다.');
    } catch (error) {
      console.error('설정 저장 실패:', error);
      alert('설정 저장에 실패했습니다.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (userData.newPassword !== userData.confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: userData.currentPassword,
          newPassword: userData.newPassword
        })
      });

      if (!response.ok) {
        throw new Error('비밀번호 변경에 실패했습니다.');
      }

      alert('비밀번호가 변경되었습니다.');
      setUserData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      alert('비밀번호 변경에 실패했습니다.');
    }
  };

  return (
    <div className="settings-container min-h-screen w-full max-w-full p-2 sm:p-4 overflow-x-auto">
      <div className="bg-white rounded-lg shadow p-4 w-full max-w-2xl mx-auto flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-6">계정 설정</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              사용자 이름
            </label>
            <input
              type="text"
              id="username"
              value={userData.username}
              onChange={(e) => setUserData({ ...userData, username: e.target.value })}
              className="w-full py-2 px-4 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              알림 설정
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="email"
                  checked={userData.notifications.email}
                  onChange={(e) => setUserData({
                    ...userData,
                    notifications: { ...userData.notifications, email: e.target.checked }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="email" className="ml-2 block text-sm text-gray-700">
                  이메일 알림
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="push"
                  checked={userData.notifications.push}
                  onChange={(e) => setUserData({
                    ...userData,
                    notifications: { ...userData.notifications, push: e.target.checked }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="push" className="ml-2 block text-sm text-gray-700">
                  푸시 알림
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="messages"
                  checked={userData.notifications.messages}
                  onChange={(e) => setUserData({
                    ...userData,
                    notifications: { ...userData.notifications, messages: e.target.checked }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="messages" className="ml-2 block text-sm text-gray-700">
                  메시지 알림
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto py-2 px-4 text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              저장
            </button>
          </div>
        </form>

        <h2 className="text-xl font-bold mb-6">비밀번호 변경</h2>

        <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              현재 비밀번호
            </label>
            <input
              type="password"
              id="currentPassword"
              value={userData.currentPassword}
              onChange={(e) => setUserData({ ...userData, currentPassword: e.target.value })}
              className="w-full py-2 px-4 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              새 비밀번호
            </label>
            <input
              type="password"
              id="newPassword"
              value={userData.newPassword}
              onChange={(e) => setUserData({ ...userData, newPassword: e.target.value })}
              className="w-full py-2 px-4 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              새 비밀번호 확인
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={userData.confirmPassword}
              onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
              className="w-full py-2 px-4 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto py-2 px-4 text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              비밀번호 변경
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings; 