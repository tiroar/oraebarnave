import { useState, useEffect } from 'react';
import { exportAllData, importData } from '../utils/exportData';
import { getSettings, updateSettings, getCustomMedications, addCustomMedication, deleteCustomMedication, CustomMedication } from '../db/database';

type SettingsTab = 'medications' | 'refill' | 'notifications' | 'display' | 'backup';

export function SettingsScreen() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('medications');

  return (
    <div>
      <div className="header">
        <h1 style={{ textAlign: 'center', fontSize: '2rem', color: 'white' }}>
          ⚙️ Cilësimet
        </h1>
      </div>

      <div className="container" style={{ paddingBottom: '120px' }}>
        {/* Settings tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginTop: '1.5rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem'
        }}>
          <button
            className={activeTab === 'medications' ? 'btn-primary' : 'btn-outline'}
            onClick={() => setActiveTab('medications')}
            style={{ fontSize: '1rem', padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}
          >
            💊 Barna
          </button>
          <button
            className={activeTab === 'refill' ? 'btn-primary' : 'btn-outline'}
            onClick={() => setActiveTab('refill')}
            style={{ fontSize: '1rem', padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}
          >
            📦 Stoku
          </button>
          <button
            className={activeTab === 'notifications' ? 'btn-primary' : 'btn-outline'}
            onClick={() => setActiveTab('notifications')}
            style={{ fontSize: '1rem', padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}
          >
            🔔 Njoftimet
          </button>
          <button
            className={activeTab === 'display' ? 'btn-primary' : 'btn-outline'}
            onClick={() => setActiveTab('display')}
            style={{ fontSize: '1rem', padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}
          >
            🎨 Pamja
          </button>
          <button
            className={activeTab === 'backup' ? 'btn-primary' : 'btn-outline'}
            onClick={() => setActiveTab('backup')}
            style={{ fontSize: '1rem', padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}
          >
            💾 Backup
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'medications' && <MedicationsTab />}
        {activeTab === 'refill' && <RefillTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'display' && <DisplayTab />}
        {activeTab === 'backup' && <BackupTab />}
      </div>
    </div>
  );
}

// Medications Management Tab
function MedicationsTab() {
  const [customMeds, setCustomMeds] = useState<CustomMedication[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMed, setNewMed] = useState({
    name: '',
    dose: '',
    time: '08:00',
    timing: 'Pas mëngjesit',
    instructions: '',
    warning: '',
    color: '#2196F3',
    icon: '💊',
    frequency: 'daily' as 'daily' | 'monthly'
  });

  useEffect(() => {
    loadCustomMeds();
  }, []);

  const loadCustomMeds = async () => {
    const meds = await getCustomMedications();
    setCustomMeds(meds);
  };

  const handleAddMedication = async () => {
    if (!newMed.name || !newMed.dose || !newMed.time) {
      alert('Ju lutem plotësoni të paktën Emrin, Dozën dhe Orën!');
      return;
    }

    try {
      await addCustomMedication({
        ...newMed,
        isActive: true
      });
      
      alert('✅ Medikamenti u shtua me sukses!');
      setShowAddForm(false);
      setNewMed({
        name: '',
        dose: '',
        time: '08:00',
        timing: 'Pas mëngjesit',
        instructions: '',
        warning: '',
        color: '#2196F3',
        icon: '💊',
        frequency: 'daily'
      });
      loadCustomMeds();
      window.location.reload(); // Reload to update notifications
    } catch (error) {
      alert('❌ Gabim gjatë shtimit të medikamentit!');
    }
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    
    if (confirm('A jeni të sigurt që doni të fshini këtë medikament?')) {
      await deleteCustomMedication(id);
      loadCustomMeds();
      window.location.reload();
    }
  };

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div className="card" style={{ background: '#E3F2FD' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          💊 Menaxhimi i Barnave
        </h2>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '1rem' }}>
          Këtu mund të shtoni barna shtesë që ju ka këshilluar mjeku.
        </p>
        <button
          className="btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ width: '100%', fontSize: '1.25rem', padding: '1.25rem' }}
        >
          {showAddForm ? '❌ Anulloj' : '➕ Shto Barn të Ri'}
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginTop: '1rem', background: '#FFF3E0' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>➕ Shto Barn të Ri</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '1.1rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                Emri i Barnit *
              </label>
              <input
                type="text"
                value={newMed.name}
                onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                placeholder="p.sh. Aspirin"
                style={{
                  width: '100%',
                  fontSize: '1.1rem',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '2px solid #ddd'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '1.1rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                Doza *
              </label>
              <input
                type="text"
                value={newMed.dose}
                onChange={(e) => setNewMed({ ...newMed, dose: e.target.value })}
                placeholder="p.sh. 100mg (1 tabletë)"
                style={{
                  width: '100%',
                  fontSize: '1.1rem',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '2px solid #ddd'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '1.1rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                Ora (HH:mm) *
              </label>
              <input
                type="time"
                value={newMed.time}
                onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
                style={{
                  width: '100%',
                  fontSize: '1.1rem',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '2px solid #ddd'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '1.1rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                Kur merret
              </label>
              <select
                value={newMed.timing}
                onChange={(e) => setNewMed({ ...newMed, timing: e.target.value })}
                style={{
                  width: '100%',
                  fontSize: '1.1rem',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '2px solid #ddd'
                }}
              >
                <option>Para mëngjesit</option>
                <option>Pas mëngjesit</option>
                <option>Para drekës</option>
                <option>Pas drekës</option>
                <option>Para darkës</option>
                <option>Pas darkës</option>
                <option>Para gjumit</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '1.1rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                Udhëzime
              </label>
              <textarea
                value={newMed.instructions}
                onChange={(e) => setNewMed({ ...newMed, instructions: e.target.value })}
                placeholder="Si merret barn..."
                rows={3}
                style={{
                  width: '100%',
                  fontSize: '1.1rem',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '2px solid #ddd',
                  resize: 'vertical'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '1.1rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                Paralajmërim (opsionale)
              </label>
              <textarea
                value={newMed.warning}
                onChange={(e) => setNewMed({ ...newMed, warning: e.target.value })}
                placeholder="⚠️ Kujdes..."
                rows={2}
                style={{
                  width: '100%',
                  fontSize: '1.1rem',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '2px solid #ddd',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '1.1rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                  Ngjyra
                </label>
                <input
                  type="color"
                  value={newMed.color}
                  onChange={(e) => setNewMed({ ...newMed, color: e.target.value })}
                  style={{
                    width: '100%',
                    height: '60px',
                    borderRadius: '8px',
                    border: '2px solid #ddd',
                    cursor: 'pointer'
                  }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '1.1rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                  Emoji
                </label>
                <input
                  type="text"
                  value={newMed.icon}
                  onChange={(e) => setNewMed({ ...newMed, icon: e.target.value })}
                  placeholder="💊"
                  maxLength={2}
                  style={{
                    width: '100%',
                    fontSize: '2rem',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: '2px solid #ddd',
                    textAlign: 'center'
                  }}
                />
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleAddMedication}
              style={{ width: '100%', fontSize: '1.25rem', padding: '1.25rem' }}
            >
              ✅ Ruaj Barnin
            </button>
          </div>
        </div>
      )}

      {/* Custom medications list */}
      {customMeds.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
            📋 Barnat e Shtuara ({customMeds.length}):
          </h3>
          {customMeds.map((med) => (
            <div
              key={med.id}
              style={{
                background: '#F5F5F5',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '0.75rem',
                borderLeft: `4px solid ${med.color}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{med.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{med.name}</div>
                  <div style={{ fontSize: '1rem', color: '#666' }}>
                    {med.dose} • {med.time} • {med.timing}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(med.id)}
                  style={{
                    background: '#FF5252',
                    color: 'white',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    minHeight: 'auto'
                  }}
                >
                  🗑️ Fshij
                </button>
              </div>
              {med.instructions && (
                <div style={{ fontSize: '0.95rem', color: '#666', marginTop: '0.5rem' }}>
                  {med.instructions}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Refill/Stock Tracker Tab
function RefillTab() {
  const [stockItems] = useState([
    { name: 'Gliclada 60mg', remaining: 28, dailyUse: 1, daysLeft: 28 },
    { name: 'Madopar', remaining: 45, dailyUse: 1.5, daysLeft: 30 },
    { name: 'Pramipexole', remaining: 30, dailyUse: 1, daysLeft: 30 },
    { name: 'Maymetis', remaining: 56, dailyUse: 2, daysLeft: 28 },
    { name: 'Jardiance', remaining: 28, dailyUse: 1, daysLeft: 28 },
    { name: 'Aspirin', remaining: 28, dailyUse: 1, daysLeft: 28 },
    { name: 'Lyrica', remaining: 28, dailyUse: 1, daysLeft: 28 }
  ]);

  const getAlertLevel = (daysLeft: number) => {
    if (daysLeft <= 5) return { color: '#D32F2F', text: '🚨 KRITIK', bg: '#FFEBEE' };
    if (daysLeft <= 10) return { color: '#F57C00', text: '⚠️ I ULËT', bg: '#FFF3E0' };
    return { color: '#388E3C', text: '✅ MIRË', bg: '#E8F5E9' };
  };

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div className="card" style={{ background: '#FFF3E0', borderLeft: '6px solid #F57C00' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          📦 Gjendja e Stokut
        </h2>
        <p style={{ fontSize: '1rem', color: '#666' }}>
          Ju njoftojmë kur mbeten vetëm 5 ditë barna.
        </p>
      </div>

      {stockItems.map((item, idx) => {
        const alert = getAlertLevel(item.daysLeft);
        return (
          <div
            key={idx}
            className="card"
            style={{
              marginTop: '1rem',
              background: alert.bg,
              borderLeft: `6px solid ${alert.color}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{item.name}</div>
                <div style={{ fontSize: '1.1rem', color: '#666', marginTop: '0.25rem' }}>
                  💊 {item.remaining} copë të mbetura
                </div>
              </div>
              <div style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: alert.color,
                padding: '0.5rem 0.75rem',
                background: 'white',
                borderRadius: '8px'
              }}>
                {alert.text}
              </div>
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: alert.color,
              textAlign: 'center',
              padding: '0.75rem',
              background: 'white',
              borderRadius: '8px'
            }}>
              {item.daysLeft} ditë të mbetura
            </div>
          </div>
        );
      })}

      <button
        className="btn-primary"
        onClick={() => alert('Veçoria "Shto stokun" do të aktivizohet së shpejti!')}
        style={{ width: '100%', marginTop: '1.5rem', fontSize: '1.25rem', padding: '1.25rem' }}
      >
        ➕ Shto stokun
      </button>
    </div>
  );
}

