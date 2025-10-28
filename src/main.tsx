import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { logMedication } from './db/database';

// Listen for service worker messages
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', async (event) => {
    const { type, medicationId, medicationName, scheduledTime } = event.data;

    if (type === 'MEDICATION_CONFIRMED') {
      // Log medication as taken
      await logMedication(medicationId, medicationName, scheduledTime, 'taken');
      console.log('Medication confirmed:', medicationName);
    } else if (type === 'MEDICATION_MISSED') {
      // Log medication as missed
      await logMedication(medicationId, medicationName, scheduledTime, 'missed');
      console.log('Medication missed:', medicationName);
    }

    // Reload app to update UI
    window.location.reload();
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

