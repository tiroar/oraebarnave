import { useState, useEffect } from 'react';
import { Medication } from '../data/medications';
import { logMedication } from '../db/database';

interface Props {
  medications: Medication[];
  isActive: boolean;
  takenMeds: Set<string>;
  onConfirm: (medId: string) => void;
  onSnooze?: () => void;
}

export function MedicationGroupCard({ medications, isActive, takenMeds, onConfirm, onSnooze }: Props) {
  const [timer, setTimer] = useState<number | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [timerMed, setTimerMed] = useState<Medication | null>(null);

  // Get the time from the first medication (they all have the same time)
  const time = medications[0]?.time;
  const timing = medications[0]?.timing;

  // Check if all medications in this group have been taken
  const allTaken = medications.every(med => takenMeds.has(med.id));
  const someTaken = medications.some(med => takenMeds.has(med.id));

  useEffect(() => {
    if (showTimer && timerMed?.specialTimer) {
      setTimer(timerMed.specialTimer);
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            playSound('complete');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showTimer, timerMed]);

  const handleConfirm = async (med: Medication) => {
    try {
      await logMedication(
        med.id,
        med.name,
        med.time,
        'taken'
      );
      
      playSound('success');
      
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }

      // Show timer if this medication needs it
      if (med.specialTimer) {
        setShowTimer(true);
        setTimerMed(med);
      }

      onConfirm(med.id);
    } catch (error) {
      console.error('Error logging medication:', error);
    }
  };

  const handleConfirmAll = async () => {
    if (!confirm(`A jeni të sigurt që i keni marrë të gjitha ${medications.length} medikamentet?`)) {
      return;
    }

    for (const med of medications) {
      if (!takenMeds.has(med.id)) {
        await handleConfirm(med);
      }
    }
  };

  const handleSnooze = async () => {
    try {
      // Snooze all medications in this group
      for (const med of medications) {
        if (!takenMeds.has(med.id)) {
          await logMedication(
            med.id,
            med.name,
            med.time,
            'snoozed'
          );
        }
      }
      
      if (onSnooze) {
        onSnooze();
      }
    } catch (error) {
      console.error('Error snoozing medications:', error);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const cardClassName = `card med-card ${isActive ? 'card-urgent' : ''} ${allTaken ? 'status-taken' : ''}`;

  return (
    <div 
      className={cardClassName}
      style={{ 
        borderLeft: `6px solid ${medications[0]?.color || '#2196F3'}`,
        marginBottom: '1rem'
      }}
    >
      {/* Header with time */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '1rem',
        paddingBottom: '0.75rem',
        borderBottom: '2px solid #E0E0E0'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: medications[0]?.color || '#2196F3' }}>
            ⏰ {time} - {timing}
          </div>
          <div style={{ fontSize: '1rem', color: '#666', marginTop: '0.25rem' }}>
            {medications.length} medikamente
          </div>
        </div>
        {allTaken && (
          <div style={{ 
            background: '#4CAF50',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '1.25rem',
            fontWeight: 700
          }}>
            ✅ MARRË
          </div>
        )}
      </div>

      {/* Medications list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {medications.map((med) => {
          const isTaken = takenMeds.has(med.id);
          
          return (
            <div
              key={med.id}
              style={{
                background: isTaken ? '#E8F5E9' : '#F5F5F5',
                padding: '0.75rem',
                borderRadius: '8px',
                borderLeft: `4px solid ${med.color}`,
                opacity: isTaken ? 0.7 : 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>
                  {med.icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.25rem'
                  }}>
                    {med.name}
                    {isTaken && <span style={{ fontSize: '1rem' }}>✅</span>}
                  </div>
                  <div style={{ fontSize: '0.95rem', color: '#666', marginBottom: '0.5rem' }}>
                    📦 {med.dose}
                  </div>
                  
                  {/* Instructions - collapsed by default, expandable */}
                  <details style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    <summary style={{ cursor: 'pointer', color: '#2196F3', fontWeight: 600 }}>
                      📋 Udhëzime
                    </summary>
                    <div style={{ 
                      marginTop: '0.5rem', 
                      padding: '0.5rem',
                      background: 'white',
                      borderRadius: '6px',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap'
                    }}>
                      {med.instructions}
                    </div>
                  </details>

                  {med.warning && (
                    <div style={{
                      background: '#FFEBEE',
                      color: '#C62828',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      marginTop: '0.5rem',
                      fontWeight: 600,
                      lineHeight: 1.4
                    }}>
                      {med.warning}
                    </div>
                  )}

                  {/* Individual confirm button if not taken */}
                  {!isTaken && !allTaken && (
                    <button
                      onClick={() => handleConfirm(med)}
                      style={{
                        width: '100%',
                        marginTop: '0.5rem',
                        padding: '0.75rem',
                        background: med.color,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      ✅ E mora {med.name}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Timer display */}
      {showTimer && timer !== null && timer > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <div className="timer-display">
            ⏱️ {formatTimer(timer)}
          </div>
          <div style={{ 
            fontSize: '1.1rem', 
            textAlign: 'center', 
            marginTop: '0.5rem',
            fontWeight: 600,
            color: '#F57C00'
          }}>
            Qëndro në këmbë për {timerMed?.name}!
          </div>
        </div>
      )}

      {showTimer && timer === 0 && (
        <div style={{ 
          background: '#4CAF50', 
          color: 'white', 
          padding: '1.5rem', 
          borderRadius: '12px',
          fontSize: '1.5rem',
          fontWeight: 700,
          textAlign: 'center',
          marginTop: '1rem'
        }}>
          ✅ GATI! Tani mund të ulesh ose të shtrihesh.
        </div>
      )}

      {/* Action buttons */}
      {!allTaken && (
        <div style={{ marginTop: '1rem' }}>
          {someTaken ? (
            <div style={{
              background: '#FFF3E0',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '1rem',
              color: '#F57C00',
              marginBottom: '0.5rem',
              textAlign: 'center',
              fontWeight: 600
            }}>
              ⚠️ Disa medikamente ende nuk janë marrë!
            </div>
          ) : (
            <button 
              className="btn-primary" 
              onClick={handleConfirmAll}
              style={{ 
                fontSize: '1.5rem', 
                padding: '1.5rem',
                width: '100%'
              }}
            >
              ✅ I MORA TË GJITHA ({medications.length})
            </button>
          )}
          
          {isActive && onSnooze && !someTaken && (
            <button 
              className="btn-outline" 
              onClick={handleSnooze}
              style={{ 
                fontSize: '1.25rem',
                marginTop: '0.75rem',
                width: '100%'
              }}
            >
              ⏰ Kujtomë pas 10 minutash
            </button>
          )}
        </div>
      )}

      {/* Undo button if all taken */}
      {allTaken && (
        <button
          className="btn-primary"
          onClick={async () => {
            if (confirm('A jeni të sigurt që doni ta anulloni konfirmimin për të gjitha medikamentet?')) {
              const { undoMedicationLog } = await import('../db/database');
              const today = new Date().toISOString().split('T')[0];
              for (const med of medications) {
                await undoMedicationLog(med.id, today);
              }
              window.location.reload();
            }
          }}
          style={{ 
            marginTop: '1rem',
            fontSize: '1.25rem',
            background: '#FF9800',
            padding: '1.25rem',
            fontWeight: 700,
            width: '100%'
          }}
        >
          ↩️ ANULLOJ (Nëse gabim)
        </button>
      )}
    </div>
  );
}

function playSound(type: 'success' | 'complete') {
  const audio = new Audio();
  
  if (type === 'success') {
    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8=';
  } else {
    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8=';
  }
  
  audio.play().catch(err => console.log('Could not play sound:', err));
}