// Notifications Settings Tab
function NotificationsTab() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState(10);

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div className="card">
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          🔔 Cilësimet e Njoftimeve
        </h3>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              style={{ width: '28px', height: '28px' }}
            />
            <span>🔊 Aktivizo Tingullin</span>
          </label>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={vibrationEnabled}
              onChange={(e) => setVibrationEnabled(e.target.checked)}
              style={{ width: '28px', height: '28px' }}
            />
            <span>📳 Aktivizo Vibrimin</span>
          </label>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '1.25rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
            ⏰ Përsërit kujtuesin çdo:
          </label>
          <select
            value={reminderMinutes}
            onChange={(e) => setReminderMinutes(Number(e.target.value))}
            style={{
              width: '100%',
              fontSize: '1.25rem',
              padding: '1rem',
              borderRadius: '8px',
              border: '2px solid #ddd'
            }}
          >
            <option value={5}>5 minuta</option>
            <option value={10}>10 minuta</option>
            <option value={15}>15 minuta</option>
            <option value={30}>30 minuta</option>
          </select>
        </div>

        <button
          className="btn-primary"
          onClick={() => {
            alert('Cilësimet u ruajtën!');
          }}
          style={{ width: '100%', marginTop: '1rem', fontSize: '1.25rem', padding: '1.25rem' }}
        >
          💾 Ruaj Ndryshimet
        </button>
      </div>
    </div>
  );
}

