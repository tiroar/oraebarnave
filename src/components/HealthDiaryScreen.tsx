import { useState, useEffect } from 'react';
import { db, HealthDiary } from '../db/database';
import { formatDateAlbanian } from '../utils/dateHelpers';

export function HealthDiaryScreen() {
  const [diaryEntries, setDiaryEntries] = useState<HealthDiary[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [todayEntry, setTodayEntry] = useState<HealthDiary | null>(null);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const entries = await db.healthDiary.orderBy('date').reverse().toArray();
    setDiaryEntries(entries);

    // Check if there's an entry for today
    const today = new Date().toISOString().split('T')[0];
    const entry = entries.find(e => e.date === today);
    setTodayEntry(entry || null);
  };

  return (
    <div>
      <div className="header">
        <h1 style={{ textAlign: 'center', fontSize: '2rem', color: 'white' }}>
          📖 Ditari i Shëndetit
        </h1>
      </div>

      <div className="container" style={{ paddingBottom: '120px' }}>
        {/* Today's entry prompt */}
        {!todayEntry ? (
          <div className="card" style={{ 
            marginTop: '1.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>
              📝
            </div>
            <h2 style={{ fontSize: '1.75rem', textAlign: 'center', marginBottom: '1rem' }}>
              Si ndiheni sot?
            </h2>
            <p style={{ fontSize: '1.1rem', textAlign: 'center', marginBottom: '1.5rem', opacity: 0.9 }}>
              Regjistroni se si e keni kaluar ditën e sotme
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary"
              style={{ 
                width: '100%', 
                fontSize: '1.5rem', 
                padding: '1.5rem',
                background: 'white',
                color: '#667eea'
              }}
            >
              ➕ Shto Shënim për Sot
            </button>
          </div>
        ) : (
          <div className="card" style={{ 
            marginTop: '1.5rem',
            background: '#E8F5E9',
            borderLeft: '6px solid #4CAF50'
          }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
              ✅ Regjistruar për sot
            </h3>
            <TodayEntrySummary entry={todayEntry} />
            <button
              onClick={() => todayEntry.id && db.healthDiary.delete(todayEntry.id).then(loadEntries)}
              className="btn-outline"
              style={{ marginTop: '1rem', fontSize: '1.1rem', padding: '0.75rem' }}
            >
              ✏️ Rivendos Shënimin
            </button>
          </div>
        )}

        {/* Statistics */}
        {diaryEntries.length > 0 && (
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
              📊 Statistika
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '1rem'
            }}>
              <div style={{ textAlign: 'center', padding: '1rem', background: '#E3F2FD', borderRadius: '8px' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#2196F3' }}>
                  {diaryEntries.length}
                </div>
                <div style={{ fontSize: '1rem', color: '#666' }}>
                  Ditë të regjistruara
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: '#FFF3E0', borderRadius: '8px' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#FF9800' }}>
                  {Math.round(diaryEntries.reduce((sum, e) => sum + e.energyLevel, 0) / diaryEntries.length)}
                </div>
                <div style={{ fontSize: '1rem', color: '#666' }}>
                  Energji mesatare
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Past entries */}
        {diaryEntries.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>
              📜 Shënimet e Kaluara
            </h2>

            {diaryEntries.map(entry => (
              <div
                key={entry.id}
                className="card"
                style={{
                  marginBottom: '1rem',
                  borderLeft: `6px solid ${getMoodColor(entry.mood)}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                    {formatDateAlbanian(new Date(entry.date))}
                  </div>
                  <div style={{ fontSize: '2rem' }}>
                    {getMoodEmoji(entry.mood)}
                  </div>
                </div>

                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ 
                    background: '#FFF3E0',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>Dhimbje</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F57C00' }}>
                      {entry.painLevel}/10
                    </div>
                  </div>
                  <div style={{ 
                    background: '#E8F5E9',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>Energji</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4CAF50' }}>
                      {entry.energyLevel}/10
                    </div>
                  </div>
                </div>

                {entry.symptoms && (
                  <div style={{ 
                    background: '#FFEBEE',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                    fontSize: '1.1rem'
                  }}>
                    <strong>🤒 Simptoma:</strong> {entry.symptoms}
                  </div>
                )}

                {entry.sideEffects && (
                  <div style={{ 
                    background: '#FFF3E0',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                    fontSize: '1.1rem'
                  }}>
                    <strong>⚠️ Efekte anësore:</strong> {entry.sideEffects}
                  </div>
                )}

                {entry.notes && (
                  <div style={{ 
                    background: '#E3F2FD',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '1.1rem'
                  }}>
                    <strong>📝 Shënime:</strong> {entry.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Form */}
        {showAddForm && (
          <DiaryForm
            onSave={async (entry) => {
              await db.healthDiary.add({
                ...entry,
                date: new Date().toISOString().split('T')[0]
              });
              await loadEntries();
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </div>
    </div>
  );
}

function TodayEntrySummary({ entry }: { entry: HealthDiary }) {
  return (
    <div style={{ fontSize: '1.1rem' }}>
      <div style={{ marginBottom: '0.75rem' }}>
        <strong>Gjendja:</strong> {getMoodEmoji(entry.mood)} {getMoodText(entry.mood)}
      </div>
      <div style={{ marginBottom: '0.75rem' }}>
        <strong>Dhimbje:</strong> {entry.painLevel}/10
      </div>
      <div style={{ marginBottom: '0.75rem' }}>
        <strong>Energji:</strong> {entry.energyLevel}/10
      </div>
      {entry.symptoms && (
        <div style={{ marginBottom: '0.75rem' }}>
          <strong>Simptoma:</strong> {entry.symptoms}
        </div>
      )}
    </div>
  );
}

interface DiaryFormProps {
  onSave: (entry: Omit<HealthDiary, 'id' | 'date'>) => void;
  onCancel: () => void;
}

function DiaryForm({ onSave, onCancel }: DiaryFormProps) {
  const [mood, setMood] = useState<HealthDiary['mood']>('okay');
  const [painLevel, setPainLevel] = useState(0);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [symptoms, setSymptoms] = useState('');
  const [sideEffects, setSideEffects] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onSave({
      mood,
      painLevel,
      energyLevel,
      symptoms,
      sideEffects,
      notes
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      zIndex: 1000,
      overflowY: 'auto',
      padding: '1rem'
    }}>
      <div className="card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          📝 Si ndiheni sot?
        </h2>

        {/* Mood selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '1.25rem', fontWeight: 600, display: 'block', marginBottom: '1rem', textAlign: 'center' }}>
            Si është gjendja juaj?
          </label>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
            {(['terrible', 'bad', 'okay', 'good', 'great'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMood(m)}
                style={{
                  flex: 1,
                  padding: '1rem',
                  fontSize: '3rem',
                  background: mood === m ? getMoodColor(m) : '#f5f5f5',
                  border: mood === m ? `3px solid ${getMoodColor(m)}` : '2px solid #ddd',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transform: mood === m ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.2s'
                }}
              >
                {getMoodEmoji(m)}
              </button>
            ))}
          </div>
        </div>

        {/* Pain level */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '1.25rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
            Niveli i dhimbjes: {painLevel}/10
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={painLevel}
            onChange={(e) => setPainLevel(Number(e.target.value))}
            style={{ width: '100%', height: '40px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666' }}>
            <span>0 - Pa dhimbje</span>
            <span>10 - Shumë keq</span>
          </div>
        </div>

        {/* Energy level */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '1.25rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
            Niveli i energjisë: {energyLevel}/10
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={energyLevel}
            onChange={(e) => setEnergyLevel(Number(e.target.value))}
            style={{ width: '100%', height: '40px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666' }}>
            <span>0 - Shumë i lodhur</span>
            <span>10 - Plot energji</span>
          </div>
        </div>

        {/* Symptoms */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '1.25rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
            Simptoma (opsionale):
          </label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="p.sh. Dhimbje koke, marrje, dridhje..."
            rows={3}
            style={{
              width: '100%',
              fontSize: '1.25rem',
              padding: '1rem',
              borderRadius: '8px',
              border: '2px solid #ddd',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Side effects */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '1.25rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
            Efekte anësore (opsionale):
          </label>
          <textarea
            value={sideEffects}
            onChange={(e) => setSideEffects(e.target.value)}
            placeholder="Efekte anësore nga barnat..."
            rows={3}
            style={{
              width: '100%',
              fontSize: '1.25rem',
              padding: '1rem',
              borderRadius: '8px',
              border: '2px solid #ddd',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Notes */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '1.25rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
            Shënime shtesë (opsionale):
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Çdo gjë tjetër që doni të shënoni..."
            rows={3}
            style={{
              width: '100%',
              fontSize: '1.25rem',
              padding: '1rem',
              borderRadius: '8px',
              border: '2px solid #ddd',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleSubmit}
            className="btn-primary"
            style={{ flex: 1, fontSize: '1.5rem', padding: '1.5rem' }}
          >
            ✅ Ruaj
          </button>
          <button
            onClick={onCancel}
            className="btn-outline"
            style={{ flex: 1, fontSize: '1.5rem', padding: '1.5rem' }}
          >
            ❌ Anulo
          </button>
        </div>
      </div>
    </div>
  );
}

function getMoodEmoji(mood: HealthDiary['mood']): string {
  const emojis = {
    terrible: '😞',
    bad: '😟',
    okay: '😐',
    good: '🙂',
    great: '😊'
  };
  return emojis[mood];
}

function getMoodText(mood: HealthDiary['mood']): string {
  const texts = {
    terrible: 'Shumë keq',
    bad: 'Keq',
    okay: 'Mirë',
    good: 'Shumë mirë',
    great: 'Shkëlqyeshëm'
  };
  return texts[mood];
}

function getMoodColor(mood: HealthDiary['mood']): string {
  const colors = {
    terrible: '#D32F2F',
    bad: '#F57C00',
    okay: '#FFC107',
    good: '#8BC34A',
    great: '#4CAF50'
  };
  return colors[mood];
}

