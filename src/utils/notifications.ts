import { medications } from '../data/medications';
import { shouldShowMedicationToday } from './medicationHelpers';

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
    const audio = new Audio();
    
    // Different alarm tones based on urgency
    if (type === 'urgent') {
      // Loud, attention-grabbing tone
      audio.src = '/sounds/urgent-alarm.mp3';
    } else if (type === 'normal') {
      // Standard notification sound
      audio.src = '/sounds/normal-alarm.mp3';
    } else {
      // Gentle reminder
      audio.src = '/sounds/gentle-reminder.mp3';
    }

    audio.volume = 1.0;
    audio.play().catch(err => console.log('Could not play sound:', err));
  } catch (error) {
    console.error('Error playing sound:', error);
  }
}

// Check for missed medications
export async function checkMissedMedications() {
  // Logic to check which medications were missed
  // This would be called periodically
}

