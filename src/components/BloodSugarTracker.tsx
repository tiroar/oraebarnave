import { useState, useEffect } from 'react';
import { db } from '../db/database';
import { format } from 'date-fns';

interface BloodSugarLog {
  id?: number;
  value: number;
  time: string;
  date: string;
  notes?: string;
}

export function BloodSugarTracker() {
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [todayLogs, setTodayLogs] = useState<BloodSugarLog[]>([]);

  useEffect(() => {
    loadTodayLogs();
  }, []);

  const loadTodayLogs = async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const logs = await db.bloodSugar.where('date').equals(today).toArray();
      setTodayLogs(logs);
    } catch (error) {
      console.error('Error loading blood sugar logs:', error);
    }
  };

  const handleSubmit = async () => {
    if (!value || parseFloat(value) <= 0) {
      alert('Vendos një vlerë të vlefshme për sheqerin në gjak!');
      return;
    }

    const now = new Date();
    const log: BloodSugarLog = {
      value: parseFloat(value),
      time: format(now, 'HH:mm'),
      date: now.toISOString().split('T')[0],
      notes: notes.trim() || undefined
    };

    try {
      await db.bloodSugar.add(log);
      setValue('');
      setNotes('');
      loadTodayLogs();
      
      // Vibrate for feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(200);
      }
    } catch (error) {
      console.error('Error saving blood sugar:', error);
    }
  };

  const deleteLog = async (id: number) => {
    if (confirm('Fshij këtë matje?')) {
      await db.bloodSugar.delete(id);
      loadTodayLogs();
    }
  };

  const getStatusColor = (value: number) => {
    if (value < 4.0) return '#F44336'; // Too low
    if (value < 7.0) return '#4CAF50'; // Good
    if (value < 10.0) return '#FF9800'; // Acceptable
    return '#F44336'; // Too high
  };

  const getStatusText = (value: number) => {
    if (value < 4.0) return '⚠️ Shumë i ulët!';
    if (value < 7.0) return '✅ Mirë';
    if (value < 10.0) return '⚠️ Pak i lartë';
    return '🚨 Shumë i lartë!';
  };

  return (
    <div>
      <div className="card" style={{ background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)' }}>
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🩸 Sheqeri në Gjak
        </h2>

        {/* Input Form */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '1.5rem', 
            fontWeight: 600, 
            marginBottom: '0.5rem' 
          }}>
            Vlera (mmol/L):
          </label>
          <input
            type="number"
            step="0.1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="5.5"
            style={{
              width: '100%',
              fontSize: '2rem',
              padding: '1rem',
              borderRadius: '12px',
              border: '3px solid #2196F3',
              textAlign: 'center',
              fontWeight: 700
            }}
          />

          <label style={{ 
            display: 'block', 
            fontSize: '1.25rem', 
            fontWeight: 600, 
            marginTop: '1rem',
            marginBottom: '0.5rem' 
          }}>
            Shënime (opsionale):
          </label>
          <select
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{
              width: '100%',
              fontSize: '1.5rem',
              padding: '1rem',
              borderRadius: '12px',
              border: '3px solid #2196F3'
            }}
          >
            <option value="">Zgjedh...</option>
            <option value="Para mëngjesit">Para mëngjesit</option>
            <option value="Pas mëngjesit">Pas mëngjesit</option>
            <option value="Para drekës">Para drekës</option>
            <option value="Pas drekës">Pas drekës</option>
            <option value="Para darkës">Para darkës</option>
            <option value="Pas darkës">Pas darkës</option>
            <option value="Para gjumit">Para gjumit</option>
          </select>

          <button
            className="btn-primary"
            onClick={handleSubmit}
            style={{ marginTop: '1rem' }}
          >
            ✅ Ruaj Matjen
          </button>
        </div>

        {/* Today's Logs */}
        {todayLogs.length > 0 && (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>📊 Matjet e sotme:</h3>
            {todayLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '12px',
                  marginBottom: '0.75rem',
                  borderLeft: `6px solid ${getStatusColor(log.value)}`
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '2rem', fontWeight: 700, color: getStatusColor(log.value) }}>
                    {log.value} mmol/L
                  </span>
                  <span style={{ fontSize: '1.25rem', color: '#666' }}>
                    ⏰ {log.time}
                  </span>
                </div>
                <div style={{ fontSize: '1.25rem', color: getStatusColor(log.value), fontWeight: 600 }}>
                  {getStatusText(log.value)}
                </div>
                {log.notes && (
                  <div style={{ fontSize: '1.1rem', color: '#666', marginTop: '0.5rem' }}>
                    📝 {log.notes}
                  </div>
                )}
                <button
                  onClick={() => deleteLog(log.id!)}
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: '#F44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Fshij
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Reference Guide */}
        <div style={{ 
          background: '#FFF3E0', 
          padding: '1rem', 
          borderRadius: '12px',
          marginTop: '1rem',
          fontSize: '1.1rem',
          lineHeight: 1.6
        }}>
          <strong>📖 Vlera normale:</strong><br/>
          • Para vakteve: 4.0 - 7.0 mmol/L<br/>
          • Pas vakteve: 5.0 - 10.0 mmol/L<br/>
          • <span style={{ color: '#F44336', fontWeight: 700 }}>Nën 4.0: HIPOGLICEMI - merr sheqer menjëherë!</span>
        </div>

        {/* Export Reports */}
        <div className="card" style={{ marginTop: '1.5rem', background: '#E8F5E9' }}>
          <h3 style={{ marginBottom: '1rem' }}>📊 Raportet për Mjekun</h3>
          
          <button
            className="btn-info"
            onClick={async () => {
              const allLogs = await db.bloodSugar.toArray();
              
              if (allLogs.length === 0) {
                alert('Nuk ka të dhëna për të eksportuar!');
                return;
              }

              const sortedLogs = allLogs.sort((a, b) => 
                new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime()
              );

              const csv = [
                'Data,Ora,Vlera (mmol/L),Shënime,Statusi',
                ...sortedLogs.map(log => {
                  const status = log.value < 4.0 ? 'Shumë i ulët' : 
                                 log.value < 7.0 ? 'Normal' : 
                                 log.value < 10.0 ? 'Pak i lartë' : 'Shumë i lartë';
                  return `${log.date},${log.time},${log.value},"${log.notes || '-'}",${status}`;
                })
              ].join('\n');

              const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `sheqeri-ne-gjak-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            style={{ marginBottom: '0.75rem' }}
          >
            📥 Shkarko Raportin e Plotë (CSV)
          </button>

          <button
            className="btn-primary"
            onClick={async () => {
              const threeMonthsAgo = new Date();
              threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
              const startDate = threeMonthsAgo.toISOString().split('T')[0];

              const logs = await db.bloodSugar
                .where('date')
                .aboveOrEqual(startDate)
                .toArray();

              if (logs.length === 0) {
                alert('Nuk ka të dhëna për 3 muajt e fundit!');
                return;
              }

              const sortedLogs = logs.sort((a, b) => 
                new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime()
              );

              // Calculate statistics
              const avg = (sortedLogs.reduce((sum, l) => sum + l.value, 0) / sortedLogs.length).toFixed(1);
              const low = sortedLogs.filter(l => l.value < 4.0).length;
              const normal = sortedLogs.filter(l => l.value >= 4.0 && l.value < 7.0).length;
              const acceptable = sortedLogs.filter(l => l.value >= 7.0 && l.value < 10.0).length;
              const high = sortedLogs.filter(l => l.value >= 10.0).length;

              const csv = [
                'RAPORTI I SHEQERIT NË GJAK - 3 MUAJT E FUNDIT',
                `Data e eksportimit: ${new Date().toLocaleDateString('sq-AL')}`,
                `Periudha: ${startDate} deri ${new Date().toISOString().split('T')[0]}`,
                `Numri i matjeve: ${sortedLogs.length}`,
                `Mesatarja: ${avg} mmol/L`,
                '',
                'STATISTIKA:',
                `Shumë të ulëta (< 4.0): ${low} (${((low/sortedLogs.length)*100).toFixed(1)}%)`,
                `Normale (4.0-7.0): ${normal} (${((normal/sortedLogs.length)*100).toFixed(1)}%)`,
                `Pak të larta (7.0-10.0): ${acceptable} (${((acceptable/sortedLogs.length)*100).toFixed(1)}%)`,
                `Shumë të larta (> 10.0): ${high} (${((high/sortedLogs.length)*100).toFixed(1)}%)`,
                '',
                'Data,Ora,Vlera (mmol/L),Shënime,Statusi',
                ...sortedLogs.map(log => {
                  const status = log.value < 4.0 ? 'Shumë i ulët' : 
                                 log.value < 7.0 ? 'Normal' : 
                                 log.value < 10.0 ? 'Pak i lartë' : 'Shumë i lartë';
                  return `${log.date},${log.time},${log.value},"${log.notes || '-'}",${status}`;
                })
              ].join('\n');

              const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `raport-3-muaj-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            📋 Raport 3 Muaj për Mjekun
          </button>

          <div style={{ 
            fontSize: '1rem', 
            color: '#666', 
            marginTop: '1rem',
            lineHeight: 1.6
          }}>
            💡 Këto raporte mund të hapen në Excel dhe t'i jepen mjekut në vizitë.
          </div>
        </div>
      </div>
    </div>
  );
}

