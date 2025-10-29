// Service Worker for PWA - Handles notifications and offline caching

const CACHE_NAME = 'medication-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch handler - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (action === 'confirm') {
    // Handle confirmation
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Send message to client to log medication
        if (clientList.length > 0) {
          clientList[0].postMessage({
            type: 'MEDICATION_CONFIRMED',
            medicationId: data.medicationId,
            medicationName: data.medicationName,
            scheduledTime: data.scheduledTime
          });
          return clientList[0].focus();
        }
        // Open app if not already open
        return clients.openWindow('/');
      })
    );
  } else if (action === 'snooze') {
    // Snooze for 10 minutes
    event.waitUntil(
      new Promise((resolve) => {
        setTimeout(() => {
          self.registration.showNotification('⏰ Kujtesë: Medikament!', {
            body: `${data.medicationName}\nKoha: ${data.scheduledTime}`,
            icon: '/icon-192.png',
            vibrate: [200, 100, 200],
            tag: data.medicationId,
            requireInteraction: true,
            actions: [
              { action: 'confirm', title: '✅ E mora' },
              { action: 'snooze', title: '⏰ Pas 10 min' }
            ],
            data: data
          });
          resolve();
        }, 10 * 60 * 1000); // 10 minutes
      })
    );
  } else {
    // Default action - open app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.data);
  
  // Log as missed medication
  const data = event.notification.data;
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      if (clientList.length > 0) {
        clientList[0].postMessage({
          type: 'MEDICATION_MISSED',
          medicationId: data.medicationId,
          medicationName: data.medicationName,
          scheduledTime: data.scheduledTime
        });
      }
    })
  );
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-medications') {
    event.waitUntil(checkMedicationSchedule());
  }
});

async function checkMedicationSchedule() {
  console.log('Checking medication schedule...');
  
  try {
    // Get current time
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Check if any medications are due within the next 30 minutes
    // This would need to access IndexedDB to get medications
    // For now, we'll show a notification reminder to open the app
    
    const registration = await self.registration;
    await registration.showNotification('⏰ Ora e Barnave', {
      body: 'Hap aplikacionin për të kontrolluar orarin e barnave',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'medication-reminder',
      requireInteraction: false,
      data: {
        url: '/'
      }
    });
  } catch (error) {
    console.error('Error checking medication schedule:', error);
  }
}

