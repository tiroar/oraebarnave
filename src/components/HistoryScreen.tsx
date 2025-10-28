import { useState, useEffect } from 'react';
import { db, MedicationLog } from '../db/database';
import { subDays, startOfDay } from 'date-fns';
import { formatDateAlbanian } from '../utils/dateHelpers';

export function HistoryScreen() {
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [days, setDays] = useState(7);
  const [stats, setStats] = useState({ taken: 0, missed: 0, total: 0, compliance: 0 });

  useEffect(() => {
    loadHistory();
  }, [days]);

  const loadHistory = async () => {
    const startDate = startOfDay(subDays(new Date(), days));
    const startDateStr = startDate.toISOString().split('T')[0];

    const allLogs = await db.logs
      .where('date')
      .aboveOrEqual(startDateStr)
      .toArray();

    setLogs(allLogs.reverse());

    const taken = allLogs.filter(l => l.status === 'taken').length;
    const missed = allLogs.filter(l => l.status === 'missed').length;
    const total = allLogs.length;
    const compliance = total > 0 ? Math.round((taken / total) * 100) : 100;

    setStats({ taken, missed, total, compliance });
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'taken': return '✅';
      case 'missed': return '❌';
      case 'snoozed': return '⏰';
      default: return '⏳';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'taken': return 'E marrë';
      case 'missed': return 'E humbur';
      case 'snoozed': return 'Shty';
      default: return 'Në pritje';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'taken': return '#4CAF50';
      case 'missed': return '#F44336';
      case 'snoozed': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const groupByDate = () => {
    const grouped: { [date: string]: MedicationLog[] } = {};
    logs.forEach(log => {
      if (!grouped[log.date]) {
        grouped[log.date] = [];
      }
      grouped[log.date].push(log);
    });
    return grouped;
  };

  const groupedLogs = groupByDate();

  return (
    <div>
      <div className="header">
        <h1 style={{ textAlign: 'center', fontSize: '2rem', color: 'white' }}>
          📊 Historia
        </h1>
      </div>

      <div className="container" style={{ paddingBottom: '120px' }}>
        {/* Stats summary */}
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            {days} ditët e fundit
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="stat-card">
              <div className="stat-number" style={{ color: '#4CAF50' }}>
                {stats.taken}
              </div>
              <div className="stat-label">✅ Të marra</div>
            </div>

            <div className="stat-card">
              <div className="stat-number" style={{ color: '#F44336' }}>
                {stats.missed}
              </div>
              <div className="stat-label">❌ Të humba</div>
            </div>
          </div>

          <div className="compliance-bar" style={{ marginTop: '1.5rem' }}>
            <div 
              className="compliance-fill" 
              style={{ width: `${stats.compliance}%` }}
            >
              {stats.compliance}%
            </div>
          </div>

          <div style={{ 
            textAlign: 'center', 
            fontSize: '1.5rem', 
            marginTop: '1rem',
            fontWeight: 600,
            color: stats.compliance >= 90 ? '#4CAF50' : stats.compliance >= 70 ? '#FF9800' : '#F44336'
          }}>
            {stats.compliance >= 90 && '🎉 Shkëlqyer!'}
            {stats.compliance >= 70 && stats.compliance < 90 && '👍 Mirë!'}
            {stats.compliance < 70 && '⚠️ Përpiquni më shumë!'}
          </div>
        </div>

        {/* Time filter */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginTop: '1.5rem',
          flexWrap: 'wrap'
        }}>
          {[7, 14, 30].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={days === d ? 'btn-primary' : 'btn-outline'}
              style={{ 
                flex: 1, 
                minHeight: '60px',
                fontSize: '1.25rem'
              }}
            >
              {d} ditë
            </button>
          ))}
        </div>

        {/* Logs by date */}
        {Object.keys(groupedLogs).length === 0 ? (
          <div className="empty-state" style={{ marginTop: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
            <p>Nuk ka të dhëna akoma</p>
          </div>
        ) : (
          Object.keys(groupedLogs).map(date => (
            <div key={date} style={{ marginTop: '1.5rem' }}>
              <h3 style={{ 
                marginBottom: '1rem',
                padding: '0.75rem',
                background: '#E3F2FD',
                borderRadius: '12px',
                fontSize: '1.25rem'
              }}>
                📅 {formatDateAlbanian(new Date(date))}
              </h3>

              {groupedLogs[date].map(log => (
                <div 
                  key={log.id}
                  className="card"
                  style={{ 
                    borderLeft: `6px solid ${getStatusColor(log.status)}`,
                    marginBottom: '1rem',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '2rem', flexShrink: 0 }}>
                      {getStatusEmoji(log.status)}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: 600,
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                      }}>
                        {log.medicationName}
                      </div>
                      <div style={{ fontSize: '1.1rem', color: '#666', marginTop: '0.25rem' }}>
                        ⏰ {log.scheduledTime}
                      </div>
                      {log.takenTime && (
                        <div style={{ fontSize: '1rem', color: '#666', marginTop: '0.25rem' }}>
                          ✅ Marrë në: {new Date(log.takenTime).toLocaleTimeString('sq-AL')}
                        </div>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: getStatusColor(log.status),
                      padding: '0.5rem 0.75rem',
                      background: `${getStatusColor(log.status)}20`,
                      borderRadius: '8px',
                      flexShrink: 0,
                      whiteSpace: 'nowrap'
                    }}>
                      {getStatusText(log.status)}
                    </div>
                  </div>
                  
                  {/* Undo button for taken medications */}
                  {log.status === 'taken' && (
                    <button
                      className="btn-primary"
                      onClick={async () => {
                        if (confirm('A jeni të sigurt që doni ta anulloni këtë konfirmim?\n\nBarna do të shfaqet si e pa-marrë.')) {
                          try {
                            if (log.id) {
                              await db.logs.delete(log.id);
                              // Refresh the logs
                              const newLogs = await db.logs
                                .where('date')
                                .aboveOrEqual(startOfDay(subDays(new Date(), days)).toISOString().split('T')[0])
                                .reverse()
                                .sortBy('date');
                              setLogs(newLogs);
                            }
                          } catch (error) {
                            console.error('Error undoing medication:', error);
                            alert('Gabim: Nuk mund ta anulloj.');
                          }
                        }
                      }}
                      style={{
                        marginTop: '1rem',
                        fontSize: '1.25rem',
                        background: '#FF9800',
                        padding: '1rem',
                        fontWeight: 700,
                        width: '100%'
                      }}
                    >
                      ↩️ ANULLOJ (Nëse gabim)
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))
        )}

        {/* Export button */}
        <button
          className="btn-info"
          onClick={async () => {
            const data = logs.map(log => ({
              Date: log.date,
              Medication: log.medicationName,
              'Scheduled Time': log.scheduledTime,
              'Taken Time': log.takenTime ? new Date(log.takenTime).toLocaleTimeString('sq-AL') : '-',
              Status: getStatusText(log.status)
            }));

            const csv = [
              Object.keys(data[0]).join(','),
              ...data.map(row => Object.values(row).join(','))
            ].join('\n');

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `medication-history-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
          }}
          style={{ marginTop: '1.5rem' }}
        >
          📥 Shkarko Raportin (CSV)
        </button>
      </div>
    </div>
  );
}

