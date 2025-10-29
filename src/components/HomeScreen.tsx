import { useState, useEffect } from 'react';
import { Medication } from '../data/medications';
import { MedicationCard } from './MedicationCard';
import { MedicationGroupCard } from './MedicationGroupCard';
import { NotificationWarning } from './NotificationWarning';
import { getTodayLogs } from '../db/database';
import { formatDateAlbanian, formatTimeAlbanian } from '../utils/dateHelpers';
import { shouldShowMedicationToday, getAllActiveMedications } from '../utils/medicationHelpers';

export function HomeScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [takenMeds, setTakenMeds] = useState<Set<string>>(new Set());
  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Load medications from database
    loadMedications();
  }, []);

  useEffect(() => {
    // Load today's logs
    loadTodayLogs();
    
    // Check for active medication every minute
    const checker = setInterval(() => {
      checkActiveMedication();
    }, 60000); // Check every minute
    
    checkActiveMedication(); // Check immediately
    
    return () => clearInterval(checker);
  }, [medications]);

  const loadMedications = async () => {
    const meds = await getAllActiveMedications();
    setMedications(meds);
  };

  const loadTodayLogs = async () => {
    const logs = await getTodayLogs();
    const taken = new Set(
      logs
        .filter(log => log.status === 'taken')
        .map(log => log.medicationId)
    );
    setTakenMeds(taken);
  };

  const checkActiveMedication = () => {
    const now = new Date();
    
    // Find medication that should be taken now (within 30 minutes window)
    for (const med of medications) {
      // Skip if medication shouldn't be shown today
      if (!shouldShowMedicationToday(med, now)) {
        continue;
      }
      
      const [medHour, medMin] = med.time.split(':').map(Number);
      const [nowHour, nowMin] = [now.getHours(), now.getMinutes()];
      
      const medTotalMin = medHour * 60 + medMin;
      const nowTotalMin = nowHour * 60 + nowMin;
      const diff = nowTotalMin - medTotalMin;
      
      // If within -5 to +30 minutes window and not taken
      if (diff >= -5 && diff <= 30 && !takenMeds.has(med.id)) {
        setActiveAlert(med.id);
        return;
      }
    }
    
    setActiveAlert(null);
  };

  const handleConfirm = (medId: string) => {
    setTakenMeds(prev => new Set([...prev, medId]));
    setActiveAlert(null);
    
    // Speak confirmation (if supported)
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Shumë mirë! Medikamenti u regjistrua.');
      utterance.lang = 'sq-AL';
      window.speechSynthesis.speak(utterance);
    }
    
    // Reload today's logs to reflect the change
    loadTodayLogs();
  };

  // Listen for medication updates
  useEffect(() => {
    const handleMedicationsUpdated = () => {
      loadMedications();
    };
    
    window.addEventListener('medicationsUpdated', handleMedicationsUpdated);
    return () => window.removeEventListener('medicationsUpdated', handleMedicationsUpdated);
  }, []);

  const handleSnooze = () => {
    setActiveAlert(null);
    
    // Set new alert in 10 minutes
    setTimeout(() => {
      checkActiveMedication();
    }, 10 * 60 * 1000);
  };

  // Group medications by time
  const groupMedicationsByTime = (meds: Medication[]) => {
    const grouped = new Map<string, Medication[]>();
    
    meds.forEach(med => {
      const existing = grouped.get(med.time) || [];
      existing.push(med);
      grouped.set(med.time, existing);
    });
    
    // Sort by time
    return Array.from(grouped.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([time, meds]) => ({ time, medications: meds }));
  };

  const getTodayMeds = () => {
    const now = new Date();
    // Show ALL medications for today that should be shown today
    const todaysMeds = medications.filter(med => 
      shouldShowMedicationToday(med, now) && !takenMeds.has(med.id)
    );
    return groupMedicationsByTime(todaysMeds);
  };

  const getPastMeds = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const pastMeds = medications.filter(med => {
      // Skip if medication shouldn't be shown today
      if (!shouldShowMedicationToday(med, now)) {
        return false;
      }
      
      const [hour, min] = med.time.split(':').map(Number);
      const medMinutes = hour * 60 + min;
      // Show if time has passed but not taken
      return medMinutes < currentMinutes && !takenMeds.has(med.id);
    });
    
    return groupMedicationsByTime(pastMeds);
  };

  const getCompletionPercentage = () => {
    const now = new Date();
    // Only count medications that should be shown today
    const todaysMedications = medications.filter(med => shouldShowMedicationToday(med, now));
    const total = todaysMedications.length;
    
    // Count how many of today's medications have been taken
    const taken = todaysMedications.filter(med => takenMeds.has(med.id)).length;
    
    return total > 0 ? Math.round((taken / total) * 100) : 100;
  };

  const todayMeds = getTodayMeds();
  const pastMeds = getPastMeds();
  const activeMed = medications.find(m => m.id === activeAlert);
  const completion = getCompletionPercentage();
  
  // Get today's total medications count (only those that should be shown today)
  const now = new Date();
  const todaysMedicationsTotal = medications.filter(med => shouldShowMedicationToday(med, now)).length;
  const todaysTakenCount = medications.filter(med => 
    shouldShowMedicationToday(med, now) && takenMeds.has(med.id)
  ).length;

  return (
    <div>
      {/* Header with time */}
      <div className="header" style={{ padding: '1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
            {formatDateAlbanian(currentTime)}
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', marginTop: '0.25rem' }}>
            {formatTimeAlbanian(currentTime)}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '120px' }}>
        {/* Notification Warning */}
        <NotificationWarning />

        {/* Daily progress */}
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>
            Gjendja ditore
          </h2>
          <div className="compliance-bar">
            <div 
              className="compliance-fill" 
              style={{ width: `${completion}%` }}
            >
              {completion}%
            </div>
          </div>
          <div style={{ 
            textAlign: 'center', 
            fontSize: '1.5rem', 
            marginTop: '1rem',
            fontWeight: 600 
          }}>
            {todaysTakenCount} nga {todaysMedicationsTotal} medikamente
          </div>
        </div>

        {/* Active medication alert */}
        {activeMed && (
          <div style={{ marginTop: '1.5rem' }}>
            <h2 style={{ 
              textAlign: 'center', 
              color: '#D32F2F', 
              fontSize: '2.5rem',
              marginBottom: '1rem',
              animation: 'pulse 1s infinite'
            }}>
              ⏰ KOHA PËR MEDIKAMENT!
            </h2>
            {(() => {
              // Find all medications at the same time as the active one
              const now = new Date();
              const sameTimeMeds = medications.filter(med => 
                med.time === activeMed.time && 
                shouldShowMedicationToday(med, now)
              );
              
              if (sameTimeMeds.length > 1) {
                return (
                  <MedicationGroupCard
                    medications={sameTimeMeds}
                    isActive={true}
                    takenMeds={takenMeds}
                    onConfirm={handleConfirm}
                    onSnooze={handleSnooze}
                  />
                );
              } else {
                return (
                  <MedicationCard
                    medication={activeMed}
                    isActive={true}
                    isTaken={false}
                    onConfirm={() => handleConfirm(activeMed.id)}
                    onSnooze={handleSnooze}
                  />
                );
              }
            })()}
          </div>
        )}

        {/* Past medications (missed time but not taken) */}
        {!activeMed && pastMeds.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <h2 style={{ 
              marginBottom: '1rem',
              color: '#FF9800',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              ⏰ Medikamente të kaluara (merri tani!)
            </h2>
            <div style={{
              background: '#FFF3E0',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '1rem',
              fontSize: '1.1rem',
              borderLeft: '4px solid #FF9800'
            }}>
              ⚠️ Këto medikamente duhet të ishin marrë më herët. Merri tani nëse nuk i ke marrë!
            </div>
            {pastMeds.map(group => {
              if (group.medications.length > 1) {
                return (
                  <MedicationGroupCard
                    key={group.time}
                    medications={group.medications}
                    isActive={false}
                    takenMeds={takenMeds}
                    onConfirm={handleConfirm}
                  />
                );
              } else {
                const med = group.medications[0];
                return (
                  <MedicationCard
                    key={med.id}
                    medication={med}
                    isActive={false}
                    isTaken={takenMeds.has(med.id)}
                    onConfirm={() => handleConfirm(med.id)}
                  />
                );
              }
            })}
          </div>
        )}

        {/* Today's remaining medications */}
        {!activeMed && todayMeds.length > 0 && pastMeds.length === 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>📅 Medikamentet e sotme</h2>
            {todayMeds.map(group => {
              if (group.medications.length > 1) {
                return (
                  <MedicationGroupCard
                    key={group.time}
                    medications={group.medications}
                    isActive={false}
                    takenMeds={takenMeds}
                    onConfirm={handleConfirm}
                  />
                );
              } else {
                const med = group.medications[0];
                return (
                  <MedicationCard
                    key={med.id}
                    medication={med}
                    isActive={false}
                    isTaken={takenMeds.has(med.id)}
                    onConfirm={() => handleConfirm(med.id)}
                  />
                );
              }
            })}
          </div>
        )}

        {/* All done message */}
        {!activeMed && todayMeds.length === 0 && completion === 100 && (
          <div className="card" style={{ 
            marginTop: '1.5rem',
            background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
            color: 'white',
            textAlign: 'center',
            padding: '3rem'
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ fontSize: '2.5rem', color: 'white' }}>
              Urime!
            </h2>
            <p style={{ fontSize: '1.75rem', marginTop: '1rem', color: 'white' }}>
              I more të gjitha medikamentet e sotme!
            </p>
          </div>
        )}

        {/* No more medications today */}
        {!activeMed && todayMeds.length === 0 && completion < 100 && (
          <div className="card" style={{ 
            marginTop: '1.5rem',
            background: '#FFF3E0',
            textAlign: 'center',
            padding: '2rem'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏰</div>
            <h2>Të gjitha medikamentet për sot janë marrë!</h2>
            <p style={{ fontSize: '1.25rem', marginTop: '1rem', color: '#666' }}>
              Shiko "📊 Historia" për detaje
            </p>
          </div>
        )}

        {/* Taken medications today - collapsible */}
        {todaysTakenCount > 0 && (
          <details className="card" style={{ marginTop: '1.5rem', background: '#E8F5E9' }}>
            <summary style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '0.5rem',
              color: '#388E3C',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              ✅ Të marra sot ({todaysTakenCount}) - Klik për të parë
            </summary>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {medications
                .filter(med => shouldShowMedicationToday(med, now) && takenMeds.has(med.id))
                .map(med => (
                  <div
                    key={med.id}
                    style={{
                      background: '#F1F8F4',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      borderLeft: `4px solid ${med.color}`,
                      opacity: 0.7,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{med.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                        {med.name} ✅
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>
                        {med.dose} • {med.time}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </details>
        )}

        {/* Emergency button */}
        <button 
          className="emergency-button"
          onClick={() => {
            if (confirm('A dëshiron të telefonosh shërbimet emergjente?')) {
              window.location.href = 'tel:112';
            }
          }}
          style={{ marginTop: '2rem' }}
        >
          🚨 THIRRJE EMERGJENTE 112
        </button>
      </div>
    </div>
  );
}

