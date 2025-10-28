import { shouldShowMedicationToday, getAllActiveMedications } from './medicationHelpers';

export async function registerNotifications(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }

  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return false;
  }

  try {
    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      return false;
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('Service Worker registered:', registration);

    return true;
  } catch (error) {
    console.error('Error registering notifications:', error);
    return false;
  }
}

export async function scheduleAllNotifications() {
  if (!('serviceWorker' in navigator) || Notification.permission !== 'granted') {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Clear existing notifications
    const existingNotifications = await registration.getNotifications();
    existingNotifications.forEach(notif => notif.close());

    // Get all active medications from database
    const medications = await getAllActiveMedications();

    // Schedule notifications for each medication that should be shown today
    const today = new Date();
    for (const med of medications) {
      if (shouldShowMedicationToday(med, today)) {
        await scheduleNotification(med);
      }
    }

    console.log('All notifications scheduled');
  } catch (error) {
    console.error('Error scheduling notifications:', error);
  }
}

async function scheduleNotification(med: any) {
  const [hour, minute] = med.time.split(':').map(Number);
  
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(hour, minute, 0, 0);

  // If time has passed today, schedule for tomorrow
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  const delay = scheduledTime.getTime() - now.getTime();

  // Use setTimeout for scheduling (in a real app, you'd use background sync or a more robust solution)
  setTimeout(async () => {
    // Check if medication should be shown today before showing notification
    const notificationDate = new Date();
    if (shouldShowMedicationToday(med, notificationDate)) {
      await showNotification(med);
    }
    
    // Reschedule: check every day if it should be shown
    // For monthly meds, this will only trigger on the correct day
    setTimeout(() => scheduleNotification(med), 24 * 60 * 60 * 1000);
  }, delay);
}

export async function showNotification(med: any) {
  if (!('serviceWorker' in navigator) || Notification.permission !== 'granted') {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    await registration.showNotification('⏰ KOHA PËR MEDIKAMENT!', {
      body: `${med.name} ${med.dose}\n${med.timing}`,
      icon: '/icon-192.png',
      badge: '/badge-icon.png',
      tag: med.id,
      requireInteraction: true,
      data: {
        medicationId: med.id,
        medicationName: med.name,
        scheduledTime: med.time
      }
    } as NotificationOptions);

    // Also play sound
    playAlarmSound(med.sound || 'normal');
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

function playAlarmSound(type: string) {
  try {
    // Use Web Audio API to generate a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different frequencies based on urgency
    if (type === 'urgent') {
      oscillator.frequency.value = 880; // High pitch
      gainNode.gain.value = 0.3;
    } else if (type === 'normal') {
      oscillator.frequency.value = 440; // Middle A
      gainNode.gain.value = 0.2;
    } else {
      oscillator.frequency.value = 262; // Middle C
      gainNode.gain.value = 0.15;
    }
    
    oscillator.type = 'sine';
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3); // 300ms beep
    
    // Repeat beep 3 times for urgent
    if (type === 'urgent') {
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        osc2.connect(gainNode);
        osc2.frequency.value = 880;
        osc2.type = 'sine';
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.3);
      }, 400);
      
      setTimeout(() => {
        const osc3 = audioContext.createOscillator();
        osc3.connect(gainNode);
        osc3.frequency.value = 880;
        osc3.type = 'sine';
        osc3.start(audioContext.currentTime);
        osc3.stop(audioContext.currentTime + 0.3);
      }, 800);
    }
  } catch (error) {
    console.log('Could not play sound:', error);
  }
}

// Check for missed medications
export async function checkMissedMedications() {
  // Logic to check which medications were missed
  // This would be called periodically
}