// Display Settings Tab
function DisplayTab() {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>('extra-large');
  const [highContrast, setHighContrast] = useState(true);

  useEffect(() => {
    loadDisplaySettings();
  }, []);

  const loadDisplaySettings = async () => {
    const settings = await getSettings();
    if (settings) {
      setFontSize(settings.fontSize as 'normal' | 'large' | 'extra-large');
      setHighContrast(settings.highContrast);
    }
  };

  const handleSave = async () => {
    try {
      await updateSettings({ fontSize, highContrast });
      
      // Apply font size immediately
      document.body.className = `font-${fontSize}`;
      
      // Dispatch event to notify App.tsx
      window.dispatchEvent(new Event('fontSizeChanged'));
      
      alert('✅ Cilësimet u ruajtën! Ndryshimet u aplikuan.');
    } catch (error) {
      alert('❌ Gabim gjatë ruajtjes!');
    }
  };

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div className="card">
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          🎨 Cilësimet e Pamjes
        </h3>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '1.25rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
            📏 Madhësia e Shkrimit:
          </label>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value as 'normal' | 'large' | 'extra-large')}
            style={{
              width: '100%',
              fontSize: '1.25rem',
              padding: '1rem',
              borderRadius: '8px',
              border: '2px solid #ddd'
            }}
          >
            <option value="normal">Normal (më i vogël)</option>
            <option value="large">I Madh</option>
            <option value="extra-large">Shumë i Madh (Rekomanduar)</option>
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              style={{ width: '28px', height: '28px' }}
            />
            <span>🌓 Kontrast i Lartë</span>
          </label>
        </div>

        <button
          className="btn-primary"
          onClick={handleSave}
          style={{ width: '100%', marginTop: '1rem', fontSize: '1.25rem', padding: '1.25rem' }}
        >
          💾 Ruaj Ndryshimet
        </button>
      </div>

      <div className="card" style={{ marginTop: '1.5rem', background: '#E3F2FD' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>
          💡 Këshilla
        </h3>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
          Kur ndryshoni madhësinë e shkrimit, klikoni "Ruaj Ndryshimet" për të parë efektin menjëherë.
        </p>
      </div>
    </div>
  );
}

