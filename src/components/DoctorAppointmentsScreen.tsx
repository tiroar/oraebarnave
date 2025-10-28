import { useState, useEffect } from 'react';
import { db, DoctorAppointment } from '../db/database';
import { formatDateAlbanian } from '../utils/dateHelpers';

export function DoctorAppointmentsScreen() {
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAppt, setEditingAppt] = useState<DoctorAppointment | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    const allAppts = await db.doctorAppointments.orderBy('date').toArray();
    setAppointments(allAppts);
  };

  const upcomingAppointments = appointments
    .filter(a => !a.completed && new Date(a.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastAppointments = appointments
    .filter(a => a.completed || new Date(a.date) < new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const deleteAppointment = async (id: number) => {
    if (confirm('Fshi këtë takim?')) {
      await db.doctorAppointments.delete(id);
      await loadAppointments();
    }
  };

  const markAsCompleted = async (id: number) => {
    const summary = prompt('Çfarë u diskutua në këtë takim? (opsionale)');
    await db.doctorAppointments.update(id, {
      completed: true,
      summary: summary || undefined
    });
    await loadAppointments();
  };

  return (
    <div>
      <div className="header">
        <h1 style={{ textAlign: 'center', fontSize: '2rem', color: 'white' }}>
          👨‍⚕️ Takimet me Doktorë
        </h1>
      </div>

      <div className="container" style={{ paddingBottom: '120px' }}>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary"
          style={{ width: '100%', marginTop: '1.5rem', fontSize: '1.5rem', padding: '1.5rem' }}
        >
          ➕ Shto Takim të Ri
        </button>

        {/* Upcoming Appointments */}
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📅 Takime të Ardhshme
            {upcomingAppointments.length > 0 && (
              <span style={{ fontSize: '1.25rem', background: '#2196F3', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '20px' }}>
                {upcomingAppointments.length}
              </span>
            )}
          </h2>

          {upcomingAppointments.length === 0 ? (
            <div className="card" style={{ background: '#E8F5E9', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
              <p style={{ fontSize: '1.25rem' }}>Nuk ka takime të ardhshme</p>
            </div>
          ) : (
            upcomingAppointments.map(appt => (
              <div
                key={appt.id}
                className="card"
                style={{
                  marginBottom: '1rem',
                  borderLeft: '6px solid #2196F3'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      {appt.doctorName}
                    </div>
                    <div style={{ fontSize: '1.1rem', color: '#666', marginBottom: '0.25rem' }}>
                      🏥 {appt.specialty}
                    </div>
                  </div>
                </div>

                <div style={{
                  background: '#E3F2FD',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    📅 {formatDateAlbanian(new Date(appt.date))}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                    ⏰ {appt.time}
                  </div>
                  {appt.location && (
                    <div style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>
                      📍 {appt.location}
                    </div>
                  )}
                  {appt.phone && (
                    <button
                      onClick={() => window.location.href = `tel:${appt.phone}`}
                      className="btn-primary"
                      style={{ marginTop: '0.75rem', fontSize: '1.1rem', padding: '0.75rem' }}
                    >
                      📞 Telefono: {appt.phone}
                    </button>
                  )}
                </div>

                {appt.notes && (
                  <div style={{
                    background: '#FFF9C4',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    fontSize: '1.1rem'
                  }}>
                    <strong>📝 Shënime:</strong> {appt.notes}
                  </div>
                )}

                {appt.questionsToAsk && (
                  <div style={{
                    background: '#FFE0B2',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    fontSize: '1.1rem'
                  }}>
                    <strong>❓ Pyetje për doktorin:</strong><br />
                    {appt.questionsToAsk}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button
                    onClick={() => appt.id && markAsCompleted(appt.id)}
                    className="btn-primary"
                    style={{ flex: 1, fontSize: '1.1rem', padding: '0.75rem', background: '#4CAF50' }}
                  >
                    ✅ Kryer
                  </button>
                  <button
                    onClick={() => setEditingAppt(appt)}
                    className="btn-outline"
                    style={{ flex: 1, fontSize: '1.1rem', padding: '0.75rem' }}
                  >
                    ✏️ Ndrysho
                  </button>
                  <button
                    onClick={() => appt.id && deleteAppointment(appt.id)}
                    className="btn-outline"
                    style={{ fontSize: '1.1rem', padding: '0.75rem', background: '#FFEBEE', color: '#C62828' }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="btn-outline"
              style={{ width: '100%', fontSize: '1.25rem', padding: '1rem' }}
            >
              {showCompleted ? '👁️ Fshih' : '📜 Shiko'} Takimet e Kaluara ({pastAppointments.length})
            </button>

            {showCompleted && (
              <div style={{ marginTop: '1rem' }}>
                {pastAppointments.map(appt => (
                  <div
                    key={appt.id}
                    className="card"
                    style={{
                      marginBottom: '1rem',
                      borderLeft: '6px solid #757575',
                      opacity: 0.8
                    }}
                  >
                    <div style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      {appt.doctorName} - {appt.specialty}
                    </div>
                    <div style={{ fontSize: '1.1rem', color: '#666', marginBottom: '0.5rem' }}>
                      📅 {formatDateAlbanian(new Date(appt.date))} • ⏰ {appt.time}
                    </div>
                    {appt.summary && (
                      <div style={{
                        background: '#E8F5E9',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        marginTop: '0.75rem',
                        fontSize: '1.1rem'
                      }}>
                        <strong>💬 Përmbledhje:</strong> {appt.summary}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Form */}
        {(showAddForm || editingAppt) && (
          <AppointmentForm
            appointment={editingAppt}
            onSave={async (appt) => {
              if (editingAppt?.id) {
                await db.doctorAppointments.update(editingAppt.id, appt);
              } else {
                await db.doctorAppointments.add({ ...appt, completed: false });
              }
              await loadAppointments();
              setShowAddForm(false);
              setEditingAppt(null);
            }}
            onCancel={() => {
              setShowAddForm(false);
              setEditingAppt(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

interface AppointmentFormProps {
  appointment: DoctorAppointment | null;
  onSave: (appt: Omit<DoctorAppointment, 'id' | 'completed'>) => void;
  onCancel: () => void;
}

function AppointmentForm({ appointment, onSave, onCancel }: AppointmentFormProps) {
  const [doctorName, setDoctorName] = useState(appointment?.doctorName || '');
  const [specialty, setSpecialty] = useState(appointment?.specialty || '');
  const [date, setDate] = useState(appointment?.date || '');
  const [time, setTime] = useState(appointment?.time || '');
  const [location, setLocation] = useState(appointment?.location || '');
  const [phone, setPhone] = useState(appointment?.phone || '');
  const [notes, setNotes] = useState(appointment?.notes || '');
  const [questionsToAsk, setQuestionsToAsk] = useState(appointment?.questionsToAsk || '');

  const handleSubmit = () => {
    if (!doctorName || !specialty || !date || !time) {
      alert('Ju lutem plotësoni të paktën emrin, specialitetin, datën dhe orën!');
      return;
    }
    onSave({
      doctorName,
      specialty,
      date,
      time,
      location: location || undefined,
      phone: phone || undefined,
      notes: notes || undefined,
      questionsToAsk: questionsToAsk || undefined
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
        <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>
          {appointment ? '✏️ Ndrysho Takimin' : '➕ Shto Takim të Ri'}
        </h2>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '1.25rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
            Emri i Doktorit: *
          </label>
          <input
            type="text"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            placeholder="p.sh. Dr. Ahmed"
            style={{
              width: '100%',
              fontSize: '1.25rem',
              padding: '1rem',
              borderRadius: '8px',
              border: '2px solid #ddd'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '1.25rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
            Specialiteti: *
          </label>
          <input
            type="text"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            placeholder="p.sh. Endokrinolog"
            style={{
              width: '100%',
              fontSize: '1.25rem',
              padding: '1rem',
              borderRadius: '8px',
              border: '2px solid #ddd'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ fontSize: '1.25rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
              Data: *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: '100%',
                fontSize: '1.25rem',
                padding: '1rem',
                borderRadius: '8px',
                border: '2px solid #ddd'
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '1.25rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
              Ora: *
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{
                width: '100%',
                fontSize: '1.25rem',
                padding: '1rem',
                borderRadius: '8px',
                border: '2px solid #ddd'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '1.25rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
            Vendndodhja:
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="p.sh. Klinika SHÊNDETËSIA"
            style={{
              width: '100%',
              fontSize: '1.25rem',
              padding: '1rem',
              borderRadius: '8px',
              border: '2px solid #ddd'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '1.25rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
            Telefoni:
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="p.sh. +383 44 123 456"
            style={{
              width: '100%',
              fontSize: '1.25rem',
              padding: '1rem',
              borderRadius: '8px',
              border: '2px solid #ddd'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '1.25rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
            Shënime:
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Shënime shtesë..."
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

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '1.25rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
            Pyetje për doktorin:
          </label>
          <textarea
            value={questionsToAsk}
            onChange={(e) => setQuestionsToAsk(e.target.value)}
            placeholder="Çfarë doni të pyesni doktorin?"
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
            style={{ flex: 1, fontSize: '1.25rem', padding: '1.25rem' }}
          >
            ✅ Ruaj
          </button>
          <button
            onClick={onCancel}
            className="btn-outline"
            style={{ flex: 1, fontSize: '1.25rem', padding: '1.25rem' }}
          >
            ❌ Anulo
          </button>
        </div>
      </div>
    </div>
  );
}

