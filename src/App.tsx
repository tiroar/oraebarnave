import { useState, useEffect } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { BloodSugarTracker } from './components/BloodSugarTracker';
import { InstructionsScreen } from './components/InstructionsScreen';
import { MedicationListScreen } from './components/MedicationListScreen';
import { MedicalReportsScreen } from './components/MedicalReportsScreen';
import { EmergencyScreen } from './components/EmergencyScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { DoctorAppointmentsScreen } from './components/DoctorAppointmentsScreen';
import { HealthDiaryScreen } from './components/HealthDiaryScreen';
import { PrivacyScreen } from './components/PrivacyScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { initializeSettings, getSettings } from './db/database';
import { registerNotifications, scheduleAllNotifications } from './utils/notifications';
import './styles/global.css';

type Screen = 'home' | 'history' | 'bloodsugar' | 'instructions' | 'medlist' | 'reports' | 'emergency' | 'settings' | 'appointments' | 'diary' | 'privacy';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [notificationsGranted, setNotificationsGranted] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showWelcome, setShowWelcome] = useState(() => {
    // Check if user has completed welcome
    return localStorage.getItem('welcomeCompleted') !== 'true';
  });

  useEffect(() => {
    // Initialize database
    initializeSettings();
    
    // Load font size settings
    loadFontSize();

    // Check notification permission
    if ('Notification' in window) {
      setNotificationsGranted(Notification.permission === 'granted');
    }

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    });

    // Schedule notifications on load
    if (Notification.permission === 'granted') {
      scheduleAllNotifications();
    }
  }, []);

  const loadFontSize = async () => {
    const settings = await getSettings();
    if (settings?.fontSize) {
      document.body.className = `font-${settings.fontSize}`;
    }
  };

  // Listen for font size changes from settings
  useEffect(() => {
    const handleStorageChange = () => {
      loadFontSize();
    };
    
    window.addEventListener('fontSizeChanged', handleStorageChange);
    return () => window.removeEventListener('fontSizeChanged', handleStorageChange);
  }, []);

  const requestNotifications = async () => {
    try {
      const granted = await registerNotifications();
      setNotificationsGranted(granted);
      
      if (granted) {
        await scheduleAllNotifications();
        alert('✅ Njoftimet u aktivizuan! Do të marrësh kujtesa për medikamentet.');
      }
    } catch (error) {
      console.error('Error requesting notifications:', error);
      alert('❌ Nuk mund të aktivizohen njoftimet. Kontrollo cilësimet e telefonit.');
    }
  };

  const handleInstallApp = async () => {
    if (!installPrompt) {
      alert('Aplikacioni është i instaluar tashmë ose nuk mund të instalohet.');
      return;
    }

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      alert('✅ Aplikacioni u instalua! Gjeje në ekranin kryesor.');
    }
    
    setInstallPrompt(null);
  };

  // Show welcome screen on first run
  if (showWelcome) {
    return <WelcomeScreen onComplete={() => setShowWelcome(false)} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Show notification request banner if not granted */}
      {!notificationsGranted && (
        <div style={{
          background: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
          padding: '0.75rem',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: '#1a1a1a' }}>
            ⚠️ Aktivizo njoftimet për kujtesa!
          </div>
          <button
            className="btn-primary"
            onClick={requestNotifications}
            style={{ maxWidth: '400px', margin: '0 auto', padding: '0.75rem 1rem', fontSize: '1rem' }}
          >
            🔔 Aktivizo Njoftimet
          </button>
        </div>
      )}

      {/* Show install banner if available */}
      {installPrompt && (
        <div style={{
          background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
          padding: '0.75rem',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            📱 Instalo aplikacionin në telefon!
          </div>
          <button
            className="btn-primary"
            onClick={handleInstallApp}
            style={{ 
              maxWidth: '400px', 
              margin: '0 auto',
              background: 'white',
              color: '#4CAF50',
              padding: '0.75rem 1rem',
              fontSize: '1rem'
            }}
          >
            ⬇️ Instalo Tani
          </button>
        </div>
      )}

      {/* Main content */}
      {currentScreen === 'home' && <HomeScreen />}
      {currentScreen === 'emergency' && <EmergencyScreen />}
      {currentScreen === 'bloodsugar' && <BloodSugarTracker />}
      {currentScreen === 'diary' && <HealthDiaryScreen />}
      {currentScreen === 'appointments' && <DoctorAppointmentsScreen />}
      {currentScreen === 'medlist' && <MedicationListScreen />}
      {currentScreen === 'reports' && <MedicalReportsScreen />}
      {currentScreen === 'history' && <HistoryScreen />}
      {currentScreen === 'settings' && <SettingsScreen />}
      {currentScreen === 'instructions' && <InstructionsScreen />}
      {currentScreen === 'privacy' && <PrivacyScreen />}

      {/* Bottom navigation - Dropdown */}
      <div className="bottom-nav">
        <div style={{ position: 'relative', width: '100%' }}>
          <select
            value={currentScreen}
            onChange={(e) => setCurrentScreen(e.target.value as Screen)}
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1.25rem',
              fontWeight: 600,
              border: '2px solid #4CAF50',
              borderRadius: '12px',
              background: 'white',
              color: '#333',
              cursor: 'pointer'
            }}
          >
            <option value="home">🏠 Kryefaqja</option>
            <option value="bloodsugar">🩸 Sheqeri në Gjak</option>
            <option value="history">📊 Historia</option>
            <option value="medlist">💊 Lista e Barnave</option>
            <option value="diary">📖 Ditari i Shëndetit</option>
            <option value="reports">🏥 Raportet Mjekësore</option>
            <option value="appointments">👨‍⚕️ Takimet me Doktorë</option>
            <option value="settings">⚙️ Cilësimet</option>
            <option value="privacy">🔒 Privatësia</option>
            <option value="emergency" style={{ color: '#D32F2F' }}>🚨 Urgjencë</option>
          </select>
          <div style={{
            position: 'absolute',
            right: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            fontSize: '1.5rem'
          }}>
            ▼
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

