import { useState, useEffect } from 'react';
import { Medication } from '../data/medications';
import { logMedication } from '../db/database';

interface Props {
  medication: Medication;
  isActive: boolean;
  isTaken: boolean;
  onConfirm: () => void;
  onSnooze?: () => void;
}

export function MedicationCard({ medication, isActive, isTaken, onConfirm, onSnooze }: Props) {
  const [timer, setTimer] = useState<number | null>(null);
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => {
    if (showTimer && medication.specialTimer) {
      setTimer(medication.specialTimer);
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            // Play sound when timer ends
            playSound('complete');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showTimer, medication.specialTimer]);

  const handleConfirm = async () => {
    try {
      await logMedication(
        medication.id,
        medication.name,
        medication.time,
        'taken'
      );
      
      // Play success sound
      playSound('success');
      
      // Vibrate for feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }

      // Show timer if needed
      if (medication.specialTimer) {
        setShowTimer(true);
      }

      onConfirm();
    } catch (error) {
      console.error('Error logging medication:', error);
    }
  };

  const handleSnooze = async () => {
    try {
      await logMedication(
        medication.id,
        medication.name,
        medication.time,
        'snoozed'
      );
      
      if (onSnooze) {
        onSnooze();
      }
    } catch (error) {
      console.error('Error snoozing medication:', error);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const cardClassName = `card med-card ${isActive ? 'card-urgent' : ''} ${isTaken ? 'status-taken' : ''}`;

  return (
    <div 
      className={cardClassName}
      style={{ borderLeftColor: medication.color }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <span className="med-icon">{medication.icon}</span>
        <div style={{ flex: 1 }}>
          <div className="med-name">{medication.name}</div>
          <div className="med-dose">{medication.dose}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: medication.color }}>
            ⏰ {medication.time} - {medication.timing}
          </div>
        </div>
      </div>

      <div className="med-instructions">
        📋 {medication.instructions}
      </div>

      {medication.warning && (
        <div className="med-warning">
          {medication.warning}
        </div>
      )}

      {isTaken && !showTimer && (
        <div>
          <div style={{ 
            background: '#4CAF50', 
            color: 'white', 
            padding: '1.5rem', 
            borderRadius: '12px',
            fontSize: '1.75rem',
            fontWeight: 700,
            textAlign: 'center',
            marginTop: '1rem'
          }}>
            ✅ E MARRË!
          </div>
          <button
            className="btn-primary"
            onClick={async () => {
              if (confirm('A jeni të sigurt që doni ta anulloni këtë konfirmim?')) {
                const { undoMedicationLog } = await import('../db/database');
                const today = new Date().toISOString().split('T')[0];
                await undoMedicationLog(medication.id, today);
                window.location.reload();
              }
            }}
            style={{ 
              marginTop: '1rem', 
              fontSize: '1.5rem',
              background: '#FF9800',
              padding: '1.5rem',
              fontWeight: 700
            }}
          >
            ↩️ ANULLOJ (Nëse gabim)
          </button>
        </div>
      )}

      {showTimer && timer !== null && timer > 0 && (
        <div>
          <div className="timer-display">
            ⏱️ {formatTimer(timer)}
          </div>
          <div style={{ 
            fontSize: '1.25rem', 
            textAlign: 'center', 
            marginTop: '0.5rem',
            fontWeight: 600,
            color: '#F57C00'
          }}>
            Qëndro në këmbë!
          </div>
        </div>
      )}

      {showTimer && timer === 0 && (
        <div style={{ 
          background: '#4CAF50', 
          color: 'white', 
          padding: '2rem', 
          borderRadius: '12px',
          fontSize: '1.75rem',
          fontWeight: 700,
          textAlign: 'center',
          marginTop: '1rem'
        }}>
          ✅ GATI! Tani mund të ulesh ose të shtrihesh.
        </div>
      )}

      {!isTaken && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <button 
            className="btn-primary" 
            onClick={handleConfirm}
            style={{ fontSize: '2rem', padding: '2rem' }}
          >
            ✅ E MORA
          </button>
          
          {isActive && onSnooze && (
            <button 
              className="btn-outline" 
              onClick={handleSnooze}
              style={{ fontSize: '1.5rem' }}
            >
              ⏰ Kujtomë pas 10 minutash
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Simple sound function
function playSound(type: 'success' | 'complete') {
  const audio = new Audio();
  
  if (type === 'success') {
    // Success sound (higher pitch)
    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8=';
  } else {
    // Complete sound (lower pitch)
    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8LTq7l8aFcGAgYcLzs6ZxQDgtDr+PxrmgcBDCF0fPUgjQHGm+97+OZUQ8=';
  }
  
  audio.play().catch(err => console.log('Could not play sound:', err));
}