// Backup & Export Tab
function BackupTab() {
  const handleExport = async () => {
    const success = await exportAllData();
    if (success) {
      alert('✅ Të dhënat u eksportuan me sukses!\n\nSkedari u shkarkua në pajisjen tuaj.');
    } else {
      alert('❌ Gabim gjatë eksportimit!');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const success = await importData(file);
    if (success) {
      alert('✅ Të dhënat u importuan me sukses!\n\nFaqja do të ringarkohet.');
      window.location.reload();
    } else {
      alert('❌ Gabim gjatë importimit!');
    }
  };

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div className="card" style={{ background: '#E8F5E9', borderLeft: '6px solid #388E3C' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          💾 Backup & Restore
        </h2>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
          Eksporto të dhënat për të mbajtur një kopje rezervë, ose importo një backup të mëparshëm.
        </p>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
          📤 Eksporto Të Dhënat
        </h3>
        <p style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#666' }}>
          Krijo një kopje rezervë të të gjitha të dhënave:
        </p>
        <ul style={{ fontSize: '1.1rem', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          <li>Logjet e barnave</li>
          <li>Matjet e sheqerit në gjak</li>
          <li>Raportet mjekësore</li>
          <li>Kontaktet urgjente</li>
          <li>Takimet me doktorë</li>
          <li>Ditari i shëndetit</li>
        </ul>
        <button
          onClick={handleExport}
          className="btn-primary"
          style={{ width: '100%', fontSize: '1.5rem', padding: '1.5rem' }}
        >
          📥 Shkarko Backup
        </button>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
          📥 Importo Të Dhënat
        </h3>
        <p style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#666' }}>
          Rivendos të dhënat nga një backup i mëparshëm.
        </p>
        <p style={{ fontSize: '1rem', color: '#C62828', marginBottom: '1rem', fontWeight: 600 }}>
          ⚠️ Kjo do të zëvendësojë të gjitha të dhënat aktuale!
        </p>
        <label style={{ width: '100%' }}>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
          <div className="btn-outline" style={{ 
            textAlign: 'center',
            fontSize: '1.5rem',
            padding: '1.5rem',
            cursor: 'pointer'
          }}>
            📂 Zgjidh Skedarin
          </div>
        </label>
      </div>

      <div className="card" style={{ marginTop: '1.5rem', background: '#FFF3E0' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>
          💡 Këshilla
        </h3>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
          • Bëni backup çdo muaj<br />
          • Ruani skedarin në vend të sigurt<br />
          • Mund ta dërgoni backup-in te familjarët
        </p>
      </div>
    </div>
  );
}

