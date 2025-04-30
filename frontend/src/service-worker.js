// 기본 오프라인 캐싱 및 푸시 알림 예시
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

// 오프라인 지원: fetch 캐싱 예시
self.addEventListener('fetch', (event) => {
  // 기본 워크박스가 처리하지 않는 요청만 캐싱
});

// 푸시 알림 수신 예시 (FCM 등)
self.addEventListener('push', function(event) {
  let data = {};
  if (event.data) {
    data = event.data.json();
  }
  const title = data.title || 'Love Tree 알림';
  const options = {
    body: data.body || '새로운 알림이 도착했습니다.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: data.url ? { url: data.url } : {},
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// 알림 클릭 시 동작
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification.data && event.notification.data.url;
  if (url) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(windowClients => {
        for (let client of windowClients) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

self.__WB_MANIFEST; 